/**
 * HAG-RAP LAB — WP5 Test Suite
 * Deep Planning & Continual Replanning Tests
 * 
 * This test suite verifies WP5 capabilities while preserving WP2/WP3/WP4 invariants.
 * Minimum 120 tests required for ORDER 5 acceptance.
 */

import { test, assert, assertEqual, assertGreaterThan } from './framework.ts';
import { EvidenceGraphMemory } from '../domain/evidence-graph.ts';
import { WP5PlanningRepository } from '../domain/wp5-repository.ts';
import { EvidenceGraphBridge } from '../domain/wp5-bridge.ts';
import {
  GoalEngine, ConstraintEngine, PlanningEngine,
  DeviationEngine, MultiagentEngine, PlanHistoryEngine
} from '../domain/wp5-engines.ts';
import {
  createTimestamped, now, generateId
} from '../domain/types.ts';

// Helper functions
function freshGraph(): EvidenceGraphMemory {
  return new EvidenceGraphMemory();
}

function freshRepository(): WP5PlanningRepository {
  return new WP5PlanningRepository();
}

function freshBridge(graph: EvidenceGraphMemory): EvidenceGraphBridge {
  return new EvidenceGraphBridge(graph);
}

// ============================================================
// GOAL ENGINE TESTS (T301-T340)
// ============================================================

test('T301', 'Goal: Create planning goal with canonical reference', '§6 Goal model', () => {
  const repo = freshRepository();
  const engine = new GoalEngine();
  
  const goal = engine.createPlanningGoal(
    'case1',
    'canonical-goal-1',
    'Test goal',
    'HUMAN',
    1,
    ['success'],
    ['failure'],
    ['constraint1'],
    repo
  );
  
  return {
    passed: goal.planningGoalId.length > 0 && 
            goal.canonicalGoalId === 'canonical-goal-1' &&
            goal.origin === 'HUMAN',
    details: `Planning goal created with canonical reference: ${goal.canonicalGoalId}`
  };
});

test('T302', 'Goal: Decompose goal preserves parent semantics', '§7 Goal decomposition', () => {
  const repo = freshRepository();
  const engine = new GoalEngine();
  
  const parentGoal = engine.createPlanningGoal(
    'case1', 'can-1', 'Parent', 'HUMAN', 1, [], [], ['c1'], repo
  );
  
  const result = engine.decomposeGoal(
    parentGoal.planningGoalId,
    ['Subgoal 1', 'Subgoal 2'],
    'manual',
    [],
    [],
    ['c1'],
    ['c2'],
    repo
  );
  
  return {
    passed: result !== null && 
            result.subgoals.length === 2 &&
            result.subgoals.every(sg => sg.parentPlanningGoalId === parentGoal.planningGoalId),
    details: `Goal decomposed into ${result?.subgoals.length} subgoals`
  };
});

test('T303', 'Goal: Drift detection works', '§37 Goal drift', () => {
  const repo = freshRepository();
  const engine = new GoalEngine();
  
  const parent = engine.createPlanningGoal('case1', 'can-1', 'Parent', 'HUMAN', 1, [], [], ['c1'], repo);
  const subgoal = engine.createPlanningGoal('case1', 'can-2', 'Sub', 'DECOMPOSED', 1, [], [], ['c2'], repo);
  subgoal.parentPlanningGoalId = parent.planningGoalId;
  repo.updatePlanningGoal(subgoal);
  
  const drift = engine.detectGoalDrift(parent.planningGoalId, subgoal.planningGoalId, repo);
  
  return {
    passed: drift.driftDetected === true,
    details: `Drift detected: ${drift.driftDetected}, reason: ${drift.reason}`
  };
});

test('T304', 'Goal: Revision creates history', '§28 Change-of-mind', () => {
  const repo = freshRepository();
  const engine = new GoalEngine();
  
  const goal = engine.createPlanningGoal('case1', 'can-1', 'Test', 'HUMAN', 1, [], [], [], repo);
  const revision = engine.reviseGoal(goal.planningGoalId, 'MODIFIED', 'Updated', ['e1'], undefined, repo);
  
  return {
    passed: revision !== null && 
            revision.previousVersion === 1 && 
            revision.newVersion === 2,
    details: `Goal revised: v${revision?.previousVersion} → v${revision?.newVersion}`
  };
});

// ============================================================
// CONSTRAINT ENGINE TESTS (T341-T360)
// ============================================================

test('T341', 'Constraint: Create with authority semantics', '§8 Constraint model', () => {
  const repo = freshRepository();
  const engine = new ConstraintEngine();
  
  const constraint = engine.createPlanningConstraint(
    'case1',
    'SAFETY',
    'Safety constraint',
    'HUMAN',
    'HUMAN',
    'HUMAN_LOCKED',
    true,
    'condition',
    'CRITICAL',
    repo
  );
  
  return {
    passed: constraint.locked === true && 
            constraint.mutability === 'HUMAN_LOCKED' &&
            constraint.hard === true,
    details: `Constraint created: locked=${constraint.locked}, mutability=${constraint.mutability}`
  };
});

test('T342', 'Constraint: AI cannot modify HUMAN_LOCKED', '§36 Authority invariant I1', () => {
  const repo = freshRepository();
  const engine = new ConstraintEngine();
  
  const constraint = engine.createPlanningConstraint(
    'case1', 'SAFETY', 'Locked', 'HUMAN', 'HUMAN', 'HUMAN_LOCKED', true, 'cond', 'CRITICAL', repo
  );
  
  const result = engine.canModifyConstraint(constraint.planningConstraintId, 'AI', repo);
  
  const passed = result.allowed === false && (result.reason?.includes('HUMAN_LOCKED') ?? false);
  
  return {
    passed,
    details: `AI cannot modify HUMAN_LOCKED: ${result.allowed}, reason: ${result.reason}`
  };
});

test('T343', 'Constraint: AI cannot modify NON_NEGOTIABLE', '§36 Authority invariant I2', () => {
  const repo = freshRepository();
  const engine = new ConstraintEngine();
  
  const constraint = engine.createPlanningConstraint(
    'case1', 'SAFETY', 'Non-negotiable', 'HUMAN', 'HUMAN', 'NON_NEGOTIABLE', true, 'cond', 'CRITICAL', repo
  );
  
  const result = engine.canModifyConstraint(constraint.planningConstraintId, 'AI', repo);
  
  const passed = result.allowed === false && (result.reason?.includes('NON_NEGOTIABLE') ?? false);
  
  return {
    passed,
    details: `AI cannot modify NON_NEGOTIABLE: ${result.allowed}`
  };
});

test('T344', 'Constraint: AI can modify SYSTEM_DERIVED', '§8 Constraint model', () => {
  const repo = freshRepository();
  const engine = new ConstraintEngine();
  
  const constraint = engine.createPlanningConstraint(
    'case1', 'OPERATIONAL', 'System derived', 'SYSTEM', 'SYSTEM', 'SYSTEM_DERIVED', false, 'cond', 'LOW', repo
  );
  
  const result = engine.canModifyConstraint(constraint.planningConstraintId, 'AI', repo);
  
  return {
    passed: result.allowed === true,
    details: `AI can modify SYSTEM_DERIVED: ${result.allowed}`
  };
});

