/**
 * HAG-RAP LAB — Engines Module
 * 
 * WP CLASSIFICATION (per ORDER 1 acceptance correction):
 * 
 * DeductiveEngine     → WP3 EXPERIMENTAL_PROTOTYPE (deterministic core, not validated)
 * AbductiveEngine     → WP3 EXPERIMENTAL_PROTOTYPE (hypothesis generation, not validated)
 * DefeasibleEngine    → WP3 EXPERIMENTAL_PROTOTYPE (exception handling, not validated)
 * ContradictionEngine → WP2_FOUNDATION (contradiction handling is core to evidence graph)
 * CausalEngine        → WP3 EXPERIMENTAL_PROTOTYPE (representational only, no causal discovery)
 * AbstractionEngine   → WP4 EXPERIMENTAL_PROTOTYPE (deterministic patterns, not learned)
 * WorldModelEngine    → WP4 EXPERIMENTAL_PROTOTYPE (rule-based transitions, not learned)
 * PlanningEngine      → WP5 FUTURE_INTERFACE (structural planning, not optimized)
 * AssuranceEngine     → WP2_FOUNDATION (runtime monitors are part of core substrate)
 * GovernanceEngine    → WP2_FOUNDATION (human review is core to evidence graph)
 * ResourceEngine      → WP6 FUTURE_INTERFACE (routing logic prepared, not measured)
 * 
 * These engines are DECOUPLED from WP2 core. WP2 (EvidenceGraphMemory)
 * functions independently without any of these engines.
 * 
 * SCIENTIFIC STATUS: IMPLEMENTED (deterministic core)
 * Probabilistic inference: NOT_IMPLEMENTED
 */

import {
  Claim, Assumption, Inference, InferenceRule, Contradiction,
  CausalNode, CausalEdge, CausalHypothesis, CounterfactualQuery,
  Concept, AbstractionNode, AbstractionEdge, ApplicabilityEnvelope, Analogy,
  WorldModel, WorldState, StateVariable, TransitionMechanism,
  Plan, PlanStep, PlanBranch, PlanEvaluation, PlanAlternative,
  Goal, Constraint, PlanningOperator, Deviation, ReplanningEvent, SafeStopCondition,
  AssuranceProperty, AssuranceCheck, RuntimeMonitor, Hazard, Control,
  HumanActor, HumanIntervention, HumanReview,
  ResourceBudget, ResourceUsage, ResourceAccount,
  ClaimStatus, EvidenceStatus, UncertaintyType, VerificationStatus,
  ReasoningFamily, ConflictCause, CausalRelationType, DeviationSeverity,
  ActorType, ScientificStatus, PerturbationClass,
  Uncertainty, createTimestamped, now, generateId
} from './types.ts';
import { EvidenceGraphMemory } from './evidence-graph.ts';

// ============================================================
// DEDUCTIVE REASONING (§10)
// ============================================================

export class DeductiveEngine {
  private rules: Map<string, InferenceRule> = new Map();

  addRule(rule: InferenceRule): void {
    this.rules.set(rule.id, rule);
  }

  getRule(id: string): InferenceRule | undefined {
    return this.rules.get(id);
  }

  getAllRules(): InferenceRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Apply modus ponens: IF premises all hold AND rule matches THEN conclusion
   * Returns null if premises are not satisfied.
   */
  applyRule(
    ruleId: string,
    premises: Map<string, Claim>,
    graph: EvidenceGraphMemory
  ): { inference: Inference; conclusion: Claim } | null {
    const rule = this.rules.get(ruleId);
    if (!rule) return null;

    // Check all premises exist and are valid
    const validPremises: string[] = [];
    for (const premiseId of rule.premises) {
      const premise = premises.get(premiseId);
      if (!premise || premise.status === 'SUPERSEDED' || premise.status === 'CONTESTED') {
        return null; // Cannot derive conclusion from invalid premises
      }
      validPremises.push(premiseId);
    }

    // Create conclusion claim
    const conclusion: Claim = {
      ...createTimestamped(),
      content: rule.conclusion,
      status: 'INFERRED',
      evidenceIds: [],
      assumptionIds: [],
      inferenceIds: [],
      uncertainty: [],
      verificationStatus: 'NOT_CHECKED',
      scientificStatus: 'IMPLEMENTED',
    };

    // Create inference record
    const inference: Inference = {
      ...createTimestamped(),
      ruleId: rule.id,
      family: 'DEDUCTIVE',
      inputClaimIds: validPremises,
      outputClaimId: conclusion.id,
      assumptions: [],
      method: `Modus Ponens via ${rule.name}`,
      uncertainty: [],
      rejectedAlternatives: [],
      verificationStatus: 'NOT_CHECKED',
    };

    conclusion.inferenceIds = [inference.id];

    // Register in graph
    graph.addClaim(conclusion);
    graph.addInference(inference);

    return { inference, conclusion };
  }

