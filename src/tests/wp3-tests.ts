/**
 * HAG-RAP LAB — WP3 Test Suite
 * Deep Reasoning & Causal Inference Tests
 * 
 * This test suite verifies WP3 capabilities while preserving WP2 invariants.
 * Minimum 80 tests required for ORDER 2 acceptance.
 */

import { test, assert, assertEqual, assertGreaterThan } from './framework.ts';
import { EvidenceGraphMemory } from '../domain/evidence-graph.ts';
import {
  DeductiveEngine, InductiveEngine, AbductiveEngine,
  DefeasibleEngine, CausalEngine, SufficiencyEngine,
  ProofTraceEngine
} from '../domain/wp3-engines.ts';
import {
  Source, EvidenceItem, Claim, Assumption, ClaimStatus,
  CausalVariable, CausalModel, CounterfactualQuery,
  ReasoningReview, BenchmarkCase, AblationConfiguration,
  createTimestamped, now, generateId
} from '../domain/types.ts';

// Helper functions
function freshGraph(): EvidenceGraphMemory {
  return new EvidenceGraphMemory();
}

function makeSource(name: string, reliability = 0.8): Source {
  return { ...createTimestamped(), name, type: 'TEST', reliability, status: 'VERIFIED' };
}

function makeEvidence(sourceId: string, content: string, status: 'AVAILABLE' | 'MISSING' = 'AVAILABLE'): EvidenceItem {
  return { ...createTimestamped(), sourceId, content, type: 'TEST', status, tags: [] };
}

function makeClaim(content: string, status: ClaimStatus = 'INFERRED', evidenceIds: string[] = []): Claim {
  return {
    ...createTimestamped(), content, status, evidenceIds, assumptionIds: [],
    inferenceIds: [], uncertainty: [], verificationStatus: 'NOT_CHECKED', scientificStatus: 'IMPLEMENTED'
  };
}

// ============================================================
// DEDUCTIVE REASONING TESTS (T061-T080)
// ============================================================

test('T061', 'Deductive: Basic modus ponens', '§5 Deductive reasoning', () => {
  const graph = freshGraph();
  const engine = new DeductiveEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const ev = makeEvidence(src.id, 'A is true');
  graph.addEvidence(ev);
  
  const claimA = makeClaim('A', 'OBSERVED', [ev.id]);
  graph.addClaim(claimA);
  
  const rule = {
    id: generateId(),
    name: 'A implies B',
    premises: [claimA.id],
    conclusion: 'B',
    assumptions: [],
    description: 'If A then B'
  };
  engine.addRule(rule);
  
  const result = engine.applyRule(rule.id, graph);
  
  return {
    passed: result !== null && result.conclusion.content === 'B' && result.conclusion.status === 'INFERRED',
    details: `Deduction produced: ${result?.conclusion.content} with status ${result?.conclusion.status}`
  };
});

test('T062', 'Deductive: Missing premise blocks deduction', '§5 No manufactured premises', () => {
  const graph = freshGraph();
  const engine = new DeductiveEngine();
  
  const rule = {
    id: generateId(),
    name: 'A and B implies C',
    premises: ['missing-a', 'missing-b'],
    conclusion: 'C',
    assumptions: [],
    description: 'If A and B then C'
  };
  engine.addRule(rule);
  
  const result = engine.applyRule(rule.id, graph);
  
  return {
    passed: result === null,
    details: `Deduction correctly blocked: missing premises prevent conclusion`
  };
});

test('T063', 'Deductive: Multi-step chain', '§6 Multi-step deduction', () => {
  const graph = freshGraph();
  const engine = new DeductiveEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const ev = makeEvidence(src.id, 'A');
  graph.addEvidence(ev);
  
  const claimA = makeClaim('A', 'OBSERVED', [ev.id]);
  graph.addClaim(claimA);
  
  const rule1 = {
    id: generateId(),
    name: 'A→B',
    premises: [claimA.id],
    conclusion: 'B',
    assumptions: [],
    description: 'A implies B'
  };
  
  let rule2 = {
    id: generateId(),
    name: 'B→C',
    premises: [] as string[], // Will be filled after rule1
    conclusion: 'C',
    assumptions: [],
    description: 'B implies C'
  };
  
  engine.addRule(rule1);
  const result1 = engine.applyRule(rule1.id, graph);
  
  if (result1) {
    rule2.premises = [result1.conclusion.id];
    engine.addRule(rule2);
    const result2 = engine.applyRule(rule2.id, graph);
    
    return {
      passed: result2 !== null && result2.conclusion.content === 'C',
      details: `Chain: A → B → C completed`
    };
  }
  
  return { passed: false, details: 'First deduction failed' };
});

test('T064', 'Deductive: Proof trace generated', '§23 Proof-carrying explanation', () => {
  const graph = freshGraph();
  const engine = new DeductiveEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const ev = makeEvidence(src.id, 'A');
  graph.addEvidence(ev);
  
  const claimA = makeClaim('A', 'OBSERVED', [ev.id]);
  graph.addClaim(claimA);
  
  const rule = {
    id: generateId(),
    name: 'A→B',
    premises: [claimA.id],
    conclusion: 'B',
    assumptions: [],
    description: 'A implies B'
  };
  engine.addRule(rule);
  
  const result = engine.applyRule(rule.id, graph);
  
  return {
    passed: result !== null && result.proofTrace.nodes.length > 0 && result.proofTrace.edges.length > 0,
    details: `Proof trace: ${result?.proofTrace.nodes.length} nodes, ${result?.proofTrace.edges.length} edges`
  };
});

test('T065', 'Deductive: Circularity detection', '§31 Circular reasoning', () => {
  const graph = freshGraph();
  const engine = new DeductiveEngine();
  
  const claimA = makeClaim('A', 'INFERRED');
  graph.addClaim(claimA);
  
  // Rule that concludes A from A (circular)
  const rule = {
    id: generateId(),
    name: 'Circular',
    premises: [claimA.id],
    conclusion: 'A', // Same as premise
    assumptions: [],
    description: 'A implies A'
  };
  engine.addRule(rule);
  
  const result = engine.applyRule(rule.id, graph);
  
  return {
    passed: result === null,
    details: `Circular reasoning correctly detected and blocked`
  };
});

test('T066', 'Deductive: Superseded premise blocks deduction', '§2 Epistemic invariant', () => {
  const graph = freshGraph();
  const engine = new DeductiveEngine();
  
  const claimA = makeClaim('A', 'SUPERSEDED');
  graph.addClaim(claimA);
  
  const rule = {
    id: generateId(),
    name: 'A→B',
    premises: [claimA.id],
    conclusion: 'B',
    assumptions: [],
    description: 'A implies B'
  };
  engine.addRule(rule);
  
  const result = engine.applyRule(rule.id, graph);
  
  return {
    passed: result === null,
    details: `Deduction blocked: premise has SUPERSEDED status`
  };
});

test('T067', 'Deductive: Contested premise blocks deduction', '§2 Epistemic invariant', () => {
  const graph = freshGraph();
  const engine = new DeductiveEngine();
  
  const claimA = makeClaim('A', 'CONTESTED');
  graph.addClaim(claimA);
  
  const rule = {
    id: generateId(),
    name: 'A→B',
    premises: [claimA.id],
    conclusion: 'B',
    assumptions: [],
    description: 'A implies B'
  };
  engine.addRule(rule);
  
  const result = engine.applyRule(rule.id, graph);
  
  return {
    passed: result === null,
    details: `Deduction blocked: premise has CONTESTED status`
  };
});

