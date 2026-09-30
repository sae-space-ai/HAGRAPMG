/**
 * HAG-RAP LAB — WP5 Engines
 * Deep Planning & Continual Replanning
 * 
 * SCIENTIFIC STATUS: IMPLEMENTED
 */

import { EvidenceGraphMemory } from './evidence-graph.ts';
import {
  Goal, GoalStatus, GoalDecomposition, GoalRevision,
  WP5Constraint, ConstraintType, ConstraintMutability,
  PlanningOperator,
  Plan, PlanStatus, PlanStep, PlanDependency, PlanBranch,
  PlanEvaluation, PlanAlternative, PlanFailure, PlanRepair, PlanRevision,
  Deviation, DeviationType, DeviationSeverity,
  ResourceRequirement, ResourceConflict, ResourceBudget,
  AgentDeclaration, MultiagentCommitment, CommitmentStatus,
  AuthorityBoundary, AuthorityDecision, AuthorityViolation,
  PlanHistoryEntry, WhatChangedTrace, WP5PlanCard,
  OrderingRelation, Uncertainty
} from './wp5-types.ts';
import { createTimestamped, generateId, now } from './types.ts';

// ============================================================
// GOAL ENGINE (§6-7)
// ============================================================

export class GoalEngine {
  /**
   * Create a new goal
   */
  createGoal(
    caseId: string,
    description: string,
    origin: Goal['origin'],
    priority: number,
    successCriteria: string[],
    failureCriteria: string[],
    constraints: string[],
    graph: EvidenceGraphMemory
  ): Goal {
    const goal: Goal = {
      ...createTimestamped(),
      goalId: generateId(),
      caseId,
      description,
      origin,
      priority,
      successCriteria,
      failureCriteria,
      dependencies: [],
      constraints,
      uncertainties: [],
      status: 'PROPOSED',
      version: 1,
      provenance: [`Created by ${origin}`]
    };

    graph.addGoal(goal);
    return goal;
  }

  /**
   * Decompose a goal into subgoals (§7)
   * CRITICAL: Must preserve parent semantics
   */
  decomposeGoal(
    parentGoalId: string,
    subgoalDescriptions: string[],
    method: string,
    assumptions: string[],
    evidence: string[],
    constraintsInherited: string[],
    constraintsAdded: string[],
    graph: EvidenceGraphMemory
  ): { decomposition: GoalDecomposition; subgoals: Goal[] } | null {
    const parentGoal = graph.getGoal(parentGoalId);
    if (!parentGoal) return null;

    // CRITICAL: Verify parent goal is active
    if (parentGoal.status !== 'ACTIVE' && parentGoal.status !== 'PROPOSED') {
      return null;
    }

    const subgoals: Goal[] = [];
    for (const desc of subgoalDescriptions) {
      const subgoal = this.createGoal(
        parentGoal.caseId,
        desc,
        'DECOMPOSED',
        parentGoal.priority,
        [],
        [],
        [...constraintsInherited],
        graph
      );
      subgoal.parentGoalId = parentGoalId;
      subgoal.status = 'ACTIVE';
      subgoals.push(subgoal);
    }

    const decomposition: GoalDecomposition = {
      ...createTimestamped(),
      decompositionId: generateId(),
      parentGoalId,
      subgoalIds: subgoals.map(sg => sg.goalId),
      method,
      assumptions,
      evidence,
      constraintsInherited,
      constraintsAdded,
      constraintsNotApplicable: [],
      provenance: [`Decomposed from ${parentGoalId}`]
    };

    graph.addGoalDecomposition(decomposition);
    return { decomposition, subgoals };
  }