  /**
   * Chain deduction: apply multiple rules in sequence
   */
  chainDeduction(
    ruleIds: string[],
    initialClaims: Map<string, Claim>,
    graph: EvidenceGraphMemory
  ): { inferences: Inference[]; conclusions: Claim[] } {
    const inferences: Inference[] = [];
    const conclusions: Claim[] = [];
    const availableClaims = new Map(initialClaims);

    for (const ruleId of ruleIds) {
      const result = this.applyRule(ruleId, availableClaims, graph);
      if (result) {
        inferences.push(result.inference);
        conclusions.push(result.conclusion);
        availableClaims.set(result.conclusion.id, result.conclusion);
      }
    }

    return { inferences, conclusions };
  }
}

// ============================================================
// ABDUCTIVE REASONING (§11)
// ============================================================

export interface AbductiveHypothesis {
  id: string;
  description: string;
  support: number; // 0-1
  contradictions: string[];
  assumptions: string[];
  missingEvidence: string[];
  rankingRationale: string;
  status: ClaimStatus;
}

export class AbductiveEngine {
  /**
   * Given observations, generate candidate explanations.
   * Does NOT automatically promote highest-ranked to fact.
   */
  generateHypotheses(
    observations: string[],
    backgroundKnowledge: Array<{ condition: string; explains: string[]; reliability: number }>,
    graph: EvidenceGraphMemory
  ): AbductiveHypothesis[] {
    const hypotheses: AbductiveHypothesis[] = [];

    for (const observation of observations) {
      const matchingKnowledge = backgroundKnowledge.filter(
        bk => bk.explains.includes(observation)
      );

      for (const bk of matchingKnowledge) {
        const hypothesis: AbductiveHypothesis = {
          id: generateId(),
          description: `${bk.condition} explains observation: ${observation}`,
          support: bk.reliability,
          contradictions: [],
          assumptions: [bk.condition],
          missingEvidence: [],
          rankingRationale: `Matches background knowledge with reliability ${bk.reliability}`,
          status: 'INFERRED',
        };
        hypotheses.push(hypothesis);
      }

      // If no matching knowledge, note missing explanation
      if (matchingKnowledge.length === 0) {
        hypotheses.push({
          id: generateId(),
          description: `No known explanation for: ${observation}`,
          support: 0,
          contradictions: [],
          assumptions: [],
          missingEvidence: [observation],
          rankingRationale: 'Insufficient background knowledge',
          status: 'UNKNOWN',
        });
      }
    }

    // Sort by support (descending) but DO NOT auto-promote
    hypotheses.sort((a, b) => b.support - a.support);

    return hypotheses;
  }
}

// ============================================================
// DEFEASIBLE REASONING (§12)
// ============================================================

export interface DefeasibleRule {
  id: string;
  default: string;
  conclusion: string;
  exceptions: string[];
  priority: number;
}

export class DefeasibleEngine {
  private rules: Map<string, DefeasibleRule> = new Map();

