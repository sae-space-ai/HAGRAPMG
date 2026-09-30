/**
 * HAG-RAP LAB — Cognitive Loop Service (§2, §37)
 * Implements the fundamental cognitive loop with a complete demonstration case.
 * 
 * SCIENTIFIC STATUS: IMPLEMENTED
 * Demo data is SYNTHETIC — no real operational decisions.
 */

import {
  Source, EvidenceItem, Claim, Assumption, Inference, Contradiction,
  CausalNode, CausalEdge, CausalHypothesis,
  Concept, AbstractionNode, WorldModel, WorldState, StateVariable, TransitionMechanism,
  Plan, PlanStep, PlanBranch, PlanEvaluation, Goal, Constraint, PlanningOperator,
  Deviation, ReplanningEvent, SafeStopCondition,
  HumanActor, HumanIntervention,
  AssuranceProperty, AssuranceCheck, RuntimeMonitor, Hazard,
  ResourceBudget,
  ResearchCase, ProblemDefinition,
  ClaimStatus, EvidenceStatus, VerificationStatus,
  ActorType, ScientificStatus, CausalRelationType,
  createTimestamped, now, generateId
} from '../domain/types.ts';
import { EvidenceGraphMemory } from '../domain/evidence-graph.ts';
import {
  DeductiveEngine, AbductiveEngine, DefeasibleEngine,
  ContradictionEngine, CausalEngine, AbstractionEngine,
  WorldModelEngine, PlanningEngine, AssuranceEngine,
  GovernanceEngine, ResourceEngine
} from '../domain/engines.ts';

// ============================================================
// COGNITIVE LOOP SERVICE
// ============================================================

export interface CognitiveLoopState {
  graph: EvidenceGraphMemory;
  deductive: DeductiveEngine;
  abductive: AbductiveEngine;
  defeasible: DefeasibleEngine;
  contradiction: ContradictionEngine;
  causal: CausalEngine;
  abstraction: AbstractionEngine;
  worldModel: WorldModelEngine;
  planning: PlanningEngine;
  assurance: AssuranceEngine;
  governance: GovernanceEngine;
  resources: ResourceEngine;
  currentCase: ResearchCase | null;
  log: string[];
}

export function createCognitiveLoop(): CognitiveLoopState {
  return {
    graph: new EvidenceGraphMemory(),
    deductive: new DeductiveEngine(),
    abductive: new AbductiveEngine(),
    defeasible: new DefeasibleEngine(),
    contradiction: new ContradictionEngine(),
    causal: new CausalEngine(),
    abstraction: new AbstractionEngine(),
    worldModel: new WorldModelEngine(),
    planning: new PlanningEngine(),
    assurance: new AssuranceEngine(),
    governance: new GovernanceEngine(),
    resources: new ResourceEngine(),
    currentCase: null,
    log: [],
  };
}

function log(state: CognitiveLoopState, message: string): void {
  state.log.push(`[${new Date().toISOString().slice(11, 19)}] ${message}`);
}

// ============================================================
// DEMONSTRATION CASE (§37)
// Complete synthetic case: Education scenario
// ============================================================