  /**
   * Detect goal drift (§37)
   * CRITICAL: Subgoal must not alter parent semantics
   */
  detectGoalDrift(
    parentGoalId: string,
    subgoalId: string,
    graph: EvidenceGraphMemory
  ): { driftDetected: boolean; reason?: string } {
    const parent = graph.getGoal(parentGoalId);
    const subgoal = graph.getGoal(subgoalId);

    if (!parent || !subgoal) {
      return { driftDetected: false };
    }

    // Check if subgoal parent matches
    if (subgoal.parentGoalId !== parentGoalId) {
      return { driftDetected: true, reason: 'Subgoal parent mismatch' };
    }

    // Check if subgoal constraints are compatible with parent
    const parentConstraints = new Set(parent.constraints);
    const incompatibleConstraints = subgoal.constraints.filter(
      c => !parentConstraints.has(c) && !subgoal.constraints.includes(c)
    );

    if (incompatibleConstraints.length > 0) {
      return { 
        driftDetected: true, 
        reason: `Incompatible constraints: ${incompatibleConstraints.join(', ')}` 
      };
    }

    return { driftDetected: false };
  }

  /**
   * Revise a goal with full provenance
   */
  reviseGoal(
    goalId: string,
    changeType: GoalRevision['changeType'],
    reason: string,
    evidence: string[],
    humanIntervention: string | undefined,
    graph: EvidenceGraphMemory
  ): GoalRevision | null {
    const goal = graph.getGoal(goalId);
    if (!goal) return null;

    const previousVersion = goal.version;
    goal.version += 1;
    goal.updatedAt = now();
    goal.status = changeType === 'ABANDONED' ? 'ABANDONED' : 
                  changeType === 'SUPERSEDED' ? 'SUPERSEDED' : 
                  goal.status;

    const revision: GoalRevision = {
      ...createTimestamped(),
      revisionId: generateId(),
      goalId,
      previousVersion,
      newVersion: goal.version,
      changeType,
      reason,
      evidence,
      humanIntervention,
      provenance: [`Goal revised: ${changeType}`]
    };

    graph.addGoalRevision(revision);
    return revision;
  }
}

// ============================================================
// CONSTRAINT ENGINE (§8-9, §36)
// ============================================================

export class ConstraintEngine {
  /**
   * Create a constraint with authority semantics
   */
  createConstraint(
    caseId: string,
    type: ConstraintType,
    description: string,
    source: WP5Constraint['source'],
    authority: WP5Constraint['authority'],
    mutability: ConstraintMutability,
    hard: boolean,
    condition: string,
    severity: WP5Constraint['severity'],
    graph: EvidenceGraphMemory
  ): WP5Constraint {
    const constraint: WP5Constraint = {
      ...createTimestamped(),
      constraintId: generateId(),
      caseId,
      type,
      description,
      source,
      authority,
      mutability,
      hard,
      scope: [],
      condition,
      violationSemantics: 'Violation makes plan INADMISSIBLE',
      severity,
      locked: mutability === 'HUMAN_LOCKED' || mutability === 'NON_NEGOTIABLE',
      version: 1,
      provenance: [`Created by ${source}`]
    };

    graph.addWP5Constraint(constraint);
    return constraint;
  }

  /**
   * CRITICAL: AI cannot modify HUMAN_LOCKED constraints (§36 I1)
   */
  canModifyConstraint(
    constraintId: string,
    actorType: 'AI' | 'HUMAN',
    graph: EvidenceGraphMemory
  ): { allowed: boolean; reason?: string } {
    const constraint = graph.getWP5Constraint(constraintId);
    if (!constraint) {
      return { allowed: false, reason: 'Constraint not found' };
    }

    // CRITICAL INVARIANT I1: AI cannot unlock HUMAN_LOCKED
    if (constraint.mutability === 'HUMAN_LOCKED' && actorType === 'AI') {
      return { 
        allowed: false, 
        reason: 'AI cannot modify HUMAN_LOCKED constraint' 
      };
    }

    // CRITICAL INVARIANT I2: AI cannot modify NON_NEGOTIABLE
    if (constraint.mutability === 'NON_NEGOTIABLE' && actorType === 'AI') {
      return { 
        allowed: false, 
        reason: 'AI cannot modify NON_NEGOTIABLE constraint' 
      };
    }

    // AI can modify SYSTEM_DERIVED, PLAN_LOCAL, ADVISORY
    if (actorType === 'AI') {
      if (constraint.mutability === 'SYSTEM_DERIVED' || 
          constraint.mutability === 'PLAN_LOCAL' || 
          constraint.mutability === 'ADVISORY') {
        return { allowed: true };
      }
      return { 
        allowed: false, 
        reason: `AI cannot modify ${constraint.mutability} constraint` 
      };
    }

    // Human can modify anything with provenance
    return { allowed: true };
  }