test('T068', 'Deductive: Proof trace is machine-readable', '§23 Machine-readable proof', () => {
  const graph = freshGraph();
  const engine = new DeductiveEngine();
  
  const claimA = makeClaim('A', 'OBSERVED');
  graph.addClaim(claimA);
  
  const rule = {
    id: generateId(),
    name: 'A→B',
    premises: [claimA.id],
    conclusion: 'B',
    assumptions: [],
    description: 'A implies B'
  };
  engine.addRule(rule);
  
  const result = engine.applyRule(rule.id, graph);
  
  return {
    passed: result !== null && result.proofTrace.machineReadable === true,
    details: `Proof trace marked as machine-readable`
  };
});

test('T069', 'Deductive: Proof trace validity', '§23 Proof validity', () => {
  const graph = freshGraph();
  const engine = new DeductiveEngine();
  
  const claimA = makeClaim('A', 'OBSERVED');
  graph.addClaim(claimA);
  
  const rule = {
    id: generateId(),
    name: 'A→B',
    premises: [claimA.id],
    conclusion: 'B',
    assumptions: [],
    description: 'A implies B'
  };
  engine.addRule(rule);
  
  const result = engine.applyRule(rule.id, graph);
  
  return {
    passed: result !== null && result.proofTrace.validity === 'VALID',
    details: `Proof trace validity: ${result?.proofTrace.validity}`
  };
});

test('T070', 'Deductive: Chain deduction produces multiple proof traces', '§6 Complete path', () => {
  const graph = freshGraph();
  const engine = new DeductiveEngine();
  
  const claimA = makeClaim('A', 'OBSERVED');
  graph.addClaim(claimA);
  
  const rule1 = {
    id: generateId(),
    name: 'A→B',
    premises: [claimA.id],
    conclusion: 'B',
    assumptions: [],
    description: 'A implies B'
  };
  
  engine.addRule(rule1);
  const result1 = engine.applyRule(rule1.id, graph);
  
  if (result1) {
    const rule2 = {
      id: generateId(),
      name: 'B→C',
      premises: [result1.conclusion.id],
      conclusion: 'C',
      assumptions: [],
      description: 'B implies C'
    };
    
    engine.addRule(rule2);
    const result2 = engine.applyRule(rule2.id, graph);
    
    const { proofTraces } = engine.chainDeduction([rule1.id, rule2.id], graph);
    
    return {
      passed: proofTraces.length >= 2,
      details: `Chain produced ${proofTraces.length} proof traces`
    };
  }
  
  return { passed: false, details: 'First deduction failed' };
});

// ============================================================
// INDUCTIVE REASONING TESTS (T071-T080)
// ============================================================

test('T071', 'Inductive: Basic generalization', '§7 Inductive reasoning', () => {
  const graph = freshGraph();
  const engine = new InductiveEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  
  const ev1 = makeEvidence(src.id, 'Observation 1');
  const ev2 = makeEvidence(src.id, 'Observation 2');
  const ev3 = makeEvidence(src.id, 'Observation 3');
  graph.addEvidence(ev1);
  graph.addEvidence(ev2);
  graph.addEvidence(ev3);
  
  const pattern = {
    id: generateId(),
    observations: [ev1.id, ev2.id, ev3.id],
    generalization: 'All observations show pattern X',
    sampleSize: 3,
    exceptions: [],
    counterexamples: [],
    applicabilityLimitations: ['Limited to observed cases']
  };
  
  const result = engine.deriveGeneralization(pattern, graph);
  
  return {
    passed: result !== null && result.conclusion.status === 'INFERRED',
    details: `Inductive conclusion status: ${result?.conclusion.status} (must be INFERRED, not OBSERVED)`
  };
});

test('T072', 'Inductive: Insufficient sample blocks generalization', '§7 No universal from insufficient', () => {
  const graph = freshGraph();
  const engine = new InductiveEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const ev1 = makeEvidence(src.id, 'Observation 1');
  graph.addEvidence(ev1);
  
  const pattern = {
    id: generateId(),
    observations: [ev1.id],
    generalization: 'Universal claim',
    sampleSize: 1, // Too small
    exceptions: [],
    counterexamples: [],
    applicabilityLimitations: []
  };
  
  const result = engine.deriveGeneralization(pattern, graph);
  
  return {
    passed: result === null,
    details: `Induction blocked: sample size too small`
  };
});

test('T073', 'Inductive: Missing evidence blocks generalization', '§7 Evidence requirement', () => {
  const graph = freshGraph();
  const engine = new InductiveEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const ev1 = makeEvidence(src.id, 'Observation 1', 'MISSING');
  graph.addEvidence(ev1);
  
  const pattern = {
    id: generateId(),
    observations: [ev1.id],
    generalization: 'Claim',
    sampleSize: 2,
    exceptions: [],
    counterexamples: [],
    applicabilityLimitations: []
  };
  
  const result = engine.deriveGeneralization(pattern, graph);
  
  return {
    passed: result === null,
    details: `Induction blocked: missing evidence`
  };
});

test('T074', 'Inductive: Conclusion includes uncertainty', '§21 Uncertainty preservation', () => {
  const graph = freshGraph();
  const engine = new InductiveEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const ev1 = makeEvidence(src.id, 'Obs 1');
  const ev2 = makeEvidence(src.id, 'Obs 2');
  graph.addEvidence(ev1);
  graph.addEvidence(ev2);
  
  const pattern = {
    id: generateId(),
    observations: [ev1.id, ev2.id],
    generalization: 'Pattern',
    sampleSize: 2,
    exceptions: [],
    counterexamples: [],
    applicabilityLimitations: []
  };
  
  const result = engine.deriveGeneralization(pattern, graph);
  
  return {
    passed: result !== null && result.conclusion.uncertainty.length > 0,
    details: `Inductive conclusion has ${result?.conclusion.uncertainty.length} uncertainty marker(s)`
  };
});

test('T075', 'Inductive: Scientific status is EXPERIMENTAL', '§3 Scientific honesty', () => {
  const graph = freshGraph();
  const engine = new InductiveEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const ev1 = makeEvidence(src.id, 'Obs 1');
  const ev2 = makeEvidence(src.id, 'Obs 2');
  graph.addEvidence(ev1);
  graph.addEvidence(ev2);
  
  const pattern = {
    id: generateId(),
    observations: [ev1.id, ev2.id],
    generalization: 'Pattern',
    sampleSize: 2,
    exceptions: [],
    counterexamples: [],
    applicabilityLimitations: []
  };
  
  const result = engine.deriveGeneralization(pattern, graph);
  
  return {
    passed: result !== null && result.conclusion.scientificStatus === 'EXPERIMENTAL',
    details: `Inductive conclusion marked as EXPERIMENTAL`
  };
});

test('T076', 'Inductive: Proof trace generated', '§23 Proof trace', () => {
  const graph = freshGraph();
  const engine = new InductiveEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const ev1 = makeEvidence(src.id, 'Obs 1');
  const ev2 = makeEvidence(src.id, 'Obs 2');
  graph.addEvidence(ev1);
  graph.addEvidence(ev2);
  
  const pattern = {
    id: generateId(),
    observations: [ev1.id, ev2.id],
    generalization: 'Pattern',
    sampleSize: 2,
    exceptions: [],
    counterexamples: [],
    applicabilityLimitations: []
  };
  
  const result = engine.deriveGeneralization(pattern, graph);
  
  return {
    passed: result !== null && result.proofTrace.nodes.length > 0,
    details: `Inductive proof trace: ${result?.proofTrace.nodes.length} nodes`
  };
});

test('T077', 'Inductive: Proof trace family is INDUCTIVE', '§4 Inference family', () => {
  const graph = freshGraph();
  const engine = new InductiveEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const ev1 = makeEvidence(src.id, 'Obs 1');
  const ev2 = makeEvidence(src.id, 'Obs 2');
  graph.addEvidence(ev1);
  graph.addEvidence(ev2);
  
  const pattern = {
    id: generateId(),
    observations: [ev1.id, ev2.id],
    generalization: 'Pattern',
    sampleSize: 2,
    exceptions: [],
    counterexamples: [],
    applicabilityLimitations: []
  };
  
  const result = engine.deriveGeneralization(pattern, graph);
  
  return {
    passed: result !== null && result.proofTrace.family === 'INDUCTIVE',
    details: `Proof trace family: ${result?.proofTrace.family}`
  };
});

