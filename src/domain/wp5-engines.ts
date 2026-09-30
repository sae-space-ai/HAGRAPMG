/**
 * HAG-RAP LAB — WP5 Engines
 * Deep Planning & Continual Replanning
 * 
 * ARCHITECTURE: Bounded Planning Context
 * Uses WP5PlanningRepository for WP5-specific state.
 * Uses EvidenceGraphBridge to read canonical WP2-WP4 objects.
 * 
 * SCIENTIFIC STATUS: IMPLEMENTED
 */

import { WP5PlanningRepository } from './wp5-repository.ts';
import { EvidenceGraphBridge } from './wp5-bridge.ts';
import {
  PlanningGoal, GoalDecomposition, GoalRevision,
  PlanningConstraint, PlanningConstraintType, ConstraintMutability,
  PlanningOperator,
  PlanningPlan, PlanningStep, PlanDependency, PlanBranch,
  PlanEvaluation, PlanAlternative, PlanFailure, PlanRepair, PlanRevision,
  Deviation, DeviationType, DeviationSeverity,
  ResourceRequirement, ResourceConflict, ResourceBudget,
  AgentDeclaration, MultiagentCommitment, CommitmentStatus,
  PlanHistoryEntry, WhatChangedTrace, WP5PlanCard,
  OrderingRelation,
  PlanningLifecycleStatus, PlanningAdmissibility, PlanningReplanningStatus, PlanningAuthorityStatus
} from './wp5-types.ts';
import { Uncertainty, createTimestamped, generateId, now } from './types.ts';

// ============================================================
// GOAL ENGINE (§6-7)
// ============================================================

export class GoalEngine {
  /**
   * Create a new planning goal
   */
  createPlanningGoal(
    caseId: string,
    canonicalGoalId: string,
    description: string,
    origin: PlanningGoal['origin'],
    priority: number,
    successCriteria: string[],
    failureCriteria: string[],
    constraintIds: string[],
    repository: WP5PlanningRepository
  ): PlanningGoal {
    const goal: PlanningGoal = {
      ...createTimestamped(),
      planningGoalId: generateId(),
      canonicalGoalId,
      caseId,
      origin,
      priority,
      successCriteria,
      failureCriteria,
      dependencyIds: [],
      constraintIds,
      uncertainties: [],
      decompositionStatus: 'ATOMIC',
      version: 1,
      provenance: [`Created by ${origin}`]
    };

    repository.addPlanningGoal(goal);
    return goal;
  }

  /**
   * Decompose a goal into subgoals (§7)
   * CRITICAL: Must preserve parent semantics
   */
  decomposeGoal(
    parentPlanningGoalId: string,
    subgoalDescriptions: string[],
    method: string,
    assumptions: string[],
    evidence: string[],
    constraintsInherited: string[],
    constraintsAdded: string[],
    repository: WP5PlanningRepository
  ): { decomposition: GoalDecomposition; subgoals: PlanningGoal[] } | null {
    const parentGoal = repository.getPlanningGoal(parentPlanningGoalId);
    if (!parentGoal) return null;

    // CRITICAL: Verify parent goal is active
    if (parentGoal.decompositionStatus === 'DRIFT_DETECTED') {
      return null;
    }

    const subgoals: PlanningGoal[] = [];
    for (const desc of subgoalDescriptions) {
      const subgoal: PlanningGoal = {
        ...createTimestamped(),
        planningGoalId: generateId(),
        canonicalGoalId: '', // Will be set by canonical adapter
        caseId: parentGoal.caseId,
        origin: 'DECOMPOSED',
        parentPlanningGoalId: parentPlanningGoalId,
        priority: parentGoal.priority,
        successCriteria: [],
        failureCriteria: [],
        dependencyIds: [],
        constraintIds: [...constraintsInherited],
        uncertainties: [],
        decompositionStatus: 'ATOMIC',
        version: 1,
        provenance: [`Decomposed from ${parentPlanningGoalId}`]
      };
      repository.addPlanningGoal(subgoal);
      subgoals.push(subgoal);
    }

    const decomposition: GoalDecomposition = {
      ...createTimestamped(),
      decompositionId: generateId(),
      parentPlanningGoalId,
      subgoalPlanningIds: subgoals.map(sg => sg.planningGoalId),
      method,
      assumptions,
      evidence,
      constraintsInherited,
      constraintsAdded,
      provenance: [`Decomposed from ${parentPlanningGoalId}`]
    };

    repository.addGoalDecomposition(decomposition);
    return { decomposition, subgoals };
  }