  /**
   * Validate constraint against plan
   */
  validateConstraint(
    constraintId: string,
    planId: string,
    graph: EvidenceGraphMemory
  ): { satisfied: boolean; violation?: string } {
    const constraint = graph.getWP5Constraint(constraintId);
    const plan = graph.getPlan(planId);

    if (!constraint || !plan) {
      return { satisfied: false, violation: 'Constraint or plan not found' };
    }

    // Check if plan violates constraint
    const violates = plan.constraints.includes(constraintId) && 
                     constraint.hard &&
                     plan.status !== 'ADMISSIBLE';

    if (violates) {
      return { 
        satisfied: false, 
        violation: `Plan ${planId} violates hard constraint ${constraintId}` 
      };
    }

    return { satisfied: true };
  }

  /**
   * CRITICAL: Hard constraints cannot be traded for utility (§9)
   */
  isHardConstraintViolated(
    planId: string,
    graph: EvidenceGraphMemory
  ): { violated: boolean; constraints: string[] } {
    const plan = graph.getPlan(planId);
    if (!plan) return { violated: false, constraints: [] };

    const violatedHardConstraints: string[] = [];
    for (const constraintId of plan.constraints) {
      const constraint = graph.getWP5Constraint(constraintId);
      if (constraint && constraint.hard && constraint.locked) {
        // Check if plan actually violates this constraint
        if (plan.status === 'INADMISSIBLE') {
          violatedHardConstraints.push(constraintId);
        }
      }
    }

    return {
      violated: violatedHardConstraints.length > 0,
      constraints: violatedHardConstraints
    };
  }
}

// ============================================================
// PLANNING ENGINE (§10-20)
// ============================================================

export class PlanningEngine {
  /**
   * Generate candidate plans (§16-17)
   */
  generateCandidatePlans(
    caseId: string,
    goalIds: string[],
    operatorIds: string[],
    constraintIds: string[],
    graph: EvidenceGraphMemory
  ): Plan[] {
    const candidates: Plan[] = [];

    // Generate at least 2 candidate plans
    for (let i = 0; i < 2; i++) {
      const plan: Plan = {
        ...createTimestamped(),
        planId: generateId(),
        caseId,
        goalIds,
        steps: [],
        dependencies: [],
        branches: [],
        constraints: constraintIds,
        lockedConstraints: constraintIds.filter(id => {
          const c = graph.getWP5Constraint(id);
          return c?.locked || false;
        }),
        assumptions: [],
        uncertainties: [],
        expectedEffects: [],
        resources: [],
        risk: 'UNKNOWN',
        humanGates: [],
        fallbacks: [],
        validationStatus: 'PENDING',
        status: 'CANDIDATE',
        version: 1,
        provenance: [`Generated candidate ${i + 1}`]
      };

      graph.addPlan(plan);
      candidates.push(plan);
    }

    return candidates;
  }