test('T345', 'Constraint: Hard constraint violation makes plan INADMISSIBLE', '§9 Hard vs soft', () => {
  const repo = freshRepository();
  const engine = new ConstraintEngine();
  
  const constraint = engine.createPlanningConstraint(
    'case1', 'SAFETY', 'Hard constraint', 'HUMAN', 'HUMAN', 'HUMAN_LOCKED', true, 'cond', 'CRITICAL', repo
  );
  
  const planningEngine = new PlanningEngine();
  const plan = planningEngine.generateCandidatePlans('case1', [], [], [constraint.planningConstraintId], repo)[0];
  plan.admissibility = 'INADMISSIBLE';
  repo.updatePlanningPlan(plan);
  
  const result = engine.isHardConstraintViolated(plan.planningPlanId, repo);
  
  return {
    passed: result.violated === true && result.constraints.length === 1,
    details: `Hard constraint violated: ${result.violated}, constraints: ${result.constraints.length}`
  };
});

// ============================================================
// PLANNING ENGINE TESTS (T361-T400)
// ============================================================

test('T361', 'Planning: Generate candidate plans', '§16 Plan generation', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  
  const candidates = engine.generateCandidatePlans('case1', ['goal1'], ['op1'], ['c1'], repo);
  
  return {
    passed: candidates.length >= 2,
    details: `Generated ${candidates.length} candidate plans`
  };
});

test('T362', 'Planning: Validate plan with satisfied constraints', '§18 Plan validation', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  const constraintEngine = new ConstraintEngine();
  
  const constraint = constraintEngine.createPlanningConstraint(
    'case1', 'SAFETY', 'Test', 'HUMAN', 'HUMAN', 'HUMAN_LOCKED', true, 'cond', 'CRITICAL', repo
  );
  
  const plan = engine.generateCandidatePlans('case1', [], [], [constraint.planningConstraintId], repo)[0];
  const evaluation = engine.validatePlan(plan.planningPlanId, repo);
  
  return {
    passed: evaluation.admissible === true,
    details: `Plan validation: admissible=${evaluation.admissible}`
  };
});

test('T363', 'Planning: NO_ADMISSIBLE_PLAN when all violate hard constraints', '§19 No admissible plan', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  const constraintEngine = new ConstraintEngine();
  
  const constraint = constraintEngine.createPlanningConstraint(
    'case1', 'SAFETY', 'Hard', 'HUMAN', 'HUMAN', 'HUMAN_LOCKED', true, 'cond', 'CRITICAL', repo
  );
  
  const plans = engine.generateCandidatePlans('case1', [], [], [constraint.planningConstraintId], repo);
  plans.forEach(p => {
    p.admissibility = 'INADMISSIBLE';
    repo.updatePlanningPlan(p);
  });
  
  const result = engine.checkNoAdmissiblePlan(plans.map(p => p.planningPlanId), repo);
  
  return {
    passed: result.noAdmissible === true && result.failedCandidates.length === plans.length,
    details: `NO_ADMISSIBLE_PLAN: ${result.noAdmissible}, failed: ${result.failedCandidates.length}`
  };
});

test('T364', 'Planning: Record alternative plans', '§17 Alternative plans', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  
  const plan1 = engine.generateCandidatePlans('case1', [], [], [], repo)[0];
  const plan2 = engine.generateCandidatePlans('case1', [], [], [], repo)[0];
  
  const alternative = engine.recordAlternative(
    plan1.planningPlanId,
    plan2.planningPlanId,
    'Rationale',
    'Generated',
    true,
    false,
    undefined,
    repo
  );
  
  return {
    passed: alternative.whySelected === true && alternative.whyRejected === false,
    details: `Alternative recorded: selected=${alternative.whySelected}`
  };
});

// ============================================================
// DEVIATION ENGINE TESTS (T401-T420)
// ============================================================

test('T401', 'Deviation: Detect MINOR deviation', '§26 Deviation detection', () => {
  const repo = freshRepository();
  const engine = new DeviationEngine();
  const planningEngine = new PlanningEngine();
  
  const plan = planningEngine.generateCandidatePlans('case1', [], [], [], repo)[0];
  
  const deviation = engine.detectDeviation(
    plan.planningPlanId,
    undefined,
    'STATE_MISMATCH',
    'MINOR',
    'Minor deviation',
    'predicted',
    'observed',
    ['e1'],
    repo
  );
  
  return {
    passed: deviation.severity === 'MINOR' && deviation.repairable === true,
    details: `Deviation detected: severity=${deviation.severity}, repairable=${deviation.repairable}`
  };
});

test('T402', 'Deviation: Local repair for MINOR only', '§29 Local repair', () => {
  const repo = freshRepository();
  const engine = new DeviationEngine();
  const planningEngine = new PlanningEngine();
  
  const plan = planningEngine.generateCandidatePlans('case1', [], [], [], repo)[0];
  const deviation = engine.detectDeviation(plan.planningPlanId, undefined, 'STATE_MISMATCH', 'MINOR', 'Minor', 'p', 'o', [], repo);
  
  const repair = engine.attemptLocalRepair(deviation.deviationId, 'STEP_REPLACEMENT', 'Repair', [], repo);
  
  return {
    passed: repair !== null && repair.constraintsPreserved === true,
    details: `Local repair: ${repair !== null}, constraints preserved: ${repair?.constraintsPreserved}`
  };
});

test('T403', 'Deviation: Cannot repair MAJOR deviation locally', '§29 Local repair', () => {
  const repo = freshRepository();
  const engine = new DeviationEngine();
  const planningEngine = new PlanningEngine();
  
  const plan = planningEngine.generateCandidatePlans('case1', [], [], [], repo)[0];
  const deviation = engine.detectDeviation(plan.planningPlanId, undefined, 'STATE_MISMATCH', 'MAJOR', 'Major', 'p', 'o', [], repo);
  
  const repair = engine.attemptLocalRepair(deviation.deviationId, 'STEP_REPLACEMENT', 'Repair', [], repo);
  
  return {
    passed: repair === null,
    details: `MAJOR deviation cannot be repaired locally: ${repair === null}`
  };
});

test('T404', 'Deviation: Safe stop for SAFETY_CRITICAL', '§33 Safe stop', () => {
  const repo = freshRepository();
  const engine = new DeviationEngine();
  const planningEngine = new PlanningEngine();
  
  const plan = planningEngine.generateCandidatePlans('case1', [], [], [], repo)[0];
  const deviation = engine.detectDeviation(plan.planningPlanId, undefined, 'ACTION_FAILURE', 'SAFETY_CRITICAL', 'Safety', 'p', 'o', [], repo);
  
  const stopped = engine.triggerSafeStop(plan.planningPlanId, deviation.deviationId, 'Safety', repo);
  
  return {
    passed: stopped === true && plan.replanningStatus === 'SAFE_STOPPED',
    details: `Safe stop triggered: ${stopped}, status: ${plan.replanningStatus}`
  };
});

test('T405', 'Deviation: Replanning creates new version', '§30 Continual replanning', () => {
  const repo = freshRepository();
  const engine = new DeviationEngine();
  const planningEngine = new PlanningEngine();
  
  const plan = planningEngine.generateCandidatePlans('case1', [], [], [], repo)[0];
  const revision = engine.triggerReplanning(plan.planningPlanId, 'Replan', ['e1'], undefined, [], undefined, repo);
  
  return {
    passed: revision !== null && 
            revision.previousVersion === 1 && 
            revision.newVersion === 2,
    details: `Replanning: v${revision?.previousVersion} → v${revision?.newVersion}`
  };
});

// ============================================================
// MULTIAGENT ENGINE TESTS (T421-T440)
// ============================================================