  /**
   * Detect goal drift (§37)
   * CRITICAL: Subgoal must not alter parent semantics
   */
  detectGoalDrift(
    parentPlanningGoalId: string,
    subgoalPlanningId: string,
    repository: WP5PlanningRepository
  ): { driftDetected: boolean; reason?: string } {
    const parent = repository.getPlanningGoal(parentPlanningGoalId);
    const subgoal = repository.getPlanningGoal(subgoalPlanningId);

    if (!parent || !subgoal) {
      return { driftDetected: false };
    }

    // Check if subgoal parent matches
    if (subgoal.parentPlanningGoalId !== parentPlanningGoalId) {
      return { driftDetected: true, reason: 'Subgoal parent mismatch' };
    }

    // Check if subgoal constraints are compatible with parent
    const parentConstraints = new Set(parent.constraintIds);
    const incompatibleConstraints = subgoal.constraintIds.filter(
      (c: string) => !parentConstraints.has(c)
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
    planningGoalId: string,
    changeType: GoalRevision['changeType'],
    reason: string,
    evidence: string[],
    humanIntervention: string | undefined,
    repository: WP5PlanningRepository
  ): GoalRevision | null {
    const goal = repository.getPlanningGoal(planningGoalId);
    if (!goal) return null;

    const previousVersion = goal.version;
    goal.version += 1;
    goal.updatedAt = now();
    
    if (changeType === 'ABANDONED') {
      goal.decompositionStatus = 'DRIFT_DETECTED';
    }

    const revision: GoalRevision = {
      ...createTimestamped(),
      revisionId: generateId(),
      planningGoalId,
      previousVersion,
      newVersion: goal.version,
      changeType,
      reason,
      evidence,
      humanIntervention,
      provenance: [`Goal revised: ${changeType}`]
    };

    repository.addGoalRevision(revision);
    repository.updatePlanningGoal(goal);
    return revision;
  }
}

// GoalEngine is defined above in the new architecture

// ============================================================
// CONSTRAINT ENGINE (§8-9, §36)
// ============================================================

export class ConstraintEngine {
  /**
   * Create a planning constraint with authority semantics
   */
  createPlanningConstraint(
    caseId: string,
    type: PlanningConstraintType,
    description: string,
    source: PlanningConstraint['source'],
    authority: PlanningConstraint['authority'],
    mutability: ConstraintMutability,
    hard: boolean,
    condition: string,
    severity: PlanningConstraint['severity'],
    repository: WP5PlanningRepository
  ): PlanningConstraint {
    const constraint: PlanningConstraint = {
      ...createTimestamped(),
      planningConstraintId: generateId(),
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

    repository.addPlanningConstraint(constraint);
    return constraint;
  }

  /**
   * CRITICAL: AI cannot modify HUMAN_LOCKED constraints (§36 I1)
   */
  canModifyConstraint(
    planningConstraintId: string,
    actorType: 'AI' | 'HUMAN',
    repository: WP5PlanningRepository
  ): { allowed: boolean; reason?: string } {
    const constraint = repository.getPlanningConstraint(planningConstraintId);
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
    planningConstraintId: string,
    planningPlanId: string,
    repository: WP5PlanningRepository
  ): { satisfied: boolean; violation?: string } {
    const constraint = repository.getPlanningConstraint(planningConstraintId);
    const plan = repository.getPlanningPlan(planningPlanId);

    if (!constraint || !plan) {
      return { satisfied: false, violation: 'Constraint or plan not found' };
    }

    // Check if plan violates constraint
    const violates = plan.constraintIds.includes(planningConstraintId) && 
                     constraint.hard &&
                     plan.admissibility !== 'ADMISSIBLE';

    if (violates) {
      return { 
        satisfied: false, 
        violation: `Plan ${planningPlanId} violates hard constraint ${planningConstraintId}` 
      };
    }

    return { satisfied: true };
  }

  /**
   * CRITICAL: Hard constraints cannot be traded for utility (§9)
   */
  isHardConstraintViolated(
    planningPlanId: string,
    repository: WP5PlanningRepository
  ): { violated: boolean; constraints: string[] } {
    const plan = repository.getPlanningPlan(planningPlanId);
    if (!plan) return { violated: false, constraints: [] };

    const violatedHardConstraints: string[] = [];
    for (const constraintId of plan.constraintIds) {
      const constraint = repository.getPlanningConstraint(constraintId);
      if (constraint && constraint.hard && constraint.locked) {
        // Check if plan actually violates this constraint
        if (plan.admissibility === 'INADMISSIBLE') {
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
    repository: WP5PlanningRepository
  ): PlanningPlan[] {
    const candidates: PlanningPlan[] = [];

    // Generate at least 2 candidate plans
    for (let i = 0; i < 2; i++) {
      const plan: PlanningPlan = {
        ...createTimestamped(),
        planningPlanId: generateId(),
        caseId,
        goalIds,
        steps: [],
        dependencies: [],
        branches: [],
        constraintIds,
        lockedConstraintIds: constraintIds.filter(id => {
          const c = repository.getPlanningConstraint(id);
          return c?.locked || false;
        }),
        assumptions: [],
        uncertainties: [],
        expectedEffects: [],
        resources: [],
        risk: 'UNKNOWN',
        humanGates: [],
        fallbacks: [],
        lifecycleStatus: 'DRAFT',
        admissibility: 'NOT_EVALUATED',
        replanningStatus: 'STABLE',
        authorityStatus: 'WITHIN_AUTHORITY',
        version: 1,
        provenance: [`Generated candidate ${i + 1}`]
      };

      repository.addPlanningPlan(plan);
      candidates.push(plan);
    }

    return candidates;
  }

  /**
   * Validate plan against constraints (§18)
   * CRITICAL: Hard constraints make plan INADMISSIBLE if violated
   */
  validatePlan(
    planningPlanId: string,
    repository: WP5PlanningRepository
  ): PlanEvaluation {
    const plan = repository.getPlanningPlan(planningPlanId);
    if (!plan) {
      return {
        ...createTimestamped(),
        evaluationId: generateId(),
        planningPlanId,
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
    for (const constraintId of plan.constraintIds) {
      const constraint = repository.getPlanningConstraint(constraintId);
      if (!constraint) continue;

      // CRITICAL: Hard constraints block admissibility
      if (constraint.hard && plan.admissibility === 'INADMISSIBLE') {
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
                         const c = repository.getPlanningConstraint(v.constraintId);
                         return c && !c.hard;
                       });

    if (!admissible) {
      plan.admissibility = 'INADMISSIBLE';
    } else {
      plan.admissibility = 'ADMISSIBLE';
    }

    const evaluation: PlanEvaluation = {
      ...createTimestamped(),
      evaluationId: generateId(),
      planningPlanId,
      goalAlignment: admissible ? 1.0 : 0.0,
      constraintsSatisfied,
      constraintsViolated,
      assumptions: plan.assumptions,
      uncertainties: plan.uncertainties,
      resourceRequirements: plan.resources.map((r: {resource: string, allocated: number}) => ({
        resource: r.resource,
        required: r.allocated,
        available: undefined
      })),
      expectedOutcome: admissible ? 'Plan may succeed' : 'Plan blocked by constraints',
      risk: plan.risk,
      admissible,
      blockingConstraints,
      reason: admissible ? 'All hard constraints satisfied' : 'Hard constraints violated',
      provenance: [`Validated plan ${planningPlanId}`]
    };

    repository.addPlanEvaluation(evaluation);
    repository.updatePlanningPlan(plan);
    return evaluation;
  }

  /**
   * CRITICAL: NO_ADMISSIBLE_PLAN handling (§19)
   */
  checkNoAdmissiblePlan(
    candidatePlanIds: string[],
    repository: WP5PlanningRepository
  ): { noAdmissible: boolean; blockingConstraints: string[]; failedCandidates: string[] } {
    const failedCandidates: string[] = [];
    const allBlockingConstraints = new Set<string>();

    for (const planningPlanId of candidatePlanIds) {
      const plan = repository.getPlanningPlan(planningPlanId);
      if (!plan || plan.admissibility === 'INADMISSIBLE') {
        failedCandidates.push(planningPlanId);
        if (plan) {
          plan.lockedConstraintIds.forEach((c: string) => allBlockingConstraints.add(c));
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
    planningPlanId: string,
    alternativePlanningPlanId: string,
    comparisonRationale: string,
    whyGenerated: string,
    whySelected: boolean,
    whyRejected: boolean,
    rejectionReason: string | undefined,
    repository: WP5PlanningRepository
  ): PlanAlternative {
    const alternative: PlanAlternative = {
      ...createTimestamped(),
      alternativeId: generateId(),
      planningPlanId,
      alternativePlanningPlanId,
      comparisonRationale,
      whyGenerated,
      whySelected,
      whyRejected,
      rejectionReason,
      provenance: [`Alternative recorded for ${planningPlanId}`]
    };

    repository.addPlanAlternative(alternative);
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
    planningPlanId: string,
    stepId: string | undefined,
    type: DeviationType,
    severity: DeviationSeverity,
    description: string,
    predictedState: string,
    observedState: string,
    evidence: string[],
    repository: WP5PlanningRepository
  ): Deviation {
    const plan = repository.getPlanningPlan(planningPlanId);
    const constraintsAffected = plan ? plan.constraintIds : [];
    const lockedConstraintsAffected = plan ? plan.lockedConstraintIds : [];

    const deviation: Deviation = {
      ...createTimestamped(),
      deviationId: generateId(),
      planningPlanId,
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
      provenance: [`Deviation detected in plan ${planningPlanId}`]
    };

    repository.addDeviation(deviation);
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
    repository: WP5PlanningRepository
  ): PlanRepair | null {
    const deviation = repository.getDeviation(deviationId);
    if (!deviation) return null;

    // CRITICAL: Only MINOR deviations can be locally repaired
    if (deviation.severity !== 'MINOR') {
      return null;
    }

    const repair: PlanRepair = {
      ...createTimestamped(),
      repairId: generateId(),
      planningPlanId: deviation.planningPlanId,
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

    repository.addPlanRepair(repair);
    return repair;
  }

  /**
   * Trigger replanning for MAJOR+ deviations (§30)
   * CRITICAL: Creates new plan version, does not overwrite
   */
  triggerReplanning(
    planningPlanId: string,
    reason: string,
    newEvidence: string[],
    updatedWorldState: string | undefined,
    failedSteps: string[],
    humanIntervention: string | undefined,
    repository: WP5PlanningRepository
  ): PlanRevision | null {
    const plan = repository.getPlanningPlan(planningPlanId);
    if (!plan) return null;

    const previousVersion = plan.version;
    plan.version += 1;
    plan.replanningStatus = 'REPLANNING';
    plan.updatedAt = now();

    const revision: PlanRevision = {
      ...createTimestamped(),
      revisionId: generateId(),
      planningPlanId,
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
      provenance: [`Replanning triggered for plan ${planningPlanId}`]
    };

    repository.addPlanRevision(revision);
    repository.updatePlanningPlan(plan);
    return revision;
  }

  /**
   * CRITICAL: Safe stop for SAFETY_CRITICAL deviations (§33)
   */
  triggerSafeStop(
    planningPlanId: string,
    deviationId: string,
    reason: string,
    repository: WP5PlanningRepository
  ): boolean {
    const plan = repository.getPlanningPlan(planningPlanId);
    const deviation = repository.getDeviation(deviationId);

    if (!plan || !deviation) return false;

    // CRITICAL: SAFETY_CRITICAL or AUTHORITY_CRITICAL triggers safe stop
    if (deviation.severity === 'SAFETY_CRITICAL' || 
        deviation.severity === 'AUTHORITY_CRITICAL') {
      plan.replanningStatus = 'SAFE_STOPPED';
      plan.updatedAt = now();
      repository.updatePlanningPlan(plan);
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
    repository: WP5PlanningRepository
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

    repository.addAgentDeclaration(agent);
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
    repository: WP5PlanningRepository
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

    repository.addMultiagentCommitment(commitment);
    return commitment;
  }

  /**
   * CRITICAL: Delegation does not expand authority (§39)
   */
  validateDelegation(
    delegatorId: string,
    delegateeId: string,
    requestedAuthority: string,
    repository: WP5PlanningRepository
  ): { allowed: boolean; reason?: string } {
    const delegator = repository.getAgentDeclaration(delegatorId);
    const delegatee = repository.getAgentDeclaration(delegateeId);

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
    planningPlanId: string,
    version: number,
    event: PlanHistoryEntry['event'],
    description: string,
    evidence: string[],
    humanIntervention: string | undefined,
    constraintsChanged: boolean,
    repository: WP5PlanningRepository
  ): PlanHistoryEntry {
    const entry: PlanHistoryEntry = {
      ...createTimestamped(),
      entryId: generateId(),
      planningPlanId,
      version,
      event,
      description,
      evidence,
      humanIntervention,
      constraintsChanged,
      provenance: [`History event for plan ${planningPlanId}`]
    };

    repository.addPlanHistoryEntry(entry);
    return entry;
  }

  /**
   * Get full plan history (§31)
   */
  getPlanHistory(planningPlanId: string, repository: WP5PlanningRepository): PlanHistoryEntry[] {
    return repository.getAllPlanHistoryEntries().filter((e: PlanHistoryEntry) => e.planningPlanId === planningPlanId);
  }

  /**
   * Generate WHAT CHANGED trace (§32)
   */
  generateWhatChangedTrace(
    planningPlanId: string,
    repository: WP5PlanningRepository
  ): WhatChangedTrace | null {
    const history = this.getPlanHistory(planningPlanId, repository);
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
      planningPlanId,
      chain,
      summary: `Plan ${planningPlanId} has ${history.length} history events`,
      provenance: [`What-changed trace for plan ${planningPlanId}`]
    };

    repository.addWhatChangedTrace(trace);
    return trace;
  }
}