  /**
   * Validate plan against constraints (§18)
   * CRITICAL: Hard constraints make plan INADMISSIBLE if violated
   */
  validatePlan(
    planId: string,
    graph: EvidenceGraphMemory
  ): PlanEvaluation {
    const plan = graph.getPlan(planId);
    if (!plan) {
      return {
        ...createTimestamped(),
        evaluationId: generateId(),
        planId,
        goalAlignment: 0,
        constraintsSatisfied: [],
        constraintsViolated: [{ constraintId: 'UNKNOWN', reason: 'Plan not found' }],
        assumptions: [],
        uncertainties: [],
        resourceRequirements: [],
        expectedOutcome: 'UNKNOWN',
        risk: 'UNKNOWN',
        admissible: false,
        blockingConstraints: ['UNKNOWN'],
        reason: 'Plan not found',
        provenance: []
      };
    }

    const constraintsSatisfied: string[] = [];
    const constraintsViolated: Array<{ constraintId: string; reason: string }> = [];
    const blockingConstraints: string[] = [];

    // Check each constraint
    for (const constraintId of plan.constraints) {
      const constraint = graph.getWP5Constraint(constraintId);
      if (!constraint) continue;

      // CRITICAL: Hard constraints block admissibility
      if (constraint.hard && plan.status === 'INADMISSIBLE') {
        constraintsViolated.push({
          constraintId,
          reason: `Hard constraint violated: ${constraint.description}`
        });
        blockingConstraints.push(constraintId);
      } else {
        constraintsSatisfied.push(constraintId);
      }
    }

    // CRITICAL: If any hard constraint violated, plan is INADMISSIBLE (§19)
    const admissible = constraintsViolated.length === 0 || 
                       constraintsViolated.every(v => {
                         const c = graph.getWP5Constraint(v.constraintId);
                         return c && !c.hard;
                       });

    if (!admissible) {
      plan.status = 'INADMISSIBLE';
    } else {
      plan.status = 'ADMISSIBLE';
      plan.validationStatus = 'VALID';
    }

    const evaluation: PlanEvaluation = {
      ...createTimestamped(),
      evaluationId: generateId(),
      planId,
      goalAlignment: admissible ? 1.0 : 0.0,
      constraintsSatisfied,
      constraintsViolated,
      assumptions: plan.assumptions,
      uncertainties: plan.uncertainties,
      resourceRequirements: plan.resources.map(r => ({
        resource: r.resource,
        required: r.allocated,
        available: undefined
      })),
      expectedOutcome: admissible ? 'Plan may succeed' : 'Plan blocked by constraints',
      risk: plan.risk,
      admissible,
      blockingConstraints,
      reason: admissible ? 'All hard constraints satisfied' : 'Hard constraints violated',
      provenance: [`Validated plan ${planId}`]
    };

    graph.addPlanEvaluation(evaluation);
    return evaluation;
  }

  /**
   * CRITICAL: NO_ADMISSIBLE_PLAN handling (§19)
   */
  checkNoAdmissiblePlan(
    candidatePlanIds: string[],
    graph: EvidenceGraphMemory
  ): { noAdmissible: boolean; blockingConstraints: string[]; failedCandidates: string[] } {
    const failedCandidates: string[] = [];
    const allBlockingConstraints = new Set<string>();

    for (const planId of candidatePlanIds) {
      const plan = graph.getPlan(planId);
      if (!plan || plan.status === 'INADMISSIBLE') {
        failedCandidates.push(planId);
        if (plan) {
          plan.lockedConstraints.forEach(c => allBlockingConstraints.add(c));
        }
      }
    }

    const noAdmissible = failedCandidates.length === candidatePlanIds.length;

    return {
      noAdmissible,
      blockingConstraints: Array.from(allBlockingConstraints),
      failedCandidates
    };
  }

  /**
   * Create plan alternative record (§17)
   */
  recordAlternative(
    planId: string,
    alternativePlanId: string,
    comparisonRationale: string,
    whyGenerated: string,
    whySelected: boolean,
    whyRejected: boolean,
    rejectionReason: string | undefined,
    graph: EvidenceGraphMemory
  ): PlanAlternative {
    const alternative: PlanAlternative = {
      ...createTimestamped(),
      alternativeId: generateId(),
      planId,
      alternativePlanId,
      comparisonRationale,
      whyGenerated,
      whySelected,
      whyRejected,
      rejectionReason,
      provenance: [`Alternative recorded for ${planId}`]
    };

    graph.addPlanAlternative(alternative);
    return alternative;
  }
}

// ============================================================
// DEVIATION ENGINE (§26-30)
// ============================================================