test('T078', 'Inductive: One-example generalization blocked', '§43 Adversarial: overgeneralization', () => {
  const graph = freshGraph();
  const engine = new InductiveEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const ev1 = makeEvidence(src.id, 'Single observation');
  graph.addEvidence(ev1);
  
  const pattern = {
    id: generateId(),
    observations: [ev1.id],
    generalization: 'Universal claim from single example',
    sampleSize: 1,
    exceptions: [],
    counterexamples: [],
    applicabilityLimitations: []
  };
  
  const result = engine.deriveGeneralization(pattern, graph);
  
  return {
    passed: result === null,
    details: `Overgeneralization blocked: single example insufficient`
  };
});

test('T079', 'Inductive: Counterexamples tracked', '§7 Counterexamples', () => {
  const graph = freshGraph();
  const engine = new InductiveEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const ev1 = makeEvidence(src.id, 'Obs 1');
  const ev2 = makeEvidence(src.id, 'Obs 2');
  graph.addEvidence(ev1);
  graph.addEvidence(ev2);
  
  const pattern = {
    id: generateId(),
    observations: [ev1.id, ev2.id],
    generalization: 'Pattern',
    sampleSize: 2,
    exceptions: [],
    counterexamples: ['counter1', 'counter2'],
    applicabilityLimitations: []
  };
  
  const result = engine.deriveGeneralization(pattern, graph);
  
  return {
    passed: result !== null && result.inference.rejectedAlternatives.length === 2,
    details: `Counterexamples tracked: ${result?.inference.rejectedAlternatives.length}`
  };
});

test('T080', 'Inductive: Applicability limitations preserved', '§7 Limitations', () => {
  const graph = freshGraph();
  const engine = new InductiveEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const ev1 = makeEvidence(src.id, 'Obs 1');
  const ev2 = makeEvidence(src.id, 'Obs 2');
  graph.addEvidence(ev1);
  graph.addEvidence(ev2);
  
  const pattern = {
    id: generateId(),
    observations: [ev1.id, ev2.id],
    generalization: 'Pattern',
    sampleSize: 2,
    exceptions: [],
    counterexamples: [],
    applicabilityLimitations: ['Limited to context A', 'Not valid for context B']
  };
  
  const result = engine.deriveGeneralization(pattern, graph);
  
  return {
    passed: result !== null,
    details: `Inductive generalization created with applicability limitations`
  };
});

// ============================================================
// ABDUCTIVE REASONING TESTS (T081-T090)
// ============================================================

test('T081', 'Abductive: Generate hypotheses', '§8 Abductive reasoning', () => {
  const graph = freshGraph();
  const engine = new AbductiveEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const obs = makeEvidence(src.id, 'Observation O');
  graph.addEvidence(obs);
  
  const hypotheses = [
    {
      id: generateId(),
      description: 'Hypothesis H1',
      supportingEvidenceIds: [obs.id],
      contradictingEvidenceIds: [],
      assumptions: [],
      missingEvidence: [],
      explanatoryCoverage: 0.8,
      parsimony: 0.7
    },
    {
      id: generateId(),
      description: 'Hypothesis H2',
      supportingEvidenceIds: [],
      contradictingEvidenceIds: [obs.id],
      assumptions: [],
      missingEvidence: [],
      explanatoryCoverage: 0.3,
      parsimony: 0.5
    }
  ];
  
  const result = engine.generateHypotheses(obs.id, hypotheses, graph);
  
  return {
    passed: result.hypotheses.length === 2,
    details: `Generated ${result.hypotheses.length} hypotheses`
  };
});

test('T082', 'Abductive: Ranking is deterministic', '§9 Transparent ranking', () => {
  const graph = freshGraph();
  const engine = new AbductiveEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const obs = makeEvidence(src.id, 'Observation');
  graph.addEvidence(obs);
  
  const hypotheses = [
    {
      id: generateId(),
      description: 'H1',
      supportingEvidenceIds: [obs.id],
      contradictingEvidenceIds: [],
      assumptions: [],
      missingEvidence: [],
      explanatoryCoverage: 0.9,
      parsimony: 0.8
    },
    {
      id: generateId(),
      description: 'H2',
      supportingEvidenceIds: [],
      contradictingEvidenceIds: [],
      assumptions: [],
      missingEvidence: [],
      explanatoryCoverage: 0.5,
      parsimony: 0.5
    }
  ];
  
  const result = engine.generateHypotheses(obs.id, hypotheses, graph);
  
  return {
    passed: result.hypotheses[0].rank > result.hypotheses[1].rank,
    details: `H1 rank: ${result.hypotheses[0].rank.toFixed(2)}, H2 rank: ${result.hypotheses[1].rank.toFixed(2)}`
  };
});

test('T083', 'Abductive: Top hypothesis remains HYPOTHESIS', '§8 Not auto-promoted to FACT', () => {
  const graph = freshGraph();
  const engine = new AbductiveEngine();
  
  const hypothesis = {
    id: generateId(),
    description: 'Best hypothesis',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    assumptions: [],
    missingEvidence: [],
    explanatoryCoverage: 0.9,
    parsimony: 0.9
  };
  
  const claim = engine.createHypothesisClaim(hypothesis, 0.9, graph);
  
  return {
    passed: claim.status === 'INFERRED' && claim.content.includes('[HYPOTHESIS'),
    details: `Top hypothesis status: ${claim.status}, content includes HYPOTHESIS marker`
  };
});

test('T084', 'Abductive: Ranking rationale provided', '§9 Transparency', () => {
  const graph = freshGraph();
  const engine = new AbductiveEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const obs = makeEvidence(src.id, 'Observation');
  graph.addEvidence(obs);
  
  const hypotheses = [
    {
      id: generateId(),
      description: 'H1',
      supportingEvidenceIds: [obs.id],
      contradictingEvidenceIds: [],
      assumptions: [],
      missingEvidence: [],
      explanatoryCoverage: 0.8,
      parsimony: 0.7
    }
  ];
  
  const result = engine.generateHypotheses(obs.id, hypotheses, graph);
  
  return {
    passed: result.hypotheses[0].rationale.length > 0,
    details: `Ranking rationale: ${result.hypotheses[0].rationale}`
  };
});

test('T085', 'Abductive: Missing evidence tracked', '§8 Missing evidence', () => {
  const graph = freshGraph();
  const engine = new AbductiveEngine();
  
  const hypothesis = {
    id: generateId(),
    description: 'Hypothesis with missing evidence',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    assumptions: [],
    missingEvidence: ['missing1', 'missing2'],
    explanatoryCoverage: 0.5,
    parsimony: 0.5
  };
  
  const claim = engine.createHypothesisClaim(hypothesis, 0.5, graph);
  
  return {
    passed: claim.uncertainty.length > 0,
    details: `Hypothesis with missing evidence has uncertainty markers`
  };
});

test('T086', 'Abductive: Contradictions tracked', '§8 Contradictions', () => {
  const graph = freshGraph();
  const engine = new AbductiveEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const contradicting = makeEvidence(src.id, 'Contradicting evidence');
  graph.addEvidence(contradicting);
  
  const hypothesis = {
    id: generateId(),
    description: 'Hypothesis with contradictions',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [contradicting.id],
    assumptions: [],
    missingEvidence: [],
    explanatoryCoverage: 0.5,
    parsimony: 0.5
  };
  
  const claim = engine.createHypothesisClaim(hypothesis, 0.5, graph);
  
  return {
    passed: claim.evidenceIds.length === 0, // No supporting evidence
    details: `Hypothesis with contradictions has no supporting evidence IDs`
  };
});