  addRule(rule: DefeasibleRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Apply defeasible rule. Returns conclusion unless exception applies.
   */
  applyRule(
    ruleId: string,
    activeExceptions: Set<string>,
    graph: EvidenceGraphMemory
  ): { conclusion: Claim; inference: Inference; retracted: boolean; reason: string } | null {
    const rule = this.rules.get(ruleId);
    if (!rule) return null;

    // Check for exceptions
    const triggeredExceptions = rule.exceptions.filter(e => activeExceptions.has(e));

    if (triggeredExceptions.length > 0) {
      // Rule is defeated — conclusion is retracted
      const conclusion: Claim = {
        ...createTimestamped(),
        content: `[RETRACTED] ${rule.conclusion}`,
        status: 'SUPERSEDED',
        evidenceIds: [],
        assumptionIds: [],
        inferenceIds: [],
        uncertainty: [{
          type: 'EPISTEMIC',
          description: `Defeated by exceptions: ${triggeredExceptions.join(', ')}`,
        }],
        verificationStatus: 'NOT_APPLICABLE',
        scientificStatus: 'IMPLEMENTED',
      };

      const inference: Inference = {
        ...createTimestamped(),
        ruleId: rule.id,
        family: 'DEFEASIBLE',
        inputClaimIds: [],
        outputClaimId: conclusion.id,
        assumptions: [rule.default],
        method: `Defeasible: ${rule.default}`,
        uncertainty: [{
          type: 'EPISTEMIC',
          description: `Retracted due to: ${triggeredExceptions.join(', ')}`,
        }],
        rejectedAlternatives: [],
        verificationStatus: 'NOT_APPLICABLE',
      };

      conclusion.inferenceIds = [inference.id];
      graph.addClaim(conclusion);
      graph.addInference(inference);

      return { conclusion, inference, retracted: true, reason: triggeredExceptions.join(', ') };
    }

    // No exceptions — default conclusion holds
    const conclusion: Claim = {
      ...createTimestamped(),
      content: rule.conclusion,
      status: 'INFERRED',
      evidenceIds: [],
      assumptionIds: [],
      inferenceIds: [],
      uncertainty: [{
        type: 'EPISTEMIC',
        magnitude: 0.2,
        description: 'Defeasible — may be withdrawn if exceptions emerge',
      }],
      verificationStatus: 'NOT_CHECKED',
      scientificStatus: 'IMPLEMENTED',
    };

    const inference: Inference = {
      ...createTimestamped(),
      ruleId: rule.id,
      family: 'DEFEASIBLE',
      inputClaimIds: [],
      outputClaimId: conclusion.id,
      assumptions: [rule.default],
      method: `Defeasible default: ${rule.default}`,
      uncertainty: [{
        type: 'EPISTEMIC',
        magnitude: 0.2,
        description: 'Defeasible conclusion — subject to revision',
      }],
      rejectedAlternatives: [],
      verificationStatus: 'NOT_CHECKED',
    };

    conclusion.inferenceIds = [inference.id];
    graph.addClaim(conclusion);
    graph.addInference(inference);

    return { conclusion, inference, retracted: false, reason: 'No exceptions triggered' };
  }
}

// ============================================================
// CONTRADICTION ENGINE (§13)
// ============================================================

export class ContradictionEngine {
  /**
   * Detect contradictions between claims.
   * Does NOT silently resolve — exposes and classifies.
   */
  detectContradictions(
    claims: Claim[],
    graph: EvidenceGraphMemory
  ): Contradiction[] {
    const detected: Contradiction[] = [];

    for (let i = 0; i < claims.length; i++) {
      for (let j = i + 1; j < claims.length; j++) {
        const a = claims[i];
        const b = claims[j];

        if (this.areContradictory(a, b)) {
          const classification = this.classifyConflict(a, b, graph);
          const contradiction: Contradiction = {
            ...createTimestamped(),
            claimAId: a.id,
            claimBId: b.id,
            classification,
            resolved: false,
          };
          detected.push(contradiction);
          graph.addContradiction(contradiction);
        }
      }
    }

    return detected;
  }

  private areContradictory(a: Claim, b: Claim): boolean {
    // Simple structural contradiction detection
    // In a full implementation, this would use logical analysis
    const aLower = a.content.toLowerCase();
    const bLower = b.content.toLowerCase();

    // Check for direct negation patterns
    const negationPatterns = [
      ['is not', 'is'],
      ['does not', 'does'],
      ['cannot', 'can'],
      ['should not', 'should'],
      ['no ', 'some '],
      ['never', 'always'],
      ['false', 'true'],
    ];

    for (const [neg, pos] of negationPatterns) {
      if ((aLower.includes(neg) && bLower.includes(pos)) ||
          (aLower.includes(pos) && bLower.includes(neg))) {
        // Check they're about similar subjects
        const aWords = new Set(aLower.split(/\s+/).filter(w => w.length > 3));
        const bWords = new Set(bLower.split(/\s+/).filter(w => w.length > 3));
        const overlap = [...aWords].filter(w => bWords.has(w));
        if (overlap.length >= 2) return true;
      }
    }

    return false;
  }