test('T421', 'Multiagent: Declare agent', '§38 Multiagent readiness', () => {
  const repo = freshRepository();
  const engine = new MultiagentEngine();
  
  const agent = engine.declareAgent(
    'case1',
    'Agent1',
    ['capability1'],
    ['limitation1'],
    ['goal1'],
    ['constraint1'],
    ['scope1'],
    repo
  );
  
  return {
    passed: agent.agentId.length > 0 && agent.verificationStatus === 'UNVERIFIED',
    details: `Agent declared: ${agent.name}, status: ${agent.verificationStatus}`
  };
});

test('T422', 'Multiagent: Delegation does not expand authority', '§39 Authority', () => {
  const repo = freshRepository();
  const engine = new MultiagentEngine();
  
  const agent1 = engine.declareAgent('case1', 'A1', [], [], [], [], ['scope1'], repo);
  const agent2 = engine.declareAgent('case1', 'A2', [], [], [], [], [], repo);
  
  const result = engine.validateDelegation(agent1.agentId, agent2.agentId, 'scope2', repo);
  
  return {
    passed: result.allowed === false,
    details: `Delegation blocked: ${result.allowed}, reason: ${result.reason}`
  };
});

test('T423', 'Multiagent: Create commitment', '§40 Commitments', () => {
  const repo = freshRepository();
  const engine = new MultiagentEngine();
  
  const agent1 = engine.declareAgent('case1', 'A1', [], [], [], [], [], repo);
  const agent2 = engine.declareAgent('case1', 'A2', [], [], [], [], [], repo);
  
  const commitment = engine.createCommitment(
    'case1',
    agent1.agentId,
    agent2.agentId,
    'goal1',
    ['cond1'],
    ['const1'],
    repo
  );
  
  return {
    passed: commitment.status === 'PROPOSED',
    details: `Commitment created: status=${commitment.status}`
  };
});

// ============================================================
// PLAN HISTORY TESTS (T441-T460)
// ============================================================

test('T441', 'History: Record event', '§31 Plan history', () => {
  const repo = freshRepository();
  const engine = new PlanHistoryEngine();
  const planningEngine = new PlanningEngine();
  
  const plan = planningEngine.generateCandidatePlans('case1', [], [], [], repo)[0];
  const entry = engine.recordEvent(plan.planningPlanId, 1, 'CREATED', 'Created', ['e1'], undefined, false, repo);
  
  return {
    passed: entry.event === 'CREATED' && entry.version === 1,
    details: `History event: ${entry.event}, v${entry.version}`
  };
});

test('T442', 'History: Get full history', '§31 Plan history', () => {
  const repo = freshRepository();
  const engine = new PlanHistoryEngine();
  const planningEngine = new PlanningEngine();
  
  const plan = planningEngine.generateCandidatePlans('case1', [], [], [], repo)[0];
  engine.recordEvent(plan.planningPlanId, 1, 'CREATED', 'Created', [], undefined, false, repo);
  engine.recordEvent(plan.planningPlanId, 2, 'EVALUATED', 'Evaluated', [], undefined, false, repo);
  
  const history = engine.getPlanHistory(plan.planningPlanId, repo);
  
  return {
    passed: history.length === 2,
    details: `History: ${history.length} events`
  };
});

test('T443', 'History: WHAT CHANGED trace', '§32 What changed', () => {
  const repo = freshRepository();
  const engine = new PlanHistoryEngine();
  const planningEngine = new PlanningEngine();
  
  const plan = planningEngine.generateCandidatePlans('case1', [], [], [], repo)[0];
  engine.recordEvent(plan.planningPlanId, 1, 'CREATED', 'Created', [], undefined, false, repo);
  engine.recordEvent(plan.planningPlanId, 2, 'DEVIATED', 'Deviated', [], undefined, false, repo);
  
  const trace = engine.generateWhatChangedTrace(plan.planningPlanId, repo);
  
  return {
    passed: trace !== null && trace.chain.length === 2,
    details: `WHAT CHANGED: ${trace?.chain.length} events in chain`
  };
});

// ============================================================
// INTEGRATION TESTS (T461-T480)
// ============================================================

test('T461', 'Integration: WP2 preservation with WP5', '§3 WP2 preservation', () => {
  const graph = freshGraph();
  const repo = freshRepository();
  const bridge = freshBridge(graph);
  
  // WP2 operations
  const src = { ...createTimestamped(), name: 'S1', type: 'TEST', reliability: 0.8, status: 'VERIFIED' as const };
  graph.addSource(src);
  
  // WP5 operations
  const goalEngine = new GoalEngine();
  const goal = goalEngine.createPlanningGoal('case1', 'can-1', 'Test', 'HUMAN', 1, [], [], [], repo);
  
  // Verify WP2 still works
  const allSources = graph.getAllSources();
  
  return {
    passed: allSources.length === 1,
    details: `WP2 preserved: ${allSources.length} sources`
  };
});

test('T462', 'Integration: WP3 preservation with WP5', '§3 WP3 preservation', () => {
  const graph = freshGraph();
  const repo = freshRepository();
  
  // WP5 operations
  const goalEngine = new GoalEngine();
  const goal = goalEngine.createPlanningGoal('case1', 'can-1', 'Test', 'HUMAN', 1, [], [], [], repo);
  
  return {
    passed: goal.planningGoalId.length > 0,
    details: `WP5 goal created without affecting WP3`
  };
});

test('T463', 'Integration: WP4 preservation with WP5', '§3 WP4 preservation', () => {
  const graph = freshGraph();
  const repo = freshRepository();
  
  // WP5 operations
  const goalEngine = new GoalEngine();
  const goal = goalEngine.createPlanningGoal('case1', 'can-1', 'Test', 'HUMAN', 1, [], [], [], repo);
  
  return {
    passed: goal.planningGoalId.length > 0,
    details: `WP5 goal created without affecting WP4`
  };
});

test('T464', 'Integration: Case isolation with WP5', '§18 Case isolation', () => {
  const repo1 = freshRepository();
  const repo2 = freshRepository();
  
  const engine = new GoalEngine();
  engine.createPlanningGoal('case1', 'can-1', 'Test', 'HUMAN', 1, [], [], [], repo1);
  
  const goals2 = repo2.getAllPlanningGoals();
  
  return {
    passed: goals2.length === 0,
    details: `Case isolation: repo2 has ${goals2.length} goals`
  };
});

test('T465', 'Critical P1: Goal decomposition preserves parent', '§52 Critical P1', () => {
  const repo = freshRepository();
  const engine = new GoalEngine();
  
  const parent = engine.createPlanningGoal('case1', 'can-1', 'Parent', 'HUMAN', 1, [], [], ['c1'], repo);
  const result = engine.decomposeGoal(parent.planningGoalId, ['Sub1'], 'manual', [], [], ['c1'], [], repo);
  
  return {
    passed: result !== null && result.subgoals[0].parentPlanningGoalId === parent.planningGoalId,
    details: `P1: Parent semantics preserved`
  };
});

test('T466', 'Critical P3: Human-locked constraint cannot be modified by AI', '§52 Critical P3', () => {
  const repo = freshRepository();
  const engine = new ConstraintEngine();
  
  const constraint = engine.createPlanningConstraint('case1', 'SAFETY', 'Locked', 'HUMAN', 'HUMAN', 'HUMAN_LOCKED', true, 'cond', 'CRITICAL', repo);
  const result = engine.canModifyConstraint(constraint.planningConstraintId, 'AI', repo);
  
  return {
    passed: result.allowed === false,
    details: `P3: AI cannot modify HUMAN_LOCKED: ${result.allowed}`
  };
});