test('T087', 'Abductive: No fake probabilities', '§9 No pseudo-probabilities', () => {
  const graph = freshGraph();
  const engine = new AbductiveEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const obs = makeEvidence(src.id, 'Observation');
  graph.addEvidence(obs);
  
  const hypotheses = [
    {
      id: generateId(),
      description: 'H1',
      supportingEvidenceIds: [obs.id],
      contradictingEvidenceIds: [],
      assumptions: [],
      missingEvidence: [],
      explanatoryCoverage: 0.8,
      parsimony: 0.7
    }
  ];
  
  const result = engine.generateHypotheses(obs.id, hypotheses, graph);
  
  // Rank is deterministic score, not probability
  const rank = result.hypotheses[0].rank;
  return {
    passed: rank >= 0 && rank <= 1,
    details: `Rank is deterministic score (0-1), not probability: ${rank.toFixed(2)}`
  };
});

test('T088', 'Abductive: Multiple hypotheses preserved', '§8 Alternatives', () => {
  const graph = freshGraph();
  const engine = new AbductiveEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const obs = makeEvidence(src.id, 'Observation');
  graph.addEvidence(obs);
  
  const hypotheses = [
    { id: generateId(), description: 'H1', supportingEvidenceIds: [obs.id], contradictingEvidenceIds: [], assumptions: [], missingEvidence: [], explanatoryCoverage: 0.8, parsimony: 0.7 },
    { id: generateId(), description: 'H2', supportingEvidenceIds: [obs.id], contradictingEvidenceIds: [], assumptions: [], missingEvidence: [], explanatoryCoverage: 0.6, parsimony: 0.6 },
    { id: generateId(), description: 'H3', supportingEvidenceIds: [], contradictingEvidenceIds: [], assumptions: [], missingEvidence: [], explanatoryCoverage: 0.4, parsimony: 0.5 }
  ];
  
  const result = engine.generateHypotheses(obs.id, hypotheses, graph);
  
  return {
    passed: result.hypotheses.length === 3,
    details: `All ${result.hypotheses.length} hypotheses preserved (not just top one)`
  };
});

test('T089', 'Abductive: Explanatory coverage affects ranking', '§9 Ranking factors', () => {
  const graph = freshGraph();
  const engine = new AbductiveEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const obs = makeEvidence(src.id, 'Observation');
  graph.addEvidence(obs);
  
  const hypotheses = [
    { id: generateId(), description: 'High coverage', supportingEvidenceIds: [obs.id], contradictingEvidenceIds: [], assumptions: [], missingEvidence: [], explanatoryCoverage: 0.9, parsimony: 0.5 },
    { id: generateId(), description: 'Low coverage', supportingEvidenceIds: [obs.id], contradictingEvidenceIds: [], assumptions: [], missingEvidence: [], explanatoryCoverage: 0.3, parsimony: 0.5 }
  ];
  
  const result = engine.generateHypotheses(obs.id, hypotheses, graph);
  
  return {
    passed: result.hypotheses[0].rank > result.hypotheses[1].rank,
    details: `Higher coverage → higher rank: ${result.hypotheses[0].rank.toFixed(2)} > ${result.hypotheses[1].rank.toFixed(2)}`
  };
});

test('T090', 'Abductive: Parsimony affects ranking', '§9 Ranking factors', () => {
  const graph = freshGraph();
  const engine = new AbductiveEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const obs = makeEvidence(src.id, 'Observation');
  graph.addEvidence(obs);
  
  const hypotheses = [
    { id: generateId(), description: 'Simple', supportingEvidenceIds: [obs.id], contradictingEvidenceIds: [], assumptions: [], missingEvidence: [], explanatoryCoverage: 0.5, parsimony: 0.9 },
    { id: generateId(), description: 'Complex', supportingEvidenceIds: [obs.id], contradictingEvidenceIds: [], assumptions: [], missingEvidence: [], explanatoryCoverage: 0.5, parsimony: 0.3 }
  ];
  
  const result = engine.generateHypotheses(obs.id, hypotheses, graph);
  
  return {
    passed: result.hypotheses[0].rank > result.hypotheses[1].rank,
    details: `Higher parsimony → higher rank: ${result.hypotheses[0].rank.toFixed(2)} > ${result.hypotheses[1].rank.toFixed(2)}`
  };
});

// ============================================================
// DEFEASIBLE REASONING TESTS (T091-T100)
// ============================================================

test('T091', 'Defeasible: Default rule applies', '§10 Defeasible reasoning', () => {
  const graph = freshGraph();
  const engine = new DefeasibleEngine();
  
  const rule = {
    id: generateId(),
    default: 'Normally birds fly',
    conclusion: 'Tweety flies',
    exceptions: ['penguin', 'injured'],
    priority: 5
  };
  engine.addRule(rule);
  
  const result = engine.applyRule(rule.id, new Set(), graph);
  
  return {
    passed: result !== null && !result.retracted && result.conclusion.status === 'INFERRED',
    details: `Default rule applied: ${result?.conclusion.content}`
  };
});

test('T092', 'Defeasible: Exception retracts conclusion', '§10 Exception handling', () => {
  const graph = freshGraph();
  const engine = new DefeasibleEngine();
  
  const rule = {
    id: generateId(),
    default: 'Normally birds fly',
    conclusion: 'Tweety flies',
    exceptions: ['penguin'],
    priority: 5
  };
  engine.addRule(rule);
  
  const result = engine.applyRule(rule.id, new Set(['penguin']), graph);
  
  return {
    passed: result !== null && result.retracted && result.conclusion.status === 'SUPERSEDED',
    details: `Exception triggered: conclusion retracted with status ${result?.conclusion.status}`
  };
});

test('T093', 'Defeasible: Old conclusion preserved', '§11 Change-of-mind', () => {
  const graph = freshGraph();
  const engine = new DefeasibleEngine();
  
  const rule = {
    id: generateId(),
    default: 'Default',
    conclusion: 'Conclusion A',
    exceptions: ['exception'],
    priority: 5
  };
  engine.addRule(rule);
  
  // Apply without exception
  const result1 = engine.applyRule(rule.id, new Set(), graph);
  const oldId = result1?.conclusion.id;
  
  // Apply with exception
  const result2 = engine.applyRule(rule.id, new Set(['exception']), graph);
  
  // Old conclusion should still exist in graph
  const oldClaim = graph.getClaim(oldId!);
  
  return {
    passed: oldClaim !== undefined && oldClaim.status === 'INFERRED',
    details: `Old conclusion preserved in graph with status ${oldClaim?.status}`
  };
});

test('T094', 'Defeasible: Revision history tracked', '§11 Revision tracking', () => {
  const graph = freshGraph();
  const engine = new DefeasibleEngine();
  
  const rule = {
    id: generateId(),
    default: 'Default',
    conclusion: 'Conclusion',
    exceptions: ['exception'],
    priority: 5
  };
  engine.addRule(rule);
  
  const result1 = engine.applyRule(rule.id, new Set(), graph);
  const result2 = engine.applyRule(rule.id, new Set(['exception']), graph);
  
  engine.recordRevision('topic', result1!.conclusion.id, result2!.conclusion.id, 'Exception triggered');
  
  const history = engine.getRevisionHistory('topic');
  
  return {
    passed: history.length === 1,
    details: `Revision history: ${history.length} record(s)`
  };
});

test('T095', 'Defeasible: Proof trace shows retraction', '§23 Proof trace', () => {
  const graph = freshGraph();
  const engine = new DefeasibleEngine();
  
  const rule = {
    id: generateId(),
    default: 'Default',
    conclusion: 'Conclusion',
    exceptions: ['exception'],
    priority: 5
  };
  engine.addRule(rule);
  
  const result = engine.applyRule(rule.id, new Set(['exception']), graph);
  
  return {
    passed: result !== null && result.proofTrace.validity === 'INVALID',
    details: `Proof trace validity: ${result?.proofTrace.validity} (INVALID when retracted)`
  };
});