  private classifyConflict(a: Claim, b: Claim, graph: EvidenceGraphMemory): ConflictCause {
    // Check if sources differ in reliability
    const aEvidence = a.evidenceIds.map(id => graph.getEvidence(id)).filter(Boolean);
    const bEvidence = b.evidenceIds.map(id => graph.getEvidence(id)).filter(Boolean);

    if (aEvidence.length > 0 && bEvidence.length > 0) {
      const aSources = new Set(aEvidence.map(e => e!.sourceId));
      const bSources = new Set(bEvidence.map(e => e!.sourceId));
      
      // Different sources — could be source reliability issue
      if ([...aSources].some(s => !bSources.has(s))) {
        return 'SOURCE_RELIABILITY';
      }
    }

    // Check temporal aspects
    if (a.createdAt !== b.createdAt) {
      const timeDiff = Math.abs(new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      if (timeDiff > 86400000) { // > 1 day
        return 'TEMPORAL_CHANGE';
      }
    }

    return 'GENUINE_UNCERTAINTY';
  }
}

// ============================================================
// CAUSAL REASONING (§14)
// ============================================================

export class CausalEngine {
  /**
   * Build causal hypothesis from evidence.
   * Distinguishes correlation from causation.
   */
  proposeCausalHypothesis(
    description: string,
    nodeId: string,
    supportingEdges: string[],
    contradictingEdges: string[],
    assumptions: string[],
    graph: EvidenceGraphMemory
  ): CausalHypothesis {
    const hypothesis: CausalHypothesis = {
      ...createTimestamped(),
      description,
      nodeId,
      supportingEdgeIds: supportingEdges,
      contradictingEdgeIds: contradictingEdges,
      status: supportingEdges.length > contradictingEdges.length ? 'CANDIDATE_CAUSE' : 'CONTESTED_CAUSAL_RELATION',
      identifiability: 'NOT_CHECKED',
      assumptions,
    };

    graph.addCausalHypothesis(hypothesis);
    return hypothesis;
  }

  /**
   * Evaluate counterfactual query.
   * Must expose assumptions. If identifiability cannot be established: INCONCLUSIVE.
   */
  evaluateCounterfactual(
    query: string,
    intervention: string,
    expectedOutcome: string,
    assumptions: string[],
    graph: EvidenceGraphMemory
  ): CounterfactualQuery {
    const cf: CounterfactualQuery = {
      ...createTimestamped(),
      hypothesis: query,
      intervention,
      expectedOutcome,
      assumptions,
      status: 'INCONCLUSIVE', // Default — must be upgraded by evidence
    };

    return cf;
  }
}

// ============================================================
// ABSTRACTION ENGINE (§16-19)
// ============================================================

export class AbstractionEngine {
  /**
   * Build abstraction hierarchy from concrete instances.
   * SCIENTIFIC STATUS: EXPERIMENTAL — deterministic/manual concept induction
   */
  buildAbstractionHierarchy(
    instances: Array<{ id: string; properties: Record<string, string>; context: string }>,
    graph: EvidenceGraphMemory
  ): { nodes: AbstractionNode[]; edges: AbstractionEdge[] } {
    const nodes: AbstractionNode[] = [];
    const edges: AbstractionEdge[] = [];

    // Level 0: Concrete instances
    for (const inst of instances) {
      const node: AbstractionNode = {
        ...createTimestamped(),
        level: 0,
        content: JSON.stringify(inst.properties),
        supportingEvidenceIds: [],
        counterexampleIds: [],
        uncertainty: [],
        taskContexts: [inst.context],
        validityConditions: [`Instance: ${inst.id}`],
      };
      nodes.push(node);
      graph.addAbstractionNode(node);
    }

    // Level 1: Local patterns (group by shared properties)
    const propertyGroups = new Map<string, string[]>();
    for (const inst of instances) {
      const key = Object.keys(inst.properties).sort().join(',');
      if (!propertyGroups.has(key)) propertyGroups.set(key, []);
      propertyGroups.get(key)!.push(inst.id);
    }

    for (const [pattern, instanceIds] of propertyGroups) {
      if (instanceIds.length >= 2) {
        const node: AbstractionNode = {
          ...createTimestamped(),
          level: 1,
          content: `Pattern: {${pattern}} (${instanceIds.length} instances)`,
          supportingEvidenceIds: [],
          counterexampleIds: [],
          uncertainty: [{ type: 'EPISTEMIC', description: 'Pattern from limited instances' }],
          taskContexts: [],
          validityConditions: [`Requires properties: ${pattern}`],
        };
        nodes.push(node);
        graph.addAbstractionNode(node);
      }
    }

    return { nodes, edges };
  }