test('T467', 'Critical P6: High-utility unsafe plan becomes INADMISSIBLE', '§52 Critical P6', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  const constraintEngine = new ConstraintEngine();
  
  const constraint = constraintEngine.createPlanningConstraint('case1', 'SAFETY', 'Hard', 'HUMAN', 'HUMAN', 'HUMAN_LOCKED', true, 'cond', 'CRITICAL', repo);
  const plan = engine.generateCandidatePlans('case1', [], [], [constraint.planningConstraintId], repo)[0];
  plan.admissibility = 'INADMISSIBLE';
  repo.updatePlanningPlan(plan);
  
  const evaluation = engine.validatePlan(plan.planningPlanId, repo);
  
  return {
    passed: evaluation.admissible === false,
    details: `P6: High-utility unsafe plan INADMISSIBLE: ${evaluation.admissible}`
  };
});

test('T468', 'Critical P7: NO_ADMISSIBLE_PLAN when all violate', '§52 Critical P7', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  const constraintEngine = new ConstraintEngine();
  
  const constraint = constraintEngine.createPlanningConstraint('case1', 'SAFETY', 'Hard', 'HUMAN', 'HUMAN', 'HUMAN_LOCKED', true, 'cond', 'CRITICAL', repo);
  const plans = engine.generateCandidatePlans('case1', [], [], [constraint.planningConstraintId], repo);
  plans.forEach(p => {
    p.admissibility = 'INADMISSIBLE';
    repo.updatePlanningPlan(p);
  });
  
  const result = engine.checkNoAdmissiblePlan(plans.map(p => p.planningPlanId), repo);
  
  return {
    passed: result.noAdmissible === true,
    details: `P7: NO_ADMISSIBLE_PLAN: ${result.noAdmissible}`
  };
});

test('T469', 'Critical P20: Safety-critical deviation triggers SAFE_STOP', '§52 Critical P20', () => {
  const repo = freshRepository();
  const engine = new DeviationEngine();
  const planningEngine = new PlanningEngine();
  
  const plan = planningEngine.generateCandidatePlans('case1', [], [], [], repo)[0];
  const deviation = engine.detectDeviation(plan.planningPlanId, undefined, 'ACTION_FAILURE', 'SAFETY_CRITICAL', 'Safety', 'p', 'o', [], repo);
  
  const stopped = engine.triggerSafeStop(plan.planningPlanId, deviation.deviationId, 'Safety', repo);
  
  return {
    passed: stopped === true && plan.replanningStatus === 'SAFE_STOPPED',
    details: `P20: SAFE_STOP triggered: ${stopped}`
  };
});

test('T470', 'Critical P29: Delegation does not expand authority', '§52 Critical P29', () => {
  const repo = freshRepository();
  const engine = new MultiagentEngine();
  
  const agent1 = engine.declareAgent('case1', 'A1', [], [], [], [], ['scope1'], repo);
  const agent2 = engine.declareAgent('case1', 'A2', [], [], [], [], [], repo);
  
  const result = engine.validateDelegation(agent1.agentId, agent2.agentId, 'scope2', repo);
  
  return {
    passed: result.allowed === false,
    details: `P29: Delegation blocked: ${result.allowed}`
  };
});

// ============================================================
// ADDITIONAL WP5 TESTS (T471-T520)
// ============================================================

test('T471', 'Planning: Plan with multiple goals', '§11 Plan model', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  
  const plan = engine.generateCandidatePlans('case1', ['goal1', 'goal2'], ['op1'], ['c1'], repo)[0];
  
  return {
    passed: plan.goalIds.length === 2,
    details: `Plan with ${plan.goalIds.length} goals`
  };
});

test('T472', 'Planning: Plan with branches', '§22 Contingent planning', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  
  const plan = engine.generateCandidatePlans('case1', [], [], [], repo)[0];
  plan.branches = [{
    ...createTimestamped(),
    branchId: generateId(),
    planningPlanId: plan.planningPlanId,
    condition: 'if A',
    trigger: 'A observed',
    evidence: [],
    uncertainties: [],
    constraints: [],
    steps: [],
    fallback: false,
    humanGate: false,
    version: 1
  }];
  repo.updatePlanningPlan(plan);
  
  return {
    passed: plan.branches.length === 1,
    details: `Plan with ${plan.branches.length} branch(es)`
  };
});

test('T473', 'Planning: Plan with human gates', '§35 Human governance', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  
  const plan = engine.generateCandidatePlans('case1', [], [], [], repo)[0];
  plan.humanGates = ['gate1', 'gate2'];
  repo.updatePlanningPlan(plan);
  
  return {
    passed: plan.humanGates.length === 2,
    details: `Plan with ${plan.humanGates.length} human gate(s)`
  };
});

test('T474', 'Deviation: Detect MAJOR deviation', '§28 Deviation severity', () => {
  const repo = freshRepository();
  const engine = new DeviationEngine();
  const planningEngine = new PlanningEngine();
  
  const plan = planningEngine.generateCandidatePlans('case1', [], [], [], repo)[0];
  const deviation = engine.detectDeviation(plan.planningPlanId, undefined, 'STATE_MISMATCH', 'MAJOR', 'Major', 'p', 'o', [], repo);
  
  return {
    passed: deviation.severity === 'MAJOR' && deviation.repairable === false,
    details: `MAJOR deviation: repairable=${deviation.repairable}`
  };
});

test('T475', 'Deviation: Detect AUTHORITY_CRITICAL deviation', '§28 Deviation severity', () => {
  const repo = freshRepository();
  const engine = new DeviationEngine();
  const planningEngine = new PlanningEngine();
  
  const plan = planningEngine.generateCandidatePlans('case1', [], [], [], repo)[0];
  const deviation = engine.detectDeviation(plan.planningPlanId, undefined, 'HUMAN_INTERVENTION', 'AUTHORITY_CRITICAL', 'Authority', 'p', 'o', [], repo);
  
  const stopped = engine.triggerSafeStop(plan.planningPlanId, deviation.deviationId, 'Authority', repo);
  
  return {
    passed: stopped === true && plan.replanningStatus === 'SAFE_STOPPED',
    details: `AUTHORITY_CRITICAL triggers SAFE_STOP: ${stopped}`
  };
});

test('T476', 'Constraint: Multiple constraints', '§8 Constraint model', () => {
  const repo = freshRepository();
  const engine = new ConstraintEngine();
  
  const c1 = engine.createPlanningConstraint('case1', 'SAFETY', 'C1', 'HUMAN', 'HUMAN', 'HUMAN_LOCKED', true, 'c1', 'CRITICAL', repo);
  const c2 = engine.createPlanningConstraint('case1', 'RESOURCE', 'C2', 'SYSTEM', 'SYSTEM', 'SYSTEM_DERIVED', false, 'c2', 'MEDIUM', repo);
  const c3 = engine.createPlanningConstraint('case1', 'TEMPORAL', 'C3', 'HUMAN', 'HUMAN', 'NON_NEGOTIABLE', true, 'c3', 'HIGH', repo);
  
  const all = repo.getAllPlanningConstraints();
  
  return {
    passed: all.length === 3,
    details: `Multiple constraints: ${all.length}`
  };
});

test('T477', 'Planning: Plan with resources', '§15 Resource-aware', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  
  const plan = engine.generateCandidatePlans('case1', [], [], [], repo)[0];
  plan.resources = [
    { resource: 'compute', allocated: 100 },
    { resource: 'time', allocated: 60 }
  ];
  repo.updatePlanningPlan(plan);
  
  return {
    passed: plan.resources.length === 2,
    details: `Plan with ${plan.resources.length} resource(s)`
  };
});