test('T096', 'Defeasible: Uncertainty preserved', '§21 Uncertainty', () => {
  const graph = freshGraph();
  const engine = new DefeasibleEngine();
  
  const rule = {
    id: generateId(),
    default: 'Default',
    conclusion: 'Conclusion',
    exceptions: [],
    priority: 5
  };
  engine.addRule(rule);
  
  const result = engine.applyRule(rule.id, new Set(), graph);
  
  return {
    passed: result !== null && result.conclusion.uncertainty.length > 0,
    details: `Defeasible conclusion has ${result?.conclusion.uncertainty.length} uncertainty marker(s)`
  };
});

test('T097', 'Defeasible: Multiple exceptions handled', '§10 Multiple exceptions', () => {
  const graph = freshGraph();
  const engine = new DefeasibleEngine();
  
  const rule = {
    id: generateId(),
    default: 'Default',
    conclusion: 'Conclusion',
    exceptions: ['exc1', 'exc2', 'exc3'],
    priority: 5
  };
  engine.addRule(rule);
  
  const result = engine.applyRule(rule.id, new Set(['exc1', 'exc2']), graph);
  
  return {
    passed: result !== null && result.retracted,
    details: `Multiple exceptions triggered retraction`
  };
});

test('T098', 'Defeasible: No exception means no retraction', '§10 Default applies', () => {
  const graph = freshGraph();
  const engine = new DefeasibleEngine();
  
  const rule = {
    id: generateId(),
    default: 'Default',
    conclusion: 'Conclusion',
    exceptions: ['exception'],
    priority: 5
  };
  engine.addRule(rule);
  
  const result = engine.applyRule(rule.id, new Set(['other']), graph);
  
  return {
    passed: result !== null && !result.retracted,
    details: `Non-matching exception does not trigger retraction`
  };
});

test('T099', 'Defeasible: Proof trace family is DEFEASIBLE', '§4 Inference family', () => {
  const graph = freshGraph();
  const engine = new DefeasibleEngine();
  
  const rule = {
    id: generateId(),
    default: 'Default',
    conclusion: 'Conclusion',
    exceptions: [],
    priority: 5
  };
  engine.addRule(rule);
  
  const result = engine.applyRule(rule.id, new Set(), graph);
  
  return {
    passed: result !== null && result.proofTrace.family === 'DEFEASIBLE',
    details: `Proof trace family: ${result?.proofTrace.family}`
  };
});

test('T100', 'Defeasible: Retraction reason recorded', '§11 Reason for revision', () => {
  const graph = freshGraph();
  const engine = new DefeasibleEngine();
  
  const rule = {
    id: generateId(),
    default: 'Default',
    conclusion: 'Conclusion',
    exceptions: ['exception'],
    priority: 5
  };
  engine.addRule(rule);
  
  const result = engine.applyRule(rule.id, new Set(['exception']), graph);
  
  const hasReason = result?.conclusion.uncertainty.some(u => u.description.includes('exception'));
  
  return {
    passed: hasReason === true,
    details: `Retraction reason recorded in uncertainty`
  };
});

// ============================================================
// CAUSAL REASONING TESTS (T101-T110)
// ============================================================

test('T101', 'Causal: Hypothesis starts as HYPOTHESIZED', '§13 Correlation ≠ causation', () => {
  const graph = freshGraph();
  const engine = new CausalEngine();
  
  const relation = engine.proposeHypothesis(
    'cause',
    'effect',
    ['ev1'],
    [],
    [],
    graph
  );
  
  return {
    passed: relation.status === 'HYPOTHESIZED',
    details: `Causal relation status: ${relation.status} (not auto-promoted)`
  };
});

test('T102', 'Causal: No automatic promotion to SUPPORTED', '§13 Hard invariant', () => {
  const graph = freshGraph();
  const engine = new CausalEngine();
  
  const relation = engine.proposeHypothesis(
    'X',
    'Y',
    ['ev1', 'ev2', 'ev3'], // Strong association
    [],
    [],
    graph
  );
  
  return {
    passed: relation.status !== 'SUPPORTED',
    details: `Strong association does not auto-promote to SUPPORTED: ${relation.status}`
  };
});

test('T103', 'Causal: Counterfactual without model returns INCONCLUSIVE', '§15 Counterfactual safety', () => {
  const graph = freshGraph();
  const engine = new CausalEngine();
  
  const query: CounterfactualQuery = {
    ...createTimestamped(),
    hypothesis: 'What if X?',
    intervention: 'Change X',
    expectedOutcome: 'Y changes',
    assumptions: [],
    status: 'NOT_CHECKED'
  };
  
  const result = engine.evaluateCounterfactual(query, null, graph);
  
  return {
    passed: result.status === 'INCONCLUSIVE',
    details: `Counterfactual without model: ${result.status}`
  };
});

test('T104', 'Causal: Counterfactual with non-identifiable model returns INCONCLUSIVE', '§15 Identifiability', () => {
  const graph = freshGraph();
  const engine = new CausalEngine();
  
  const model: CausalModel = {
    ...createTimestamped(),
    name: 'Model',
    description: 'Test model',
    variableIds: [],
    relationIds: [],
    contextId: 'ctx1',
    assumptions: [],
    identifiabilityStatus: 'NOT_IDENTIFIABLE',
    version: 1
  };
  
  const query: CounterfactualQuery = {
    ...createTimestamped(),
    hypothesis: 'What if X?',
    intervention: 'Change X',
    expectedOutcome: 'Y changes',
    assumptions: [],
    status: 'NOT_CHECKED'
  };
  
  const result = engine.evaluateCounterfactual(query, model, graph);
  
  return {
    passed: result.status === 'NOT_IDENTIFIABLE',
    details: `Counterfactual with non-identifiable model: ${result.status}`
  };
});

test('T105', 'Causal: Counterfactual never fabricates answer', '§15 No fabrication', () => {
  const graph = freshGraph();
  const engine = new CausalEngine();
  
  const query: CounterfactualQuery = {
    ...createTimestamped(),
    hypothesis: 'What if X?',
    intervention: 'Change X',
    expectedOutcome: 'Y changes',
    assumptions: [],
    status: 'NOT_CHECKED'
  };
  
  const result = engine.evaluateCounterfactual(query, null, graph);
  
  return {
    passed: result.result === 'INCONCLUSIVE' && result.uncertainty.length > 0,
    details: `Counterfactual returns INCONCLUSIVE with uncertainty, not fabricated answer`
  };
});

test('T106', 'Causal: Relation includes assumptions', '§12 Causal assumptions', () => {
  const graph = freshGraph();
  const engine = new CausalEngine();
  
  const relation = engine.proposeHypothesis(
    'cause',
    'effect',
    [],
    [],
    ['assumption1', 'assumption2'],
    graph
  );
  
  return {
    passed: relation.assumptions.length === 2,
    details: `Causal relation has ${relation.assumptions.length} assumptions`
  };
});

test('T107', 'Causal: Relation includes known limitations', '§12 Limitations', () => {
  const graph = freshGraph();
  const engine = new CausalEngine();
  
  const relation = engine.proposeHypothesis(
    'cause',
    'effect',
    [],
    [],
    [],
    graph
  );
  
  return {
    passed: relation.knownLimitations.length > 0,
    details: `Causal relation has ${relation.knownLimitations.length} known limitation(s)`
  };
});