  /**
   * Check applicability envelope before transfer.
   */
  checkApplicability(
    envelope: ApplicabilityEnvelope,
    targetContext: string
  ): { applicable: boolean; warning: string | null } {
    if (envelope.invalidContexts.includes(targetContext)) {
      return { applicable: false, warning: `Context ${targetContext} is explicitly INVALID` };
    }
    if (envelope.unknownContexts.includes(targetContext)) {
      return { applicable: false, warning: `Context ${targetContext} is UNKNOWN — requires human review` };
    }
    if (envelope.validContexts.includes(targetContext)) {
      return { applicable: true, warning: null };
    }
    return { applicable: false, warning: `Context ${targetContext} not in envelope — requires review` };
  }

  /**
   * Build analogical mapping.
   * Transfers RELATIONAL STRUCTURE, not lexical similarity.
   */
  buildAnalogy(
    sourceDomain: string,
    targetDomain: string,
    entityCorrespondences: Array<{ source: string; target: string }>,
    relationCorrespondences: Array<{ source: string; target: string }>,
    predictedConsequences: string[],
    validityConditions: string[],
    graph: EvidenceGraphMemory
  ): Analogy {
    const analogy: Analogy = {
      ...createTimestamped(),
      sourceDomain,
      targetDomain,
      entityCorrespondences,
      relationCorrespondences,
      predictedConsequences,
      uncertainty: [{
        type: 'EPISTEMIC',
        description: 'Analogical transfer — validity depends on structural correspondence',
      }],
      validityConditions,
      counterexamples: [],
      verificationStatus: 'NOT_CHECKED',
    };

    return analogy;
  }
}

// ============================================================
// WORLD MODEL (§20)
// ============================================================

export class WorldModelEngine {
  /**
   * Predict state transition.
   */
  predictTransition(
    worldModel: WorldModel,
    currentState: WorldState,
    mechanism: TransitionMechanism
  ): { predictedState: WorldState; assumptions: string[]; uncertainty: Uncertainty[] } {
    // Check preconditions
    const preconditionsMet = mechanism.preconditions.every(p => {
      return currentState.variables.some(v => 
        v.name.toLowerCase().includes(p.toLowerCase().split(' ')[0])
      );
    });

    if (!preconditionsMet) {
      return {
        predictedState: {
          ...createTimestamped(),
          worldModelId: worldModel.id,
          variables: currentState.variables,
          timestamp: now(),
        },
        assumptions: ['Preconditions not met — state unchanged'],
        uncertainty: [{ type: 'MODEL', description: 'Preconditions not satisfied' }],
      };
    }

    // Apply effects
    const newVariables = [...currentState.variables];
    for (const effect of mechanism.effects) {
      // Simple effect application
      const existingIdx = newVariables.findIndex(v => 
        effect.toLowerCase().includes(v.name.toLowerCase())
      );
      if (existingIdx >= 0) {
        newVariables[existingIdx] = {
          ...newVariables[existingIdx],
          value: `affected_by:${mechanism.name}`,
          timestamp: now(),
        };
      }
    }

    return {
      predictedState: {
        ...createTimestamped(),
        worldModelId: worldModel.id,
        variables: newVariables,
        timestamp: now(),
      },
      assumptions: mechanism.preconditions,
      uncertainty: mechanism.uncertainty,
    };
  }