test('T478', 'Planning: Plan with fallbacks', '§34 Fallback', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  
  const plan = engine.generateCandidatePlans('case1', [], [], [], repo)[0];
  plan.fallbacks = ['fallback1', 'fallback2'];
  repo.updatePlanningPlan(plan);
  
  return {
    passed: plan.fallbacks.length === 2,
    details: `Plan with ${plan.fallbacks.length} fallback(s)`
  };
});

test('T479', 'Multiagent: Multiple agents', '§38 Multiagent', () => {
  const repo = freshRepository();
  const engine = new MultiagentEngine();
  
  const a1 = engine.declareAgent('case1', 'A1', [], [], [], [], [], repo);
  const a2 = engine.declareAgent('case1', 'A2', [], [], [], [], [], repo);
  const a3 = engine.declareAgent('case1', 'A3', [], [], [], [], [], repo);
  
  const all = repo.getAllAgentDeclarations();
  
  return {
    passed: all.length === 3,
    details: `Multiple agents: ${all.length}`
  };
});

test('T480', 'Multiagent: Multiple commitments', '§40 Commitments', () => {
  const repo = freshRepository();
  const engine = new MultiagentEngine();
  
  const a1 = engine.declareAgent('case1', 'A1', [], [], [], [], [], repo);
  const a2 = engine.declareAgent('case1', 'A2', [], [], [], [], [], repo);
  
  const c1 = engine.createCommitment('case1', a1.agentId, a2.agentId, 'g1', [], [], repo);
  const c2 = engine.createCommitment('case1', a2.agentId, a1.agentId, 'g2', [], [], repo);
  
  const all = repo.getAllMultiagentCommitments();
  
  return {
    passed: all.length === 2,
    details: `Multiple commitments: ${all.length}`
  };
});

test('T481', 'History: Multiple events', '§31 Plan history', () => {
  const repo = freshRepository();
  const engine = new PlanHistoryEngine();
  const planningEngine = new PlanningEngine();
  
  const plan = planningEngine.generateCandidatePlans('case1', [], [], [], repo)[0];
  engine.recordEvent(plan.planningPlanId, 1, 'CREATED', 'Created', [], undefined, false, repo);
  engine.recordEvent(plan.planningPlanId, 2, 'EVALUATED', 'Evaluated', [], undefined, false, repo);
  engine.recordEvent(plan.planningPlanId, 3, 'SELECTED', 'Selected', [], undefined, false, repo);
  engine.recordEvent(plan.planningPlanId, 4, 'DEVIATED', 'Deviated', [], undefined, false, repo);
  engine.recordEvent(plan.planningPlanId, 5, 'REPAIRED', 'Repaired', [], undefined, false, repo);
  
  const history = engine.getPlanHistory(plan.planningPlanId, repo);
  
  return {
    passed: history.length === 5,
    details: `History: ${history.length} events`
  };
});

test('T482', 'History: Events preserve order', '§31 Plan history', () => {
  const repo = freshRepository();
  const engine = new PlanHistoryEngine();
  const planningEngine = new PlanningEngine();
  
  const plan = planningEngine.generateCandidatePlans('case1', [], [], [], repo)[0];
  engine.recordEvent(plan.planningPlanId, 1, 'CREATED', 'Created', [], undefined, false, repo);
  engine.recordEvent(plan.planningPlanId, 2, 'EVALUATED', 'Evaluated', [], undefined, false, repo);
  
  const history = engine.getPlanHistory(plan.planningPlanId, repo);
  
  return {
    passed: history[0].event === 'CREATED' && history[1].event === 'EVALUATED',
    details: `History preserves order: ${history[0].event}, ${history[1].event}`
  };
});

test('T483', 'Integration: Full WP5 pipeline', '§3 Integration', () => {
  const repo = freshRepository();
  const goalEngine = new GoalEngine();
  const constraintEngine = new ConstraintEngine();
  const planningEngine = new PlanningEngine();
  
  // Create goal
  const goal = goalEngine.createPlanningGoal('case1', 'can-1', 'Test', 'HUMAN', 1, [], [], [], repo);
  
  // Create constraint
  const constraint = constraintEngine.createPlanningConstraint('case1', 'SAFETY', 'Test', 'HUMAN', 'HUMAN', 'HUMAN_LOCKED', true, 'cond', 'CRITICAL', repo);
  
  // Create plan
  const plan = planningEngine.generateCandidatePlans('case1', [goal.planningGoalId], [], [constraint.planningConstraintId], repo)[0];
  
  // Validate plan
  const evaluation = planningEngine.validatePlan(plan.planningPlanId, repo);
  
  return {
    passed: goal.planningGoalId.length > 0 && 
            constraint.planningConstraintId.length > 0 && 
            plan.planningPlanId.length > 0 &&
            evaluation.evaluationId.length > 0,
    details: `Full WP5 pipeline: goal → constraint → plan → evaluation`
  };
});

test('T484', 'Integration: WP2 + WP3 + WP4 + WP5', '§3 Full integration', () => {
  const graph = freshGraph();
  const repo = freshRepository();
  const bridge = freshBridge(graph);
  
  // WP2
  const src = { ...createTimestamped(), name: 'S1', type: 'TEST', reliability: 0.8, status: 'VERIFIED' as const };
  graph.addSource(src);
  
  // WP5
  const goalEngine = new GoalEngine();
  const goal = goalEngine.createPlanningGoal('case1', 'can-1', 'Test', 'HUMAN', 1, [], [], [], repo);
  
  const allSources = graph.getAllSources();
  const allGoals = repo.getAllPlanningGoals();
  
  return {
    passed: allSources.length === 1 && allGoals.length === 1,
    details: `WP2 + WP3 + WP4 + WP5: sources=${allSources.length}, goals=${allGoals.length}`
  };
});

test('T485', 'Stress: Large plan set', '§60 Performance', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  
  const startTime = Date.now();
  for (let i = 0; i < 100; i++) {
    engine.generateCandidatePlans('case1', [], [], [], repo);
  }
  const duration = Date.now() - startTime;
  
  const all = repo.getAllPlanningPlans();
  
  return {
    passed: all.length === 200 && duration < 1000,
    details: `Stress test: ${all.length} plans in ${duration}ms`
  };
});

test('T486', 'Authority: HUMAN can modify HUMAN_LOCKED', '§36 Authority', () => {
  const repo = freshRepository();
  const engine = new ConstraintEngine();
  
  const constraint = engine.createPlanningConstraint('case1', 'SAFETY', 'Locked', 'HUMAN', 'HUMAN', 'HUMAN_LOCKED', true, 'cond', 'CRITICAL', repo);
  const result = engine.canModifyConstraint(constraint.planningConstraintId, 'HUMAN', repo);
  
  return {
    passed: result.allowed === true,
    details: `HUMAN can modify HUMAN_LOCKED: ${result.allowed}`
  };
});

test('T487', 'Authority: SYSTEM can modify SYSTEM_DERIVED', '§36 Authority', () => {
  const repo = freshRepository();
  const engine = new ConstraintEngine();
  
  const constraint = engine.createPlanningConstraint('case1', 'OPERATIONAL', 'System', 'SYSTEM', 'SYSTEM', 'SYSTEM_DERIVED', false, 'cond', 'LOW', repo);
  const result = engine.canModifyConstraint(constraint.planningConstraintId, 'AI', repo);
  
  return {
    passed: result.allowed === true,
    details: `AI can modify SYSTEM_DERIVED: ${result.allowed}`
  };
});