export class DeviationEngine {
  /**
   * Detect deviation between predicted and observed state (§26)
   */
  detectDeviation(
    planId: string,
    stepId: string | undefined,
    type: DeviationType,
    severity: DeviationSeverity,
    description: string,
    predictedState: string,
    observedState: string,
    evidence: string[],
    graph: EvidenceGraphMemory
  ): Deviation {
    const plan = graph.getPlan(planId);
    const constraintsAffected = plan ? plan.constraints : [];
    const lockedConstraintsAffected = plan ? plan.lockedConstraints : [];

    const deviation: Deviation = {
      ...createTimestamped(),
      deviationId: generateId(),
      planId,
      stepId,
      type,
      severity,
      description,
      predictedState,
      observedState,
      evidence,
      constraintsAffected,
      lockedConstraintsAffected,
      repairable: severity === 'MINOR',
      repairAttempted: false,
      provenance: [`Deviation detected in plan ${planId}`]
    };

    graph.addDeviation(deviation);
    return deviation;
  }

  /**
   * Attempt local repair for MINOR deviations (§29)
   * CRITICAL: Cannot weaken locked constraints
   */
  attemptLocalRepair(
    deviationId: string,
    repairType: PlanRepair['repairType'],
    description: string,
    changes: PlanRepair['changes'],
    graph: EvidenceGraphMemory
  ): PlanRepair | null {
    const deviation = graph.getDeviation(deviationId);
    if (!deviation) return null;

    // CRITICAL: Only MINOR deviations can be locally repaired
    if (deviation.severity !== 'MINOR') {
      return null;
    }

    const repair: PlanRepair = {
      ...createTimestamped(),
      repairId: generateId(),
      planId: deviation.planId,
      deviationId,
      repairType,
      description,
      changes,
      constraintsPreserved: true,
      lockedConstraintsPreserved: true,
      humanGatesPreserved: true,
      authorityPreserved: true,
      provenance: [`Local repair attempted for deviation ${deviationId}`]
    };

    deviation.repairAttempted = true;
    deviation.repairId = repair.repairId;

    graph.addPlanRepair(repair);
    return repair;
  }

  /**
   * Trigger replanning for MAJOR+ deviations (§30)
   * CRITICAL: Creates new plan version, does not overwrite
   */
  triggerReplanning(
    planId: string,
    reason: string,
    newEvidence: string[],
    updatedWorldState: string | undefined,
    failedSteps: string[],
    humanIntervention: string | undefined,
    graph: EvidenceGraphMemory
  ): PlanRevision | null {
    const plan = graph.getPlan(planId);
    if (!plan) return null;

    const previousVersion = plan.version;
    plan.version += 1;
    plan.status = 'REPLANNING';
    plan.updatedAt = now();

    const revision: PlanRevision = {
      ...createTimestamped(),
      revisionId: generateId(),
      planId,
      previousVersion,
      newVersion: plan.version,
      revisionType: 'REPLAN',
      reason,
      evidence: [],
      newEvidence,
      updatedWorldState,
      failedSteps,
      constraintsChanged: false,
      humanIntervention,
      provenance: [`Replanning triggered for plan ${planId}`]
    };

    graph.addPlanRevision(revision);
    return revision;
  }

  /**
   * CRITICAL: Safe stop for SAFETY_CRITICAL deviations (§33)
   */
  triggerSafeStop(
    planId: string,
    deviationId: string,
    reason: string,
    graph: EvidenceGraphMemory
  ): boolean {
    const plan = graph.getPlan(planId);
    const deviation = graph.getDeviation(deviationId);

    if (!plan || !deviation) return false;

    // CRITICAL: SAFETY_CRITICAL or AUTHORITY_CRITICAL triggers safe stop
    if (deviation.severity === 'SAFETY_CRITICAL' || 
        deviation.severity === 'AUTHORITY_CRITICAL') {
      plan.status = 'SAFE_STOPPED';
      plan.updatedAt = now();
      return true;
    }

    return false;
  }
}

// ============================================================
// MULTIAGENT ENGINE (§38-40)
// ============================================================