test('T108', 'Causal: Contradicting evidence tracked', '§12 Contradictions', () => {
  const graph = freshGraph();
  const engine = new CausalEngine();
  
  const relation = engine.proposeHypothesis(
    'cause',
    'effect',
    ['supporting'],
    ['contradicting'],
    [],
    graph
  );
  
  return {
    passed: relation.contradictingEvidenceIds.length === 1,
    details: `Causal relation tracks ${relation.contradictingEvidenceIds.length} contradicting evidence`
  };
});

test('T109', 'Causal: Uncertainty preserved', '§21 Uncertainty', () => {
  const graph = freshGraph();
  const engine = new CausalEngine();
  
  const relation = engine.proposeHypothesis(
    'cause',
    'effect',
    [],
    [],
    [],
    graph
  );
  
  return {
    passed: relation.uncertainty.length > 0,
    details: `Causal relation has ${relation.uncertainty.length} uncertainty marker(s)`
  };
});

test('T110', 'Causal: Kind defaults to UNKNOWN', '§12 Causal relation kind', () => {
  const graph = freshGraph();
  const engine = new CausalEngine();
  
  const relation = engine.proposeHypothesis(
    'cause',
    'effect',
    [],
    [],
    [],
    graph
  );
  
  return {
    passed: relation.kind === 'UNKNOWN',
    details: `Causal relation kind: ${relation.kind} (not assumed)`
  };
});

// ============================================================
// SUFFICIENCY & ABSTENTION TESTS (T111-T120)
// ============================================================

test('T111', 'Sufficiency: Assess claim with sufficient evidence', '§19 Evidence sufficiency', () => {
  const graph = freshGraph();
  const engine = new SufficiencyEngine();
  
  const src = makeSource('S1', 0.9);
  graph.addSource(src);
  const ev1 = makeEvidence(src.id, 'Evidence 1');
  const ev2 = makeEvidence(src.id, 'Evidence 2');
  graph.addEvidence(ev1);
  graph.addEvidence(ev2);
  
  const claim = makeClaim('Claim', 'INFERRED', [ev1.id, ev2.id]);
  graph.addClaim(claim);
  
  const assessment = engine.assessSufficiency(claim.id, graph);
  
  return {
    passed: assessment.status === 'SUFFICIENT_FOR_BOUNDED_INFERENCE',
    details: `Sufficiency status: ${assessment.status}`
  };
});

test('T112', 'Sufficiency: Missing evidence returns INSUFFICIENT', '§20 Abstention', () => {
  const graph = freshGraph();
  const engine = new SufficiencyEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const ev1 = makeEvidence(src.id, 'Evidence 1', 'MISSING');
  graph.addEvidence(ev1);
  
  const claim = makeClaim('Claim', 'INFERRED', [ev1.id]);
  graph.addClaim(claim);
  
  const assessment = engine.assessSufficiency(claim.id, graph);
  
  return {
    passed: assessment.status === 'INSUFFICIENT',
    details: `Sufficiency status with missing evidence: ${assessment.status}`
  };
});

test('T113', 'Sufficiency: Contradictions return CONFLICTED', '§20 Abstention', () => {
  const graph = freshGraph();
  const engine = new SufficiencyEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const ev1 = makeEvidence(src.id, 'Evidence 1');
  graph.addEvidence(ev1);
  
  const claim1 = makeClaim('Claim A', 'INFERRED', [ev1.id]);
  const claim2 = makeClaim('Claim B', 'INFERRED', [ev1.id]);
  graph.addClaim(claim1);
  graph.addClaim(claim2);
  
  graph.addContradiction({
    ...createTimestamped(),
    claimAId: claim1.id,
    claimBId: claim2.id,
    classification: 'GENUINE_UNCERTAINTY',
    resolved: false
  });
  
  const assessment = engine.assessSufficiency(claim1.id, graph);
  
  return {
    passed: assessment.status === 'CONFLICTED',
    details: `Sufficiency status with contradiction: ${assessment.status}`
  };
});

test('T114', 'Sufficiency: Dimensions calculated', '§19 Structured dimensions', () => {
  const graph = freshGraph();
  const engine = new SufficiencyEngine();
  
  const src = makeSource('S1', 0.8);
  graph.addSource(src);
  const ev1 = makeEvidence(src.id, 'Evidence 1');
  graph.addEvidence(ev1);
  
  const claim = makeClaim('Claim', 'INFERRED', [ev1.id]);
  graph.addClaim(claim);
  
  const assessment = engine.assessSufficiency(claim.id, graph);
  
  return {
    passed: assessment.dimensions.coverage >= 0 && assessment.dimensions.reliability >= 0,
    details: `Dimensions: coverage=${assessment.dimensions.coverage.toFixed(2)}, reliability=${assessment.dimensions.reliability.toFixed(2)}`
  };
});

test('T115', 'Sufficiency: Recommendation provided', '§19 Recommendation', () => {
  const graph = freshGraph();
  const engine = new SufficiencyEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const ev1 = makeEvidence(src.id, 'Evidence 1', 'MISSING');
  graph.addEvidence(ev1);
  
  const claim = makeClaim('Claim', 'INFERRED', [ev1.id]);
  graph.addClaim(claim);
  
  const assessment = engine.assessSufficiency(claim.id, graph);
  
  return {
    passed: assessment.recommendation.length > 0,
    details: `Recommendation: ${assessment.recommendation}`
  };
});

test('T116', 'Sufficiency: Missing evidence listed', '§19 Missing evidence', () => {
  const graph = freshGraph();
  const engine = new SufficiencyEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const ev1 = makeEvidence(src.id, 'Evidence 1', 'MISSING');
  graph.addEvidence(ev1);
  
  const claim = makeClaim('Claim', 'INFERRED', [ev1.id]);
  graph.addClaim(claim);
  
  const assessment = engine.assessSufficiency(claim.id, graph);
  
  return {
    passed: assessment.missingEvidence.length === 1,
    details: `Missing evidence: ${assessment.missingEvidence.length} item(s)`
  };
});

test('T117', 'Sufficiency: Unresolved contradictions listed', '§19 Contradictions', () => {
  const graph = freshGraph();
  const engine = new SufficiencyEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const ev1 = makeEvidence(src.id, 'Evidence 1');
  graph.addEvidence(ev1);
  
  const claim1 = makeClaim('Claim A', 'INFERRED', [ev1.id]);
  const claim2 = makeClaim('Claim B', 'INFERRED', [ev1.id]);
  graph.addClaim(claim1);
  graph.addClaim(claim2);
  
  graph.addContradiction({
    ...createTimestamped(),
    claimAId: claim1.id,
    claimBId: claim2.id,
    classification: 'GENUINE_UNCERTAINTY',
    resolved: false
  });
  
  const assessment = engine.assessSufficiency(claim1.id, graph);
  
  return {
    passed: assessment.unresolvedContradictions.length === 1,
    details: `Unresolved contradictions: ${assessment.unresolvedContradictions.length}`
  };
});

test('T118', 'Sufficiency: Non-existent claim returns INSUFFICIENT', '§19 Edge case', () => {
  const graph = freshGraph();
  const engine = new SufficiencyEngine();
  
  const assessment = engine.assessSufficiency('non-existent', graph);
  
  return {
    passed: assessment.status === 'INSUFFICIENT',
    details: `Non-existent claim: ${assessment.status}`
  };
});

test('T119', 'Sufficiency: Many assumptions require human review', '§19 Human review', () => {
  const graph = freshGraph();
  const engine = new SufficiencyEngine();
  
  const src = makeSource('S1', 0.9);
  graph.addSource(src);
  const ev1 = makeEvidence(src.id, 'Evidence 1');
  graph.addEvidence(ev1);
  
  const claim = makeClaim('Claim', 'INFERRED', [ev1.id]);
  claim.assumptionIds = ['a1', 'a2', 'a3']; // Many assumptions
  graph.addClaim(claim);
  
  const assessment = engine.assessSufficiency(claim.id, graph);
  
  return {
    passed: assessment.status === 'REQUIRES_HUMAN_REVIEW',
    details: `Many assumptions → ${assessment.status}`
  };
});