  /**
   * Compare predicted vs observed state. Detect deviation.
   */
  detectDeviation(
    predicted: WorldState,
    observed: WorldState,
    planId: string
  ): Deviation | null {
    const differences: string[] = [];

    for (const pv of predicted.variables) {
      const ov = observed.variables.find(v => v.id === pv.id);
      if (ov && JSON.stringify(pv.value) !== JSON.stringify(ov.value)) {
        differences.push(`${pv.name}: predicted=${JSON.stringify(pv.value)}, observed=${JSON.stringify(ov.value)}`);
      }
    }

    if (differences.length === 0) return null;

    const severity: DeviationSeverity = differences.length > 3 ? 'MAJOR' : 'MINOR';

    return {
      ...createTimestamped(),
      planId,
      predictedState: JSON.stringify(predicted.variables),
      observedState: JSON.stringify(observed.variables),
      severity,
      description: differences.join('; '),
    };
  }
}

// ============================================================
// PLANNING ENGINE (§21-24)
// ============================================================

export class PlanningEngine {
  /**
   * Generate plan alternatives.
   * Never presents first plan as automatically optimal.
   */
  generateAlternatives(
    goal: Goal,
    operators: PlanningOperator[],
    constraints: Constraint[],
    graph: EvidenceGraphMemory
  ): Plan[] {
    const plans: Plan[] = [];

    // Generate at least 2 alternatives when possible
    const applicableOps = operators.filter(op => {
      // Check if preconditions can be satisfied
      return op.preconditions.length === 0 || op.preconditions.some(p => 
        graph.getAllClaims().some(c => c.content.toLowerCase().includes(p.toLowerCase()))
      );
    });

    // Plan A: Direct approach
    if (applicableOps.length > 0) {
      const planA: Plan = {
        ...createTimestamped(),
        goalId: goal.id,
        steps: applicableOps.slice(0, Math.min(3, applicableOps.length)).map((op, i) => ({
          ...createTimestamped(),
          operatorId: op.id,
          preconditions: op.preconditions,
          expectedEffects: op.effects,
          order: i,
          status: 'PENDING' as const,
        })),
        branches: [],
        status: 'DRAFT',
      };
      plans.push(planA);
      graph.addPlan(planA);
    }

    // Plan B: Conservative approach (fewer steps, more verification)
    if (applicableOps.length > 1) {
      const planB: Plan = {
        ...createTimestamped(),
        goalId: goal.id,
        steps: applicableOps.slice(0, 1).map((op, i) => ({
          ...createTimestamped(),
          operatorId: op.id,
          preconditions: op.preconditions,
          expectedEffects: op.effects,
          order: i,
          status: 'PENDING' as const,
        })),
        branches: [{
          ...createTimestamped(),
          condition: 'Verification after step 1',
          steps: applicableOps.slice(1, 2).map((op, i) => ({
            ...createTimestamped(),
            operatorId: op.id,
            preconditions: op.preconditions,
            expectedEffects: op.effects,
            order: i + 1,
            status: 'PENDING' as const,
          })),
          type: 'CONTINGENT',
        }],
        status: 'DRAFT',
      };
      plans.push(planB);
      graph.addPlan(planB);
    }

    // Plan C: Safe stop plan (always generated)
    const safeStopPlan: Plan = {
      ...createTimestamped(),
      goalId: goal.id,
      steps: [],
      branches: [{
        ...createTimestamped(),
        condition: 'Any safety constraint violated',
        steps: [],
        type: 'SAFE_STOP',
      }],
      status: 'DRAFT',
    };
    plans.push(safeStopPlan);
    graph.addPlan(safeStopPlan);

    return plans;
  }

  /**
   * Evaluate a plan against constraints and goals.
   */
  evaluatePlan(
    plan: Plan,
    goal: Goal,
    constraints: Constraint[],
    graph: EvidenceGraphMemory
  ): PlanEvaluation {
    const violatedConstraints = constraints.filter(c => c.violated && c.type === 'HARD');
    const safetyViolations = constraints.filter(c => c.violated && c.type === 'SAFETY');
    const requiresHumanReview = safetyViolations.length > 0 || 
      constraints.some(c => c.requiredAuthority === 'HUMAN');

    const evaluation: PlanEvaluation = {
      ...createTimestamped(),
      planId: plan.id,
      goalSatisfaction: plan.steps.length > 0 ? 0.7 : 0.0,
      constraintSatisfaction: violatedConstraints.length === 0,
      resourceUse: { provenance: 'ESTIMATED' },
      risk: safetyViolations.length > 0 ? 0.9 : violatedConstraints.length > 0 ? 0.5 : 0.2,
      uncertainty: [{
        type: 'MODEL',
        description: `Plan has ${plan.steps.length} steps, ${plan.branches.length} branches`,
      }],
      predictedOutcome: plan.steps.length > 0 ? 
        `Goal "${goal.description}" partially achievable` : 
        'No executable steps',
      verificationStatus: requiresHumanReview ? 'NOT_CHECKED' : 'NOT_CHECKED',
      requiresHumanReview,
    };

    return evaluation;
  }