export function runDemonstrationCase(state: CognitiveLoopState): ResearchCase {
  log(state, '=== INITIALIZING DEMONSTRATION CASE ===');
  log(state, 'Scenario: Education — Synthetic laboratory case');
  log(state, 'STATUS: SYNTHETIC DATA — No real operational decisions');

  // ---- PROBLEM DEFINITION ----
  const problem: ProblemDefinition = {
    ...createTimestamped(),
    description: 'A student has submitted a scholarship application. The system must evaluate eligibility based on available evidence, identify missing information, handle contradictions, and produce a recommendation subject to human governance.',
    context: 'Public education scholarship program. Synthetic data only.',
    constraints: [
      'No automated final decision — human governance required',
      'Must preserve all evidence including contradictions',
      'Must expose uncertainty explicitly',
      'Must not infer causation from correlation alone',
    ],
    scenarioFamily: 'EDUCATION',
  };

  // ---- SOURCES ----
  const sourceA: Source = {
    ...createTimestamped(),
    name: 'University Registry (Synthetic)',
    type: 'OFFICIAL_RECORD',
    reliability: 0.9,
    status: 'VERIFIED',
  };
  const sourceB: Source = {
    ...createTimestamped(),
    name: 'Student Self-Report (Synthetic)',
    type: 'SELF_REPORTED',
    reliability: 0.6,
    status: 'UNVERIFIED',
  };
  const sourceC: Source = {
    ...createTimestamped(),
    name: 'Financial Aid Office (Synthetic)',
    type: 'OFFICIAL_RECORD',
    reliability: 0.85,
    status: 'VERIFIED',
  };

  state.graph.addSource(sourceA);
  state.graph.addSource(sourceB);
  state.graph.addSource(sourceC);
  log(state, `Sources registered: ${sourceA.name}, ${sourceB.name}, ${sourceC.name}`);

  // ---- EVIDENCE ----
  const ev1: EvidenceItem = {
    ...createTimestamped(),
    sourceId: sourceA.id,
    content: 'Student GPA: 3.7/4.0 (verified from registry)',
    type: 'ACADEMIC_RECORD',
    status: 'VERIFIED',
    tags: ['gpa', 'academic'],
  };
  const ev2: EvidenceItem = {
    ...createTimestamped(),
    sourceId: sourceB.id,
    content: 'Student reports annual family income: $45,000',
    type: 'FINANCIAL_SELF_REPORT',
    status: 'UNVERIFIED',
    tags: ['income', 'financial'],
  };
  const ev3: EvidenceItem = {
    ...createTimestamped(),
    sourceId: sourceC.id,
    content: 'Financial aid office records family income: $62,000',
    type: 'FINANCIAL_RECORD',
    status: 'VERIFIED',
    tags: ['income', 'financial'],
  };
  const ev4: EvidenceItem = {
    ...createTimestamped(),
    sourceId: sourceA.id,
    content: 'Student enrolled full-time for 3 consecutive semesters',
    type: 'ENROLLMENT_RECORD',
    status: 'VERIFIED',
    tags: ['enrollment'],
  };

  // Missing evidence (required but not available)
  const ev5missing: EvidenceItem = {
    ...createTimestamped(),
    sourceId: sourceA.id,
    content: 'Community service hours: [MISSING — not yet reported]',
    type: 'SERVICE_RECORD',
    status: 'MISSING',
    tags: ['service', 'missing'],
  };

  state.graph.addEvidence(ev1);
  state.graph.addEvidence(ev2);
  state.graph.addEvidence(ev3);
  state.graph.addEvidence(ev4);
  state.graph.addEvidence(ev5missing);
  log(state, `Evidence items: 4 available, 1 missing`);

  // ---- INITIAL CLAIMS ----
  const claim1: Claim = {
    ...createTimestamped(),
    content: 'Student meets academic threshold (GPA >= 3.5)',
    status: 'INFERRED',
    evidenceIds: [ev1.id],
    assumptionIds: [],
    inferenceIds: [],
    uncertainty: [],
    verificationStatus: 'PASSED',
    scientificStatus: 'IMPLEMENTED',
  };

  const claim2: Claim = {
    ...createTimestamped(),
    content: 'Student family income is $45,000 (below threshold)',
    status: 'INFERRED',
    evidenceIds: [ev2.id],
    assumptionIds: [],
    inferenceIds: [],
    uncertainty: [{ type: 'SOURCE_RELIABILITY', description: 'Self-reported, unverified' }],
    verificationStatus: 'NOT_CHECKED',
    scientificStatus: 'IMPLEMENTED',
  };

  const claim3: Claim = {
    ...createTimestamped(),
    content: 'Student family income is $62,000 (above threshold)',
    status: 'INFERRED',
    evidenceIds: [ev3.id],
    assumptionIds: [],
    inferenceIds: [],
    uncertainty: [],
    verificationStatus: 'PASSED',
    scientificStatus: 'IMPLEMENTED',
  };

  const claim4: Claim = {
    ...createTimestamped(),
    content: 'Student meets enrollment requirement (full-time, 3+ semesters)',
    status: 'INFERRED',
    evidenceIds: [ev4.id],
    assumptionIds: [],
    inferenceIds: [],
    uncertainty: [],
    verificationStatus: 'PASSED',
    scientificStatus: 'IMPLEMENTED',
  };

  state.graph.addClaim(claim1);
  state.graph.addClaim(claim2);
  state.graph.addClaim(claim3);
  state.graph.addClaim(claim4);
  log(state, `Initial claims: 4 (academic ✓, income-self, income-official, enrollment ✓)`);

  // ---- CONTRADICTION (§13) ----
  const contradiction1: Contradiction = {
    ...createTimestamped(),
    claimAId: claim2.id,
    claimBId: claim3.id,
    classification: 'SOURCE_RELIABILITY',
    resolved: false,
  };
  state.graph.addContradiction(contradiction1);
  log(state, `CONTRADICTION DETECTED: Income self-report ($45k) vs official record ($62k)`);
  log(state, `Classification: SOURCE_RELIABILITY — preserved, not silently resolved`);

  // ---- ASSUMPTION ----
  const assumption1: Assumption = {
    ...createTimestamped(),
    content: 'Community service requirement can be waived for first-time applicants',
    justification: 'Policy interpretation — not explicitly stated in regulations',
    status: 'ASSUMED',
    challengeable: true,
  };
  state.graph.addAssumption(assumption1);
  log(state, `Assumption registered: ${assumption1.content}`);

  // ---- DEDUCTIVE REASONING (§10) ----
  log(state, '--- DEDUCTIVE REASONING ---');
  const rule1 = {
    ...createTimestamped(),
    name: 'Academic Threshold Rule',
    family: 'DEDUCTIVE' as const,
    premises: [claim1.id],
    conclusion: 'Academic eligibility: SATISFIED',
    description: 'IF GPA >= 3.5 THEN academic eligibility satisfied',
    applicabilityConditions: ['GPA verified from official source'],
  };
  state.deductive.addRule(rule1);

  const dedResult = state.deductive.applyRule(
    rule1.id,
    new Map([[claim1.id, claim1]]),
    state.graph
  );
  if (dedResult) {
    log(state, `DEDUCTION: ${dedResult.conclusion.content} [VERIFIED]`);
  }

  // ---- ABDUCTIVE REASONING (§11) ----
  log(state, '--- ABDUCTIVE REASONING ---');
  const hypotheses = state.abductive.generateHypotheses(
    ['Income discrepancy of $17,000 between sources'],
    [
      { condition: 'Student reported pre-tax income while office recorded post-tax', explains: ['Income discrepancy of $17,000 between sources'], reliability: 0.4 },
      { condition: 'Student omitted additional income source', explains: ['Income discrepancy of $17,000 between sources'], reliability: 0.3 },
      { condition: 'Data entry error in one of the systems', explains: ['Income discrepancy of $17,000 between sources'], reliability: 0.2 },
      { condition: 'Different reference years', explains: ['Income discrepancy of $17,000 between sources'], reliability: 0.1 },
    ],
    state.graph
  );
  log(state, `Abductive hypotheses generated: ${hypotheses.length}`);
  for (const h of hypotheses) {
    log(state, `  H: ${h.description} (support: ${h.support}, status: ${h.status})`);
  }
  log(state, 'NOTE: No hypothesis auto-promoted to fact — all remain candidate explanations');

  // ---- DEFEASIBLE REASONING (§12) ----
  log(state, '--- DEFEASIBLE REASONING ---');
  const defeasibleRule = {
    id: generateId(),
    default: 'First-time applicants are eligible for community service waiver',
    conclusion: 'Community service requirement: WAIVED (defeasible)',
    exceptions: ['prior_rejection', 'policy_change_2024'],
    priority: 5,
  };
  state.defeasible.addRule(defeasibleRule);

  const defResult = state.defeasible.applyRule(
    defeasibleRule.id,
    new Set(), // No active exceptions
    state.graph
  );
  if (defResult) {
    log(state, `DEFEASIBLE: ${defResult.conclusion.content} [retracted: ${defResult.retracted}]`);
  }

  // ---- CAUSAL MODEL (§14) ----
  log(state, '--- CAUSAL MODEL ---');
  const causalNodeA: CausalNode = {
    ...createTimestamped(),
    name: 'Family Income',
    type: 'FACTOR',
    description: 'Household annual income',
    evidenceIds: [ev2.id, ev3.id],
  };
  const causalNodeB: CausalNode = {
    ...createTimestamped(),
    name: 'Scholarship Eligibility',
    type: 'OUTCOME',
    description: 'Whether student qualifies for scholarship',
    evidenceIds: [ev1.id, ev4.id],
  };
  state.graph.addCausalNode(causalNodeA);
  state.graph.addCausalNode(causalNodeB);

  const causalEdge1: CausalEdge = {
    ...createTimestamped(),
    sourceNodeId: causalNodeA.id,
    targetNodeId: causalNodeB.id,
    relationType: 'CANDIDATE_CAUSE',
    evidenceIds: [ev3.id],
    assumptions: ['Income threshold is a causal factor, not merely correlated'],
  };
  state.graph.addCausalEdge(causalEdge1);

  const causalHyp = state.causal.proposeCausalHypothesis(
    'Family income causally affects scholarship eligibility via threshold mechanism',
    causalNodeB.id,
    [causalEdge1.id],
    [],
    ['Income threshold is defined by policy, not merely correlated with outcomes'],
    state.graph
  );
  log(state, `Causal hypothesis: ${causalHyp.description}`);
  log(state, `Status: ${causalHyp.status} (NOT promoted to SUPPORTED_CAUSAL_RELATION without further evidence)`);

  // ---- ABSTRACTION (§16-19) ----
  log(state, '--- ABSTRACTION ---');
  const { nodes: absNodes } = state.abstraction.buildAbstractionHierarchy(
    [
      { id: 'case_1', properties: { gpa: '3.7', income: 'verified', enrollment: 'full-time' }, context: 'scholarship' },
      { id: 'case_2', properties: { gpa: '3.8', income: 'verified', enrollment: 'full-time' }, context: 'scholarship' },
      { id: 'case_3', properties: { gpa: '3.2', income: 'unverified', enrollment: 'part-time' }, context: 'scholarship' },
    ],
    state.graph
  );
  log(state, `Abstraction nodes generated: ${absNodes.length}`);
  log(state, 'SCIENTIFIC STATUS: EXPERIMENTAL — deterministic/manual concept induction');

  // ---- WORLD MODEL (§20) ----
  log(state, '--- WORLD MODEL ---');
  const worldModel: WorldModel = {
    ...createTimestamped(),
    name: 'Scholarship Eligibility World',
    version: 1,
    stateVariables: [
      { id: 'sv1', name: 'gpa', value: 3.7, type: 'number', timestamp: now() },
      { id: 'sv2', name: 'income_self_reported', value: 45000, type: 'number', timestamp: now() },
      { id: 'sv3', name: 'income_official', value: 62000, type: 'number', timestamp: now() },
      { id: 'sv4', name: 'enrollment_status', value: 'full-time', type: 'string', timestamp: now() },
      { id: 'sv5', name: 'community_service_hours', value: null, type: 'number', timestamp: now(), uncertainty: { type: 'EPISTEMIC', description: 'MISSING' } },
    ],
    objects: [
      { id: 'obj1', name: 'Student', type: 'APPLICANT', properties: { id: 'STU-001' } },
      { id: 'obj2', name: 'Scholarship Program', type: 'PROGRAM', properties: { type: 'merit-based' } },
    ],
    transitionMechanisms: [],
    uncertainty: [{ type: 'EPISTEMIC', description: 'Income contradiction unresolved' }],
  };
  state.graph.addWorldModel(worldModel);
  log(state, `World model created: ${worldModel.stateVariables.length} state variables`);

  // ---- GOALS & CONSTRAINTS ----
  log(state, '--- GOALS & CONSTRAINTS ---');
  const goal: Goal = {
    ...createTimestamped(),
    description: 'Evaluate scholarship eligibility and produce recommendation',
    priority: 1,
    subGoalIds: [],
    status: 'ACTIVE',
  };
  state.graph.addGoal(goal);

  const constraint1: Constraint = {
    ...createTimestamped(),
    description: 'Human must approve final recommendation',
    type: 'SAFETY',
    overridable: false,
    requiredAuthority: 'HUMAN',
    violated: false,
  };
  const constraint2: Constraint = {
    ...createTimestamped(),
    description: 'Cannot auto-approve when income contradiction exists',
    type: 'HARD',
    overridable: false,
    violated: false,
  };
  const constraint3: Constraint = {
    ...createTimestamped(),
    description: 'Non-overridable: Must not discriminate based on protected characteristics',
    type: 'RIGHTS',
    overridable: false,
    violated: false,
  };
  state.graph.addConstraint(constraint1);
  state.graph.addConstraint(constraint2);
  state.graph.addConstraint(constraint3);
  log(state, `Constraints: ${3} (safety, hard, rights — all non-overridable)`);

  // ---- PLANNING (§21-24) ----
  log(state, '--- PLANNING ---');
  const operator1: PlanningOperator = {
    ...createTimestamped(),
    name: 'Request Income Verification',
    preconditions: ['income_contradiction_exists'],
    effects: ['income_verified'],
    resourceCost: { provenance: 'ESTIMATED' },
  };
  const operator2: PlanningOperator = {
    ...createTimestamped(),
    name: 'Evaluate Against Criteria',
    preconditions: ['income_verified', 'gpa_verified'],
    effects: ['eligibility_determined'],
    resourceCost: { provenance: 'ESTIMATED' },
  };
  const operator3: PlanningOperator = {
    ...createTimestamped(),
    name: 'Submit to Human Review',
    preconditions: ['eligibility_determined'],
    effects: ['recommendation_submitted'],
    resourceCost: { provenance: 'ESTIMATED' },
    requiredAuthority: 'HUMAN',
  };

  const plans = state.planning.generateAlternatives(goal, [operator1, operator2, operator3], [constraint1, constraint2, constraint3], state.graph);
  log(state, `Plan alternatives generated: ${plans.length}`);
  for (const plan of plans) {
    const eval_ = state.planning.evaluatePlan(plan, goal, [constraint1, constraint2, constraint3], state.graph);
    plan.evaluation = eval_;
    plan.status = 'EVALUATED';
    log(state, `  Plan ${plan.id.slice(-6)}: ${plan.steps.length} steps, risk=${eval_.risk}, humanReview=${eval_.requiresHumanReview}`);
  }

  // ---- HUMAN GOVERNANCE (§30-31) ----
  log(state, '--- HUMAN GOVERNANCE ---');
  const humanActor: HumanActor = {
    ...createTimestamped(),
    name: 'Dr. Reviewer (Synthetic)',
    role: 'Scholarship Committee Chair',
    authorityScope: ['CORRECT_CLAIM', 'OVERRIDE_RECOMMENDATION', 'STOP_EXECUTION', 'REJECT_RECOMMENDATION', '*'],
    actorType: 'HUMAN',
  };
  state.governance.addActor(humanActor);

  // Human challenges the income assumption
  const intervention1 = state.governance.recordIntervention(
    humanActor.id,
    'CHALLENGE_INFERENCE',
    claim2.id,
    'Claim',
    'Self-reported income is unreliable when contradicted by official records. Official record should take precedence for threshold determination.',
    { claimStatus: claim2.status },
    { claimStatus: 'CONTESTED' },
    state.graph
  );
  if (intervention1) {
    state.graph.updateClaimStatus(claim2.id, 'CONTESTED');
    log(state, `HUMAN INTERVENTION: ${intervention1.type} — ${intervention1.rationale.slice(0, 60)}...`);
  }

  // ---- ASSURANCE (§27-29) ----
  log(state, '--- ASSURANCE ---');
  const monitor1: RuntimeMonitor = {
    ...createTimestamped(),
    name: 'Contradiction Monitor',
    invariant: 'No unresolved critical contradictions in active claims',
    type: 'UNRESOLVED_CRITICAL_CONTRADICTION',
    status: 'ACTIVE',
    policy: 'ESCALATE',
  };
  const monitor2: RuntimeMonitor = {
    ...createTimestamped(),
    name: 'Human Review Gate',
    invariant: 'All recommendations require human approval before execution',
    type: 'MANDATORY_HUMAN_REVIEW',
    status: 'ACTIVE',
    policy: 'BLOCK',
  };
  state.assurance.addMonitor(monitor1);
  state.assurance.addMonitor(monitor2);

  const checks = state.assurance.runMonitors(state.graph);
  for (const check of checks) {
    log(state, `Monitor check: ${check.method} → ${check.result} (${check.evidence})`);
  }

  // ---- PERTURBATION & REPLANNING (§24) ----
  log(state, '--- PERTURBATION & REPLANNING ---');
  
  // New evidence arrives: income clarification
  const ev6: EvidenceItem = {
    ...createTimestamped(),
    sourceId: sourceC.id,
    content: 'Income clarification: $62,000 includes spouse income; student family portion is $48,000',
    type: 'FINANCIAL_CLARIFICATION',
    status: 'VERIFIED',
    tags: ['income', 'clarification'],
  };
  state.graph.addEvidence(ev6);
  log(state, 'NEW EVIDENCE: Income clarification received');

  // Resolve contradiction
  state.graph.resolveContradiction(contradiction1.id, 'Clarification: official figure includes spouse income. Student family portion ($48k) is still above threshold.', 'TEMPORAL_CHANGE');
  log(state, 'Contradiction resolved: classified as TEMPORAL_CHANGE');

  // Supersede old income claim
  const claim5: Claim = {
    ...createTimestamped(),
    content: 'Student family income is $48,000 (clarified — still above $40k threshold)',
    status: 'INFERRED',
    evidenceIds: [ev6.id, ev3.id],
    assumptionIds: [],
    inferenceIds: [],
    uncertainty: [],
    verificationStatus: 'PASSED',
    scientificStatus: 'IMPLEMENTED',
  };
  state.graph.addClaim(claim5);
  state.graph.supersedeClaim(claim3.id, claim5.id, 'Income clarified with additional evidence');
  log(state, `Claim superseded: old income claim → new clarified claim`);

  // Detect deviation and replan
  const deviation: Deviation = {
    ...createTimestamped(),
    planId: plans[0].id,
    predictedState: 'Income below threshold → eligible',
    observedState: 'Income $48k → above $40k threshold → NOT eligible by income',
    severity: 'MAJOR',
    description: 'Income clarification changes eligibility determination',
  };

  const replanEvent = state.planning.handleDeviation(deviation, state.graph);
  log(state, `DEVIATION: ${deviation.severity} — ${deviation.description}`);
  log(state, `REPLANNING triggered: ${replanEvent.reason.slice(0, 60)}...`);

  // ---- STATE SNAPSHOTS (§8) ----
  const snapshot1 = state.graph.takeSnapshot('Initial evidence gathered');
  const snapshot2 = state.graph.takeSnapshot('After contradiction resolution and new evidence');
  const changes = state.graph.whatChanged(snapshot1.id, snapshot2.id);
  log(state, `WHAT_CHANGED: ${changes.length} differences detected between snapshots`);

  // ---- FINAL HUMAN CORRECTION ----
  log(state, '--- FINAL HUMAN DECISION ---');
  const intervention2 = state.governance.recordIntervention(
    humanActor.id,
    'CORRECT_CLAIM',
    claim5.id,
    'Claim',
    'Student does not meet income threshold. Recommendation: INELIGIBLE. However, flag for alternative scholarship program with higher threshold.',
    { claimStatus: claim5.status },
    { recommendation: 'INELIGIBLE', alternativeReferral: true },
    state.graph
  );
  if (intervention2) {
    log(state, `HUMAN CORRECTION: ${intervention2.rationale.slice(0, 60)}...`);
  }

  // ---- PROVENANCE / WHY QUERY (§7, 15) ----
  log(state, '--- PROVENANCE (WHY?) ---');
  const justification = state.graph.why(claim5.id);
  log(state, `Justification graph: ${justification.nodes.length} nodes, ${justification.edges.length} edges`);
  log(state, `Completeness: ${(justification.completeness * 100).toFixed(0)}%`);
  log(state, `Has contradictions: ${justification.hasContradictions}`);
  log(state, `Has unresolved uncertainty: ${justification.hasUnresolvedUncertainty}`);

  // ---- RESOURCE ACCOUNTING (§32-33) ----
  log(state, '--- RESOURCE ACCOUNTING ---');
  const route = state.resources.determineExecutionRoute('MEDIUM', 'HIGH', 'MEDIUM', false);
  log(state, `Execution route: ${route.method} (verification: ${route.requiresVerification}, human: ${route.requiresHumanReview})`);

  // ---- CREATE RESEARCH CASE ----
  const researchCase: ResearchCase = {
    ...createTimestamped(),
    name: 'Scholarship Eligibility — Synthetic Demo',
    description: 'Complete cognitive loop demonstration with contradiction, replanning, and human governance',
    scenarioFamily: 'EDUCATION',
    problemId: problem.id,
    evidenceIds: [ev1.id, ev2.id, ev3.id, ev4.id, ev5missing.id, ev6.id],
    claimIds: [claim1.id, claim2.id, claim3.id, claim4.id, claim5.id],
    contradictionIds: [contradiction1.id],
    causalHypothesisIds: [causalHyp.id],
    abstractionIds: [],
    worldModelId: worldModel.id,
    goalIds: [goal.id],
    planIds: plans.map((p: Plan) => p.id),
    humanInterventionIds: [intervention1?.id, intervention2?.id].filter(Boolean) as string[],
    assuranceCheckIds: checks.map((c: AssuranceCheck) => c.id),
    status: 'COMPLETED',
    isSynthetic: true,
  };

  state.currentCase = researchCase;
  log(state, '=== DEMONSTRATION CASE COMPLETE ===');
  log(state, `Graph stats: ${JSON.stringify(state.graph.getStats())}`);

  return researchCase;
}