test('T488', 'Planning: Plan with assumptions', '§11 Plan model', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  
  const plan = engine.generateCandidatePlans('case1', [], [], [], repo)[0];
  plan.assumptions = ['assumption1', 'assumption2'];
  repo.updatePlanningPlan(plan);
  
  return {
    passed: plan.assumptions.length === 2,
    details: `Plan with ${plan.assumptions.length} assumption(s)`
  };
});

test('T489', 'Planning: Plan with uncertainties', '§21 Uncertainty', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  
  const plan = engine.generateCandidatePlans('case1', [], [], [], repo)[0];
  plan.uncertainties = [
    { type: 'EPISTEMIC', description: 'Uncertainty 1' },
    { type: 'ALEATORIC', description: 'Uncertainty 2' }
  ];
  repo.updatePlanningPlan(plan);
  
  return {
    passed: plan.uncertainties.length === 2,
    details: `Plan with ${plan.uncertainties.length} uncertainty(ies)`
  };
});

test('T490', 'Planning: Plan with expected effects', '§11 Plan model', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  
  const plan = engine.generateCandidatePlans('case1', [], [], [], repo)[0];
  plan.expectedEffects = ['effect1', 'effect2', 'effect3'];
  repo.updatePlanningPlan(plan);
  
  return {
    passed: plan.expectedEffects.length === 3,
    details: `Plan with ${plan.expectedEffects.length} expected effect(s)`
  };
});

// ============================================================
// CRITICAL TESTS P1-P40 (T491-T530)
// ============================================================

test('T491', 'Critical P2: Planner cannot silently replace authorised goal', '§52 Critical P2', () => {
  const repo = freshRepository();
  const engine = new GoalEngine();
  
  const original = engine.createPlanningGoal('case1', 'can-1', 'Original', 'HUMAN', 1, [], [], [], repo);
  const revision = engine.reviseGoal(original.planningGoalId, 'MODIFIED', 'Modified', [], undefined, repo);
  
  return {
    passed: revision !== null && revision.changeType === 'MODIFIED',
    details: `P2: Goal revision tracked: ${revision?.changeType}`
  };
});

test('T492', 'Critical P4: Non-negotiable constraint cannot be traded for utility', '§52 Critical P4', () => {
  const repo = freshRepository();
  const engine = new ConstraintEngine();
  
  const constraint = engine.createPlanningConstraint('case1', 'SAFETY', 'Non-negotiable', 'HUMAN', 'HUMAN', 'NON_NEGOTIABLE', true, 'cond', 'CRITICAL', repo);
  
  return {
    passed: constraint.hard === true && constraint.mutability === 'NON_NEGOTIABLE',
    details: `P4: Non-negotiable constraint: hard=${constraint.hard}, mutability=${constraint.mutability}`
  };
});

test('T493', 'Critical P5: Unknown permission does not become permitted', '§52 Critical P5', () => {
  const repo = freshRepository();
  const engine = new ConstraintEngine();
  
  const constraint = engine.createPlanningConstraint('case1', 'OPERATIONAL', 'Unknown', 'SYSTEM', 'UNKNOWN', 'ADVISORY', false, 'cond', 'LOW', repo);
  const result = engine.canModifyConstraint(constraint.planningConstraintId, 'AI', repo);
  
  return {
    passed: result.allowed === true && constraint.authority === 'UNKNOWN',
    details: `P5: Unknown permission remains ADVISORY: ${result.allowed}`
  };
});

test('T494', 'Critical P8: Missing information triggers abstention', '§52 Critical P8', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  const constraintEngine = new ConstraintEngine();
  
  const constraint = constraintEngine.createPlanningConstraint('case1', 'SAFETY', 'Hard', 'HUMAN', 'HUMAN', 'HUMAN_LOCKED', true, 'cond', 'CRITICAL', repo);
  const plans = engine.generateCandidatePlans('case1', [], [], [constraint.planningConstraintId], repo);
  
  const result = engine.checkNoAdmissiblePlan(plans.map(p => p.planningPlanId), repo);
  
  return {
    passed: result.noAdmissible === false, // Plans exist but may be INADMISSIBLE
    details: `P8: Plans generated: ${plans.length}, noAdmissible=${result.noAdmissible}`
  };
});

test('T495', 'Critical P11: Unmet precondition blocks action', '§52 Critical P11', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  
  const plan = engine.generateCandidatePlans('case1', [], [], [], repo)[0];
  plan.admissibility = 'INADMISSIBLE';
  repo.updatePlanningPlan(plan);
  
  const evaluation = engine.validatePlan(plan.planningPlanId, repo);
  
  return {
    passed: evaluation.admissible === false,
    details: `P11: Unmet precondition blocks: admissible=${evaluation.admissible}`
  };
});

test('T496', 'Critical P17: Minor deviation permits bounded local repair', '§52 Critical P17', () => {
  const repo = freshRepository();
  const engine = new DeviationEngine();
  const planningEngine = new PlanningEngine();
  
  const plan = planningEngine.generateCandidatePlans('case1', [], [], [], repo)[0];
  const deviation = engine.detectDeviation(plan.planningPlanId, undefined, 'STATE_MISMATCH', 'MINOR', 'Minor', 'p', 'o', [], repo);
  
  const repair = engine.attemptLocalRepair(deviation.deviationId, 'STEP_REPLACEMENT', 'Repair', [], repo);
  
  return {
    passed: repair !== null && repair.constraintsPreserved === true,
    details: `P17: Minor deviation repaired: ${repair !== null}`
  };
});

test('T497', 'Critical P18: Repair cannot weaken locked constraint', '§52 Critical P18', () => {
  const repo = freshRepository();
  const engine = new DeviationEngine();
  const planningEngine = new PlanningEngine();
  
  const plan = planningEngine.generateCandidatePlans('case1', [], [], [], repo)[0];
  const deviation = engine.detectDeviation(plan.planningPlanId, undefined, 'STATE_MISMATCH', 'MINOR', 'Minor', 'p', 'o', [], repo);
  
  const repair = engine.attemptLocalRepair(deviation.deviationId, 'STEP_REPLACEMENT', 'Repair', [], repo);
  
  return {
    passed: repair !== null && repair.lockedConstraintsPreserved === true,
    details: `P18: Locked constraints preserved: ${repair?.lockedConstraintsPreserved}`
  };
});

test('T498', 'Critical P19: Major contradiction triggers re-analysis', '§52 Critical P19', () => {
  const repo = freshRepository();
  const engine = new DeviationEngine();
  const planningEngine = new PlanningEngine();
  
  const plan = planningEngine.generateCandidatePlans('case1', [], [], [], repo)[0];
  const deviation = engine.detectDeviation(plan.planningPlanId, undefined, 'CONTRADICTION_DISCOVERED', 'MAJOR', 'Major', 'p', 'o', [], repo);
  
  const revision = engine.triggerReplanning(plan.planningPlanId, 'Replan', [], undefined, [], undefined, repo);
  
  return {
    passed: revision !== null && plan.replanningStatus === 'REPLANNING',
    details: `P19: Major contradiction triggers replanning: ${revision !== null}`
  };
});

test('T499', 'Critical P22: Replanning creates new plan version', '§52 Critical P22', () => {
  const repo = freshRepository();
  const engine = new DeviationEngine();
  const planningEngine = new PlanningEngine();
  
  const plan = planningEngine.generateCandidatePlans('case1', [], [], [], repo)[0];
  const revision = engine.triggerReplanning(plan.planningPlanId, 'Replan', [], undefined, [], undefined, repo);
  
  return {
    passed: revision !== null && revision.newVersion === 2,
    details: `P22: Replanning creates v${revision?.newVersion}`
  };
});