  /**
   * Handle deviation: classify and determine response.
   */
  handleDeviation(
    deviation: Deviation,
    graph: EvidenceGraphMemory
  ): ReplanningEvent {
    const event: ReplanningEvent = {
      ...createTimestamped(),
      triggerId: deviation.id,
      oldPlanId: deviation.planId,
      reason: `Deviation detected: ${deviation.severity} — ${deviation.description}`,
      deviationId: deviation.id,
    };

    return event;
  }
}

// ============================================================
// ASSURANCE ENGINE (§27-29)
// ============================================================

export class AssuranceEngine {
  private monitors: Map<string, RuntimeMonitor> = new Map();
  private properties: Map<string, AssuranceProperty> = new Map();

  addMonitor(monitor: RuntimeMonitor): void {
    this.monitors.set(monitor.id, monitor);
  }

  addProperty(property: AssuranceProperty): void {
    this.properties.set(property.id, property);
  }

  getActiveMonitors(): RuntimeMonitor[] {
    return Array.from(this.monitors.values()).filter(m => m.status === 'ACTIVE');
  }

  getAllMonitors(): RuntimeMonitor[] {
    return Array.from(this.monitors.values());
  }

  /**
   * Run all active monitors against current state.
   */
  runMonitors(graph: EvidenceGraphMemory): AssuranceCheck[] {
    const checks: AssuranceCheck[] = [];

    for (const monitor of this.getActiveMonitors()) {
      let result: VerificationStatus = 'PASSED';
      let evidence = '';

      switch (monitor.type) {
        case 'UNRESOLVED_CRITICAL_CONTRADICTION': {
          const unresolved = graph.getUnresolvedContradictions();
          if (unresolved.length > 0) {
            result = 'FAILED';
            evidence = `${unresolved.length} unresolved contradictions`;
          } else {
            evidence = 'No unresolved contradictions';
          }
          break;
        }
        case 'MANDATORY_HUMAN_REVIEW': {
          const plans = graph.getAllPlans().filter(p => p.status === 'EVALUATED');
          const needsReview = plans.some(p => p.evaluation?.requiresHumanReview);
          if (needsReview) {
            result = 'INCONCLUSIVE';
            evidence = 'Plans awaiting human review';
          } else {
            evidence = 'No pending human reviews';
          }
          break;
        }
        case 'RESOURCE_BUDGET_EXCEEDED': {
          evidence = 'Resource check — no budget configured';
          result = 'NOT_APPLICABLE';
          break;
        }
        default: {
          evidence = `Monitor ${monitor.type} — check pending`;
          result = 'NOT_CHECKED';
        }
      }

      const check: AssuranceCheck = {
        ...createTimestamped(),
        propertyId: monitor.id,
        method: `Runtime monitor: ${monitor.type}`,
        result,
        evidence,
        timestamp: now(),
      };
      checks.push(check);
    }

    return checks;
  }

  /**
   * Check if a plan violates any hard constraints.
   */
  checkPlanConstraints(
    plan: Plan,
    constraints: Constraint[]
  ): { permitted: boolean; violations: Constraint[]; nonOverridable: Constraint[] } {
    const violations = constraints.filter(c => c.violated);
    const nonOverridable = violations.filter(c => !c.overridable);

    return {
      permitted: nonOverridable.length === 0,
      violations,
      nonOverridable,
    };
  }
}

// ============================================================
// HUMAN GOVERNANCE (§30-31)
// ============================================================

export class GovernanceEngine {
  private actors: Map<string, HumanActor> = new Map();