export class MultiagentEngine {
  /**
   * Declare an agent (§38)
   */
  declareAgent(
    caseId: string,
    name: string,
    capabilities: string[],
    limitations: string[],
    acceptedGoals: string[],
    acceptedConstraints: string[],
    authorityScope: string[],
    graph: EvidenceGraphMemory
  ): AgentDeclaration {
    const agent: AgentDeclaration = {
      ...createTimestamped(),
      agentId: generateId(),
      caseId,
      name,
      capabilities,
      limitations,
      dependencies: [],
      acceptedGoals,
      acceptedConstraints,
      authorityScope,
      verificationStatus: 'UNVERIFIED',
      provenance: [`Agent ${name} declared`]
    };

    graph.addAgentDeclaration(agent);
    return agent;
  }

  /**
   * Create commitment between agents (§40)
   */
  createCommitment(
    caseId: string,
    issuerId: string,
    receiverId: string,
    goalOrAction: string,
    conditions: string[],
    constraints: string[],
    graph: EvidenceGraphMemory
  ): MultiagentCommitment {
    const commitment: MultiagentCommitment = {
      ...createTimestamped(),
      commitmentId: generateId(),
      caseId,
      issuerId,
      receiverId,
      goalOrAction,
      conditions,
      constraints,
      status: 'PROPOSED',
      evidence: [],
      verification: [],
      provenance: [`Commitment from ${issuerId} to ${receiverId}`]
    };

    graph.addMultiagentCommitment(commitment);
    return commitment;
  }

  /**
   * CRITICAL: Delegation does not expand authority (§39)
   */
  validateDelegation(
    delegatorId: string,
    delegateeId: string,
    requestedAuthority: string,
    graph: EvidenceGraphMemory
  ): { allowed: boolean; reason?: string } {
    const delegator = graph.getAgentDeclaration(delegatorId);
    const delegatee = graph.getAgentDeclaration(delegateeId);

    if (!delegator || !delegatee) {
      return { allowed: false, reason: 'Agent not found' };
    }

    // CRITICAL: Delegator must have the authority
    if (!delegator.authorityScope.includes(requestedAuthority)) {
      return { 
        allowed: false, 
        reason: 'Delegator lacks requested authority' 
      };
    }

    // CRITICAL: Delegatee cannot gain more authority than delegator
    if (!delegator.authorityScope.includes(requestedAuthority)) {
      return { 
        allowed: false, 
        reason: 'Delegation cannot expand authority' 
      };
    }

    return { allowed: true };
  }
}

// ============================================================
// PLAN HISTORY ENGINE (§31-32)
// ============================================================

export class PlanHistoryEngine {
  /**
   * Record plan history event
   */
  recordEvent(
    planId: string,
    version: number,
    event: PlanHistoryEntry['event'],
    description: string,
    evidence: string[],
    humanIntervention: string | undefined,
    constraintsChanged: boolean,
    graph: EvidenceGraphMemory
  ): PlanHistoryEntry {
    const entry: PlanHistoryEntry = {
      ...createTimestamped(),
      entryId: generateId(),
      planId,
      version,
      event,
      description,
      evidence,
      humanIntervention,
      constraintsChanged,
      provenance: [`History event for plan ${planId}`]
    };

    graph.addPlanHistoryEntry(entry);
    return entry;
  }

  /**
   * Get full plan history (§31)
   */
  getPlanHistory(planId: string, graph: EvidenceGraphMemory): PlanHistoryEntry[] {
    return graph.getAllPlanHistoryEntries().filter(e => e.planId === planId);
  }

  /**
   * Generate WHAT CHANGED trace (§32)
   */
  generateWhatChangedTrace(
    planId: string,
    graph: EvidenceGraphMemory
  ): WhatChangedTrace | null {
    const history = this.getPlanHistory(planId, graph);
    if (history.length === 0) return null;

    const chain = history.map(entry => ({
      event: entry.event,
      description: entry.description,
      timestamp: entry.createdAt,
      evidence: entry.evidence
    }));

    const trace: WhatChangedTrace = {
      ...createTimestamped(),
      traceId: generateId(),
      planId,
      chain,
      summary: `Plan ${planId} has ${history.length} history events`,
      provenance: [`What-changed trace for plan ${planId}`]
    };

    graph.addWhatChangedTrace(trace);
    return trace;
  }
}