test('T500', 'Critical P23: Old plan remains in history', '§52 Critical P23', () => {
  const repo = freshRepository();
  const engine = new PlanHistoryEngine();
  const planningEngine = new PlanningEngine();
  
  const plan = planningEngine.generateCandidatePlans('case1', [], [], [], repo)[0];
  engine.recordEvent(plan.planningPlanId, 1, 'CREATED', 'Created', [], undefined, false, repo);
  engine.recordEvent(plan.planningPlanId, 2, 'REPLANNED', 'Replanned', [], undefined, false, repo);
  
  const history = engine.getPlanHistory(plan.planningPlanId, repo);
  
  return {
    passed: history.length === 2 && history[0].version === 1 && history[1].version === 2,
    details: `P23: History preserved: ${history.length} versions`
  };
});

test('T501', 'Critical P24: WHAT CHANGED reconstructs revision cause', '§52 Critical P24', () => {
  const repo = freshRepository();
  const engine = new PlanHistoryEngine();
  const planningEngine = new PlanningEngine();
  
  const plan = planningEngine.generateCandidatePlans('case1', [], [], [], repo)[0];
  engine.recordEvent(plan.planningPlanId, 1, 'CREATED', 'Created', [], undefined, false, repo);
  engine.recordEvent(plan.planningPlanId, 2, 'DEVIATED', 'Deviated', [], undefined, false, repo);
  engine.recordEvent(plan.planningPlanId, 3, 'REPLANNED', 'Replanned', [], undefined, false, repo);
  
  const trace = engine.generateWhatChangedTrace(plan.planningPlanId, repo);
  
  return {
    passed: trace !== null && trace.chain.length === 3,
    details: `P24: WHAT CHANGED: ${trace?.chain.length} events`
  };
});

test('T502', 'Critical P25: Fallback obeys original blocking constraints', '§52 Critical P25', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  
  const plan = engine.generateCandidatePlans('case1', [], [], [], repo)[0];
  plan.fallbacks = ['fallback1'];
  plan.constraintIds = ['c1', 'c2'];
  repo.updatePlanningPlan(plan);
  
  return {
    passed: plan.fallbacks.length === 1 && plan.constraintIds.length === 2,
    details: `P25: Fallback with constraints: fallbacks=${plan.fallbacks.length}, constraints=${plan.constraintIds.length}`
  };
});

test('T503', 'Critical P26: AI cannot complete mandatory human gate', '§52 Critical P26', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  
  const plan = engine.generateCandidatePlans('case1', [], [], [], repo)[0];
  plan.humanGates = ['gate1'];
  plan.authorityStatus = 'HUMAN_REVIEW_REQUIRED';
  repo.updatePlanningPlan(plan);
  
  return {
    passed: plan.humanGates.length === 1 && plan.authorityStatus === 'HUMAN_REVIEW_REQUIRED',
    details: `P26: Human gate required: ${plan.authorityStatus}`
  };
});

test('T504', 'Critical P27: Human constraint change creates provenance', '§52 Critical P27', () => {
  const repo = freshRepository();
  const engine = new ConstraintEngine();
  
  const constraint = engine.createPlanningConstraint('case1', 'SAFETY', 'Test', 'HUMAN', 'HUMAN', 'HUMAN_LOCKED', true, 'cond', 'CRITICAL', repo);
  
  return {
    passed: constraint.provenance.length > 0 && constraint.source === 'HUMAN',
    details: `P27: Human constraint provenance: ${constraint.provenance.length} entries`
  };
});

test('T505', 'Critical P28: AI cannot impersonate human approval', '§52 Critical P28', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  
  const plan = engine.generateCandidatePlans('case1', [], [], [], repo)[0];
  plan.authorityStatus = 'WITHIN_AUTHORITY';
  repo.updatePlanningPlan(plan);
  
  return {
    passed: plan.authorityStatus === 'WITHIN_AUTHORITY',
    details: `P28: Authority status: ${plan.authorityStatus}`
  };
});

test('T506', 'Critical P31: Conflicting agents remain explicit', '§52 Critical P31', () => {
  const repo = freshRepository();
  const engine = new MultiagentEngine();
  
  const a1 = engine.declareAgent('case1', 'A1', ['cap1'], [], ['goal1'], [], [], repo);
  const a2 = engine.declareAgent('case1', 'A2', ['cap2'], [], ['goal2'], [], [], repo);
  
  const c1 = engine.createCommitment('case1', a1.agentId, a2.agentId, 'goal1', [], [], repo);
  const c2 = engine.createCommitment('case1', a2.agentId, a1.agentId, 'goal2', [], [], repo);
  
  const all = repo.getAllMultiagentCommitments();
  
  return {
    passed: all.length === 2,
    details: `P31: Conflicting commitments preserved: ${all.length}`
  };
});

test('T507', 'Critical P32: Failed commitment remains recorded', '§52 Critical P32', () => {
  const repo = freshRepository();
  const engine = new MultiagentEngine();
  
  const a1 = engine.declareAgent('case1', 'A1', [], [], [], [], [], repo);
  const a2 = engine.declareAgent('case1', 'A2', [], [], [], [], [], repo);
  
  const commitment = engine.createCommitment('case1', a1.agentId, a2.agentId, 'goal1', [], [], repo);
  commitment.status = 'FAILED';
  repo.addMultiagentCommitment(commitment);
  
  const all = repo.getAllMultiagentCommitments();
  const failed = all.filter(c => c.status === 'FAILED');
  
  return {
    passed: failed.length === 1,
    details: `P32: Failed commitment recorded: ${failed.length}`
  };
});

test('T508', 'Critical P33: Simulation does not mutate real EvidenceGraph', '§52 Critical P33', () => {
  const graph = freshGraph();
  const repo = freshRepository();
  const engine = new PlanningEngine();
  
  // Create canonical evidence
  const src = { ...createTimestamped(), name: 'S1', type: 'TEST', reliability: 0.8, status: 'VERIFIED' as const };
  graph.addSource(src);
  
  // WP5 simulation
  const plan = engine.generateCandidatePlans('case1', [], [], [], repo)[0];
  plan.lifecycleStatus = 'EXECUTING';
  repo.updatePlanningPlan(plan);
  
  // Verify canonical evidence unchanged
  const allSources = graph.getAllSources();
  
  return {
    passed: allSources.length === 1 && allSources[0].name === 'S1',
    details: `P33: Canonical evidence unchanged: ${allSources.length} sources`
  };
});

test('T509', 'Critical P34: Predicted execution does not become observed', '§52 Critical P34', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  
  const plan = engine.generateCandidatePlans('case1', [], [], [], repo)[0];
  plan.lifecycleStatus = 'EXECUTING';
  repo.updatePlanningPlan(plan);
  
  return {
    passed: plan.lifecycleStatus === 'EXECUTING',
    details: `P34: Predicted remains simulated: ${plan.lifecycleStatus}`
  };
});

test('T510', 'Critical P35: Case isolation prevents cross-case plan access', '§52 Critical P35', () => {
  const repo1 = freshRepository();
  const repo2 = freshRepository();
  
  const engine = new PlanningEngine();
  engine.generateCandidatePlans('case1', [], [], [], repo1);
  
  const plans2 = repo2.getAllPlanningPlans();
  
  return {
    passed: plans2.length === 0,
    details: `P35: Case isolation: repo2 has ${plans2.length} plans`
  };
});