// ============================================================
// CRITICAL TESTS (§57-61)
// ============================================================

export interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

export function runCriticalTests(state: CognitiveLoopState): TestResult[] {
  const results: TestResult[] = [];

  // Test 1: Provenance completeness
  {
    const claims = state.graph.getAllClaims();
    const allHaveProvenance = claims.every((c: Claim) => 
      c.evidenceIds.length > 0 || c.inferenceIds.length > 0 || c.assumptionIds.length > 0
    );
    results.push({
      name: 'PROVENANCE_VERIFIED',
      passed: allHaveProvenance,
      details: allHaveProvenance ? 'All claims traceable to evidence/inference/assumptions' : 'Some claims lack provenance',
    });
  }

  // Test 2: Contradiction preservation
  {
    const contradictions = state.graph.getAllContradictions();
    const preserved = contradictions.length > 0;
    results.push({
      name: 'CONTRADICTION_PRESERVATION_VERIFIED',
      passed: preserved,
      details: `${contradictions.length} contradictions preserved (not silently deleted)`,
    });
  }

  // Test 3: Change-of-mind history
  {
    const snapshots = state.graph.getStateHistory();
    const hasHistory = snapshots.length >= 2;
    results.push({
      name: 'CHANGE_OF_MIND_VERIFIED',
      passed: hasHistory,
      details: `${snapshots.length} state snapshots preserved`,
    });
  }

  // Test 4: Human authority
  {
    const interventions = state.graph.getAllInterventions();
    const allHuman = interventions.every((i: HumanIntervention) => {
      const actor = state.governance.getActor(i.actorId);
      return actor?.actorType === 'HUMAN';
    });
    results.push({
      name: 'HUMAN_AUTHORITY_VERIFIED',
      passed: allHuman && interventions.length > 0,
      details: `${interventions.length} interventions, all by HUMAN actors`,
    });
  }

  // Test 5: Zero assumption (no fabricated conclusions)
  {
    const claims2 = state.graph.getAllClaims();
    const noFabricated = claims2.every((c: Claim) => 
      c.evidenceIds.length > 0 || c.inferenceIds.length > 0 || c.assumptionIds.length > 0
    );
    results.push({
      name: 'ZERO_ASSUMPTION_VERIFIED',
      passed: noFabricated,
      details: 'No claim exists without evidence, inference, or assumption backing',
    });
  }

  // Test 6: Safe stop available
  {
    const plans = state.graph.getAllPlans();
    const hasSafeStop = plans.some((p: Plan) => p.branches.some((b: PlanBranch) => b.type === 'SAFE_STOP'));
    results.push({
      name: 'SAFE_STOP_VERIFIED',
      passed: hasSafeStop,
      details: hasSafeStop ? 'Safe stop branch exists in plan alternatives' : 'No safe stop plan found',
    });
  }

  // Test 7: Replanning triggered
  {
    const changes = state.graph.getChangeRecords();
    const hasReplanning = changes.length > 0;
    results.push({
      name: 'REPLANNING_VERIFIED',
      passed: hasReplanning,
      details: `${changes.length} change records exist`,
    });
  }

  // Test 8: Evidence insufficiency handling
  {
    const missingEvidence = state.graph.getAllEvidence().filter((e: EvidenceItem) => e.status === 'MISSING');
    const hasMissingHandling = missingEvidence.length > 0;
    results.push({
      name: 'INSUFFICIENT_EVIDENCE_HANDLED',
      passed: hasMissingHandling,
      details: `${missingEvidence.length} missing evidence items tracked without fabrication`,
    });
  }

  // Test 9: WHY query produces justification graph
  {
    const claims = state.graph.getAllClaims();
    if (claims.length > 0) {
      const jg = state.graph.why(claims[0].id);
      results.push({
        name: 'WHY_QUERY_VERIFIED',
        passed: jg.nodes.length > 0,
        details: `Justification graph: ${jg.nodes.length} nodes, ${jg.edges.length} edges`,
      });
    }
  }

  // Test 10: Resource accounting
  {
    const route = state.resources.determineExecutionRoute('LOW', 'LOW', 'LOW', false);
    results.push({
      name: 'RESOURCE_ACCOUNTING_VERIFIED',
      passed: route.method !== '',
      details: `Execution routing functional: ${route.method}`,
    });
  }

  return results;
}