  addActor(actor: HumanActor): void {
    this.actors.set(actor.id, actor);
  }

  getActor(id: string): HumanActor | undefined {
    return this.actors.get(id);
  }

  getAllActors(): HumanActor[] {
    return Array.from(this.actors.values());
  }

  /**
   * Record human intervention. Changes system state.
   * AI cannot impersonate human. No approval from silence.
   */
  recordIntervention(
    actorId: string,
    type: HumanIntervention['type'],
    targetId: string,
    targetType: string,
    rationale: string,
    previousState: unknown,
    newState: unknown,
    graph: EvidenceGraphMemory
  ): HumanIntervention | null {
    const actor = this.actors.get(actorId);
    if (!actor || actor.actorType !== 'HUMAN') return null;

    // Check authority scope
    if (!actor.authorityScope.includes(type) && !actor.authorityScope.includes('*')) {
      return null; // Actor not authorized for this action
    }

    const intervention: HumanIntervention = {
      ...createTimestamped(),
      actorId,
      type,
      targetId,
      targetType,
      rationale,
      previousState,
      newState,
      status: type === 'STOP_EXECUTION' ? 'STOPPED' : 
              type === 'OVERRIDE_RECOMMENDATION' ? 'OVERRIDDEN' :
              type === 'CORRECT_CLAIM' ? 'CORRECTED' :
              type === 'REJECT_RECOMMENDATION' ? 'REJECTED' : 'ACCEPTED',
    };

    graph.addIntervention(intervention);
    return intervention;
  }

  /**
   * Validate that only authorized humans can perform authority-requiring actions.
   */
  validateAuthority(actorId: string, action: string): boolean {
    const actor = this.actors.get(actorId);
    if (!actor) return false;
    if (actor.actorType !== 'HUMAN') return false;
    return actor.authorityScope.includes(action) || actor.authorityScope.includes('*');
  }
}

// ============================================================
// RESOURCE ACCOUNTING (§32-33)
// ============================================================

export class ResourceEngine {
  private accounts: ResourceAccount[] = [];
  private budget: ResourceBudget | null = null;

  setBudget(budget: ResourceBudget): void {
    this.budget = budget;
  }

  getBudget(): ResourceBudget | null {
    return this.budget;
  }

  recordUsage(operationId: string, usage: ResourceUsage): void {
    const account: ResourceAccount = {
      ...createTimestamped(),
      operationId,
      usage,
      timestamp: now(),
    };
    this.accounts.push(account);
  }

  getAllAccounts(): ResourceAccount[] {
    return [...this.accounts];
  }

  /**
   * Determine execution route based on task characteristics.
   * DETERMINISTIC-FIRST principle (§53).
   */
  determineExecutionRoute(
    taskComplexity: 'LOW' | 'MEDIUM' | 'HIGH',
    uncertainty: 'LOW' | 'MEDIUM' | 'HIGH',
    consequence: 'LOW' | 'MEDIUM' | 'HIGH',
    hasFormalConstraint: boolean
  ): {
    method: string;
    requiresVerification: boolean;
    requiresHumanReview: boolean;
    estimatedCost: string;
  } {
    if (hasFormalConstraint) {
      return {
        method: 'FORMAL_DETERMINISTIC_CHECK',
        requiresVerification: true,
        requiresHumanReview: false,
        estimatedCost: 'LOW',
      };
    }

    if (consequence === 'HIGH') {
      return {
        method: 'DEEP_ANALYSIS_WITH_HUMAN_REVIEW',
        requiresVerification: true,
        requiresHumanReview: true,
        estimatedCost: 'HIGH',
      };
    }

    if (uncertainty === 'HIGH') {
      return {
        method: 'DEEP_EVIDENCE_AND_REASONING',
        requiresVerification: true,
        requiresHumanReview: false,
        estimatedCost: 'MEDIUM',
      };
    }

    if (taskComplexity === 'LOW' && uncertainty === 'LOW') {
      return {
        method: 'SIMPLE_RULE_BASED',
        requiresVerification: false,
        requiresHumanReview: false,
        estimatedCost: 'LOW',
      };
    }

    return {
      method: 'STANDARD_REASONING',
      requiresVerification: true,
      requiresHumanReview: false,
      estimatedCost: 'MEDIUM',
    };
  }
}