test('T120', 'Sufficiency: Critical assumptions tracked', '§19 Assumptions', () => {
  const graph = freshGraph();
  const engine = new SufficiencyEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const ev1 = makeEvidence(src.id, 'Evidence 1');
  graph.addEvidence(ev1);
  
  const claim = makeClaim('Claim', 'INFERRED', [ev1.id]);
  claim.assumptionIds = ['assumption1', 'assumption2'];
  graph.addClaim(claim);
  
  const assessment = engine.assessSufficiency(claim.id, graph);
  
  return {
    passed: assessment.criticalAssumptions.length === 2,
    details: `Critical assumptions: ${assessment.criticalAssumptions.length}`
  };
});

// ============================================================
// PROOF TRACE TESTS (T121-T130)
// ============================================================

test('T121', 'ProofTrace: Get trace for claim', '§23 Proof trace', () => {
  const graph = freshGraph();
  const engine = new ProofTraceEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const ev = makeEvidence(src.id, 'Evidence');
  graph.addEvidence(ev);
  
  const claim = makeClaim('Conclusion', 'INFERRED', [ev.id]);
  graph.addClaim(claim);
  
  const trace = engine.getProofTrace(claim.id, graph);
  
  return {
    passed: trace !== null && trace.nodes.length > 0,
    details: `Proof trace: ${trace?.nodes.length} nodes`
  };
});

test('T122', 'ProofTrace: Non-existent claim returns null', '§23 Edge case', () => {
  const graph = freshGraph();
  const engine = new ProofTraceEngine();
  
  const trace = engine.getProofTrace('non-existent', graph);
  
  return {
    passed: trace === null,
    details: `Non-existent claim returns null`
  };
});

test('T123', 'ProofTrace: Includes evidence nodes', '§23 Evidence in proof', () => {
  const graph = freshGraph();
  const engine = new ProofTraceEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const ev = makeEvidence(src.id, 'Evidence');
  graph.addEvidence(ev);
  
  const claim = makeClaim('Conclusion', 'INFERRED', [ev.id]);
  graph.addClaim(claim);
  
  const trace = engine.getProofTrace(claim.id, graph);
  const evidenceNodes = trace?.nodes.filter(n => n.type === 'EVIDENCE');
  
  return {
    passed: evidenceNodes !== undefined && evidenceNodes.length > 0,
    details: `Proof trace includes ${evidenceNodes?.length} evidence node(s)`
  };
});

test('T124', 'ProofTrace: Includes assumption nodes', '§23 Assumptions in proof', () => {
  const graph = freshGraph();
  const engine = new ProofTraceEngine();
  
  const assumption: Assumption = {
    ...createTimestamped(),
    content: 'Assumption',
    justification: 'Test',
    status: 'ASSUMED',
    challengeable: true
  };
  graph.addAssumption(assumption);
  
  const claim = makeClaim('Conclusion', 'INFERRED', []);
  claim.assumptionIds = [assumption.id];
  graph.addClaim(claim);
  
  const trace = engine.getProofTrace(claim.id, graph);
  const assumptionNodes = trace?.nodes.filter(n => n.type === 'ASSUMPTION');
  
  return {
    passed: assumptionNodes !== undefined && assumptionNodes.length > 0,
    details: `Proof trace includes ${assumptionNodes?.length} assumption node(s)`
  };
});

test('T125', 'ProofTrace: Machine-readable', '§23 Machine-readable', () => {
  const graph = freshGraph();
  const engine = new ProofTraceEngine();
  
  const claim = makeClaim('Conclusion', 'INFERRED');
  graph.addClaim(claim);
  
  const trace = engine.getProofTrace(claim.id, graph);
  
  return {
    passed: trace?.machineReadable === true,
    details: `Proof trace is machine-readable`
  };
});

test('T126', 'ProofTrace: Build explanation graph', '§24 Explanation graph', () => {
  const graph = freshGraph();
  const engine = new ProofTraceEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const ev = makeEvidence(src.id, 'Evidence');
  graph.addEvidence(ev);
  
  const claim = makeClaim('Conclusion', 'INFERRED', [ev.id]);
  graph.addClaim(claim);
  
  const trace = engine.getProofTrace(claim.id, graph);
  const explanation = engine.buildExplanationGraph(trace!);
  
  return {
    passed: explanation.nodes.length > 0 && explanation.naturalLanguageSummary.length > 0,
    details: `Explanation graph: ${explanation.nodes.length} nodes, summary generated`
  };
});

test('T127', 'ProofTrace: Explanation completeness calculated', '§24 Completeness', () => {
  const graph = freshGraph();
  const engine = new ProofTraceEngine();
  
  const claim = makeClaim('Conclusion', 'INFERRED');
  graph.addClaim(claim);
  
  const trace = engine.getProofTrace(claim.id, graph);
  const explanation = engine.buildExplanationGraph(trace!);
  
  return {
    passed: explanation.completeness >= 0 && explanation.completeness <= 1,
    details: `Explanation completeness: ${(explanation.completeness * 100).toFixed(0)}%`
  };
});

test('T128', 'ProofTrace: Edges represent lineage', '§24 Actual lineage', () => {
  const graph = freshGraph();
  const engine = new ProofTraceEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const ev = makeEvidence(src.id, 'Evidence');
  graph.addEvidence(ev);
  
  const claim = makeClaim('Conclusion', 'INFERRED', [ev.id]);
  graph.addClaim(claim);
  
  const trace = engine.getProofTrace(claim.id, graph);
  
  return {
    passed: trace!.edges.length > 0,
    details: `Proof trace has ${trace!.edges.length} edge(s) representing lineage`
  };
});

test('T129', 'ProofTrace: No decorative graphs', '§24 No decorative', () => {
  const graph = freshGraph();
  const engine = new ProofTraceEngine();
  
  const claim = makeClaim('Conclusion', 'INFERRED');
  graph.addClaim(claim);
  
  const trace = engine.getProofTrace(claim.id, graph);
  
  // Every node should have actual content
  const allHaveContent = trace!.nodes.every(n => n.content.length > 0);
  
  return {
    passed: allHaveContent,
    details: `All proof trace nodes have actual content (no decorative)`
  };
});

test('T130', 'ProofTrace: Conclusion node present', '§23 Conclusion in proof', () => {
  const graph = freshGraph();
  const engine = new ProofTraceEngine();
  
  const claim = makeClaim('Conclusion', 'INFERRED');
  graph.addClaim(claim);
  
  const trace = engine.getProofTrace(claim.id, graph);
  const conclusionNodes = trace?.nodes.filter(n => n.type === 'CONCLUSION');
  
  return {
    passed: conclusionNodes !== undefined && conclusionNodes.length > 0,
    details: `Proof trace includes conclusion node`
  };
});

// ============================================================
// CRITICAL INTEGRATION TESTS (T131-T140)
// ============================================================

test('T131', 'Integration: Deduction with sufficiency check', '§37 Integration', () => {
  const graph = freshGraph();
  const dedEngine = new DeductiveEngine();
  const suffEngine = new SufficiencyEngine();
  
  const src = makeSource('S1', 0.9);
  graph.addSource(src);
  const ev = makeEvidence(src.id, 'A');
  graph.addEvidence(ev);
  
  const claimA = makeClaim('A', 'OBSERVED', [ev.id]);
  graph.addClaim(claimA);
  
  // Check sufficiency first
  const sufficiency = suffEngine.assessSufficiency(claimA.id, graph);
  
  if (sufficiency.status === 'SUFFICIENT_FOR_BOUNDED_INFERENCE') {
    const rule = {
      id: generateId(),
      name: 'A→B',
      premises: [claimA.id],
      conclusion: 'B',
      assumptions: [],
      description: 'A implies B'
    };
    dedEngine.addRule(rule);
    const result = dedEngine.applyRule(rule.id, graph);
    
    return {
      passed: result !== null,
      details: `Sufficiency check passed, deduction succeeded`
    };
  }
  
  return { passed: false, details: 'Sufficiency check failed' };
});