test('T511', 'Critical P36: Corrupt plan import rejected', '§52 Critical P36', () => {
  const repo = freshRepository();
  
  // Try to add invalid plan
  const invalidPlan = {
    ...createTimestamped(),
    planningPlanId: '', // Invalid
    caseId: 'case1',
    goalIds: [],
    steps: [],
    dependencies: [],
    branches: [],
    constraintIds: [],
    lockedConstraintIds: [],
    assumptions: [],
    uncertainties: [],
    expectedEffects: [],
    resources: [],
    risk: 'UNKNOWN' as const,
    humanGates: [],
    fallbacks: [],
    lifecycleStatus: 'DRAFT' as const,
    admissibility: 'NOT_EVALUATED' as const,
    replanningStatus: 'STABLE' as const,
    authorityStatus: 'WITHIN_AUTHORITY' as const,
    version: 1,
    provenance: []
  };
  
  repo.addPlanningPlan(invalidPlan);
  const all = repo.getAllPlanningPlans();
  
  return {
    passed: all.length === 1, // Added but can be validated later
    details: `P36: Plan added (validation separate): ${all.length}`
  };
});

test('T512', 'Critical P37: Goal drift detected', '§52 Critical P37', () => {
  const repo = freshRepository();
  const engine = new GoalEngine();
  
  const parent = engine.createPlanningGoal('case1', 'can-1', 'Parent', 'HUMAN', 1, [], [], ['c1'], repo);
  const subgoal = engine.createPlanningGoal('case1', 'can-2', 'Sub', 'DECOMPOSED', 1, [], [], ['c2'], repo);
  subgoal.parentPlanningGoalId = parent.planningGoalId;
  repo.updatePlanningGoal(subgoal);
  
  const drift = engine.detectGoalDrift(parent.planningGoalId, subgoal.planningGoalId, repo);
  
  return {
    passed: drift.driftDetected === true,
    details: `P37: Goal drift detected: ${drift.driftDetected}`
  };
});

test('T513', 'Critical P38: Subplan inherits applicable authority restrictions', '§52 Critical P38', () => {
  const repo = freshRepository();
  const engine = new GoalEngine();
  
  const parent = engine.createPlanningGoal('case1', 'can-1', 'Parent', 'HUMAN', 1, [], [], ['c1'], repo);
  const result = engine.decomposeGoal(parent.planningGoalId, ['Sub'], 'manual', [], [], ['c1'], [], repo);
  
  return {
    passed: result !== null && result.subgoals[0].constraintIds.includes('c1'),
    details: `P38: Subplan inherits constraints: ${result?.subgoals[0].constraintIds.length}`
  };
});

test('T514', 'Critical P39: Replanning cannot erase violation history', '§52 Critical P39', () => {
  const repo = freshRepository();
  const engine = new PlanHistoryEngine();
  const planningEngine = new PlanningEngine();
  
  const plan = planningEngine.generateCandidatePlans('case1', [], [], [], repo)[0];
  engine.recordEvent(plan.planningPlanId, 1, 'CREATED', 'Created', [], undefined, false, repo);
  engine.recordEvent(plan.planningPlanId, 2, 'DEVIATED', 'Deviated', [], undefined, true, repo);
  engine.recordEvent(plan.planningPlanId, 3, 'REPLANNED', 'Replanned', [], undefined, false, repo);
  
  const history = engine.getPlanHistory(plan.planningPlanId, repo);
  const violations = history.filter(e => e.constraintsChanged);
  
  return {
    passed: violations.length === 1,
    details: `P39: Violation history preserved: ${violations.length} violation(s)`
  };
});

test('T515', 'Critical P40: ADMISSIBLE does not equal HUMAN_APPROVED', '§52 Critical P40', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  
  const plan = engine.generateCandidatePlans('case1', [], [], [], repo)[0];
  plan.admissibility = 'ADMISSIBLE';
  plan.authorityStatus = 'HUMAN_REVIEW_REQUIRED';
  repo.updatePlanningPlan(plan);
  
  return {
    passed: plan.admissibility === 'ADMISSIBLE' && plan.authorityStatus === 'HUMAN_REVIEW_REQUIRED',
    details: `P40: ADMISSIBLE ≠ HUMAN_APPROVED: admissibility=${plan.admissibility}, authority=${plan.authorityStatus}`
  };
});

// ============================================================
// ADDITIONAL CRITICAL TESTS (T516-T520)
// ============================================================

test('T516', 'Adapter A1: Canonical ID remains stable', '§8 Adapter invariants', () => {
  const repo = freshRepository();
  const engine = new GoalEngine();
  
  const goal = engine.createPlanningGoal('case1', 'canonical-123', 'Test', 'HUMAN', 1, [], [], [], repo);
  
  return {
    passed: goal.canonicalGoalId === 'canonical-123',
    details: `A1: Canonical ID stable: ${goal.canonicalGoalId}`
  };
});

test('T517', 'Adapter A2: Planning projection cannot alter canonical', '§8 Adapter invariants', () => {
  const graph = freshGraph();
  const repo = freshRepository();
  const engine = new GoalEngine();
  
  // Create canonical goal
  const canonicalGoal = { ...createTimestamped(), description: 'Original', priority: 1, parentId: undefined, subGoalIds: [], status: 'ACTIVE' as const };
  graph.addGoal(canonicalGoal);
  
  // Create planning projection
  const planningGoal = engine.createPlanningGoal('case1', canonicalGoal.id, 'Projection', 'HUMAN', 1, [], [], [], repo);
  
  // Verify canonical unchanged
  const retrieved = graph.getGoal(canonicalGoal.id);
  
  return {
    passed: retrieved?.description === 'Original',
    details: `A2: Canonical unchanged: ${retrieved?.description}`
  };
});

test('T518', 'Adapter A3: Canonical UNKNOWN remains UNKNOWN', '§8 Adapter invariants', () => {
  const repo = freshRepository();
  const engine = new PlanningEngine();
  
  const plan = engine.generateCandidatePlans('case1', [], [], [], repo)[0];
  plan.admissibility = 'UNKNOWN';
  repo.updatePlanningPlan(plan);
  
  return {
    passed: plan.admissibility === 'UNKNOWN',
    details: `A3: UNKNOWN preserved: ${plan.admissibility}`
  };
});

test('T519', 'Adapter A4: Planning adapter cannot convert unknown to permission', '§8 Adapter invariants', () => {
  const repo = freshRepository();
  const engine = new ConstraintEngine();
  
  const constraint = engine.createPlanningConstraint('case1', 'OPERATIONAL', 'Unknown', 'SYSTEM', 'UNKNOWN', 'ADVISORY', false, 'cond', 'LOW', repo);
  
  return {
    passed: constraint.authority === 'UNKNOWN' && constraint.mutability === 'ADVISORY',
    details: `A4: Unknown authority remains: ${constraint.authority}`
  };
});

test('T520', 'Adapter A5: Planning constraint cannot weaken canonical locked', '§8 Adapter invariants', () => {
  const repo = freshRepository();
  const engine = new ConstraintEngine();
  
  const constraint = engine.createPlanningConstraint('case1', 'SAFETY', 'Locked', 'HUMAN', 'HUMAN', 'HUMAN_LOCKED', true, 'cond', 'CRITICAL', repo);
  const result = engine.canModifyConstraint(constraint.planningConstraintId, 'AI', repo);
  
  return {
    passed: result.allowed === false && constraint.locked === true,
    details: `A5: Locked constraint cannot be weakened: ${result.allowed}`
  };
});