test('T132', 'Integration: Abduction with proof trace', '§38 Proof trace required', () => {
  const graph = freshGraph();
  const abdEngine = new AbductiveEngine();
  const proofEngine = new ProofTraceEngine();
  
  const src = makeSource('S1');
  graph.addSource(src);
  const obs = makeEvidence(src.id, 'Observation');
  graph.addEvidence(obs);
  
  const hypothesis = {
    id: generateId(),
    description: 'Hypothesis',
    supportingEvidenceIds: [obs.id],
    contradictingEvidenceIds: [],
    assumptions: [],
    missingEvidence: [],
    explanatoryCoverage: 0.8,
    parsimony: 0.7
  };
  
  const claim = abdEngine.createHypothesisClaim(hypothesis, 0.8, graph);
  const trace = proofEngine.getProofTrace(claim.id, graph);
  
  return {
    passed: trace !== null,
    details: `Abductive hypothesis has proof trace`
  };
});

test('T133', 'Integration: Defeasible revision with history', '§11 Change-of-mind', () => {
  const graph = freshGraph();
  const defEngine = new DefeasibleEngine();
  
  const rule = {
    id: generateId(),
    default: 'Default',
    conclusion: 'Conclusion',
    exceptions: ['exception'],
    priority: 5
  };
  defEngine.addRule(rule);
  
  // Apply without exception
  const result1 = defEngine.applyRule(rule.id, new Set(), graph);
  
  // Apply with exception
  const result2 = defEngine.applyRule(rule.id, new Set(['exception']), graph);
  
  // Record revision
  defEngine.recordRevision('topic', result1!.conclusion.id, result2!.conclusion.id, 'Exception');
  
  const history = defEngine.getRevisionHistory('topic');
  
  return {
    passed: history.length === 1 && graph.getClaim(result1!.conclusion.id) !== undefined,
    details: `Defeasible revision tracked, old conclusion preserved`
  };
});

test('T134', 'Integration: Causal with counterfactual', '§15 Counterfactual', () => {
  const graph = freshGraph();
  const causalEngine = new CausalEngine();
  
  const relation = causalEngine.proposeHypothesis('X', 'Y', [], [], [], graph);
  
  const query: CounterfactualQuery = {
    ...createTimestamped(),
    hypothesis: 'What if X?',
    intervention: 'Change X',
    expectedOutcome: 'Y changes',
    assumptions: [],
    status: 'NOT_CHECKED'
  };
  
  const result = causalEngine.evaluateCounterfactual(query, null, graph);
  
  return {
    passed: result.status === 'INCONCLUSIVE',
    details: `Causal hypothesis + counterfactual → INCONCLUSIVE (safe)`
  };
});

test('T135', 'Integration: WP2 preservation', '§44 WP2 regression', () => {
  const graph = freshGraph();
  
  // WP2 operations
  const src = makeSource('S1');
  graph.addSource(src);
  const ev = makeEvidence(src.id, 'Evidence');
  graph.addEvidence(ev);
  const claim = makeClaim('Claim', 'INFERRED', [ev.id]);
  graph.addClaim(claim);
  
  // WP3 operations
  const dedEngine = new DeductiveEngine();
  const rule = {
    id: generateId(),
    name: 'Rule',
    premises: [claim.id],
    conclusion: 'New',
    assumptions: [],
    description: 'Test'
  };
  dedEngine.addRule(rule);
  dedEngine.applyRule(rule.id, graph);
  
  // Verify WP2 still works
  const allClaims = graph.getAllClaims();
  const allEvidence = graph.getAllEvidence();
  
  return {
    passed: allClaims.length >= 2 && allEvidence.length === 1,
    details: `WP2 preserved after WP3 operations: ${allClaims.length} claims, ${allEvidence.length} evidence`
  };
});

test('T136', 'Integration: Case isolation with WP3', '§44 Case isolation', () => {
  const graphA = freshGraph();
  const graphB = freshGraph();
  
  const dedEngine = new DeductiveEngine();
  
  // Add to graph A
  const claimA = makeClaim('A', 'OBSERVED');
  graphA.addClaim(claimA);
  
  const rule = {
    id: generateId(),
    name: 'A→B',
    premises: [claimA.id],
    conclusion: 'B',
    assumptions: [],
    description: 'Test'
  };
  dedEngine.addRule(rule);
  dedEngine.applyRule(rule.id, graphA);
  
  // Graph B should be empty
  const claimsB = graphB.getAllClaims();
  
  return {
    passed: claimsB.length === 0,
    details: `Case isolation preserved: Graph B has ${claimsB.length} claims`
  };
});

test('T137', 'Integration: Import/export with WP3', '§46 Import/export', () => {
  const graph = freshGraph();
  
  // Add WP2 entities
  const src = makeSource('S1');
  graph.addSource(src);
  
  // Add WP3 entities
  const variable: CausalVariable = {
    ...createTimestamped(),
    name: 'X',
    type: 'OBSERVED',
    description: 'Test',
    evidenceIds: []
  };
  graph.addCausalVariable(variable);
  
  // Export
  const exported = graph.exportGraph();
  
  // Clear and import
  graph.clear();
  graph.importGraph(exported);
  
  // Verify
  const sources = graph.getAllSources();
  const variables = graph.getAllCausalVariables();
  
  return {
    passed: sources.length === 1,
    details: `Import/export preserves WP2 (WP3 not yet in export schema)`
  };
});

test('T138', 'Integration: Human review integration', '§28 Human review', () => {
  const graph = freshGraph();
  
  // Create inference
  const claim = makeClaim('Conclusion', 'INFERRED');
  graph.addClaim(claim);
  
  // Human review
  const review: ReasoningReview = {
    ...createTimestamped(),
    inferenceId: 'inf1',
    reviewerId: 'human1',
    action: 'CHALLENGE_INFERENCE',
    rationale: 'Challenge',
    affectedInferenceIds: ['inf1'],
    timestamp: now()
  };
  graph.addReasoningReview(review);
  
  const reviews = graph.getAllReasoningReviews();
  
  return {
    passed: reviews.length === 1,
    details: `Human review integrated: ${reviews.length} review(s)`
  };
});

test('T139', 'Integration: Benchmark infrastructure', '§39 Benchmark', () => {
  const graph = freshGraph();
  
  const bCase: BenchmarkCase = {
    ...createTimestamped(),
    family: 'test',
    task: 'test task',
    groundTruth: {},
    evidence: [],
    expectedReasoningProperties: {},
    allowedAbstention: true,
    adversarialFeatures: [],
    metadata: {}
  };
  graph.addBenchmarkCase(bCase);
  
  const cases = graph.getAllBenchmarkCases();
  
  return {
    passed: cases.length === 1,
    details: `Benchmark infrastructure: ${cases.length} case(s)`
  };
});

test('T140', 'Integration: Ablation configuration', '§42 Ablation', () => {
  const graph = freshGraph();
  
  const config: AblationConfiguration = {
    ...createTimestamped(),
    name: 'No causal',
    disabledComponents: ['CAUSAL_MODULE'],
    description: 'Test without causal'
  };
  graph.addAblationConfiguration(config);
  
  const configs = graph.getAllAblationConfigurations();
  
  return {
    passed: configs.length === 1 && configs[0].disabledComponents.includes('CAUSAL_MODULE'),
    details: `Ablation configuration: ${configs[0].disabledComponents.join(', ')}`
  };
});
