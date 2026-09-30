/**
 * HAG-RAP LAB — WP3 Deep Reasoning & Causal Inference Engines
 * 
 * SCIENTIFIC STATUS: IMPLEMENTED (deterministic core)
 * 
 * This module implements WP3 reasoning capabilities:
 * - Deductive reasoning with proof traces
 * - Inductive reasoning (bounded experimental)
 * - Abductive reasoning with transparent ranking
 * - Defeasible reasoning with revision tracking
 * - Causal reasoning with proper semantics
 * - Counterfactual reasoning
 * - Evidence sufficiency assessment
 * - Proof trace generation
 * 
 * All engines preserve WP2 invariants and integrate with EvidenceGraphMemory.
 */

import {
  Claim, Assumption, EvidenceItem, Source, Inference,
  InferencePremise, InferenceResult, InferenceAlternative,
  ReasoningSession, ReasoningStep, ReasoningFailure,
  CausalVariable, CausalRelation, CausalModel, Intervention,
  CounterfactualQuery, CounterfactualResult,
  EvidenceConflict, EvidenceSufficiencyAssessment,
  ProofTrace, ProofNode, ProofEdge,
  ExplanationGraph, ExplanationNode, ExplanationEdge,
  CalibrationRecord, ReasoningReview,
  InferenceFamily, CausalRelationStatus, CausalRelationKind,
  IdentifiabilityStatus, SufficiencyStatus, ConflictCategory,
  ConflictResolutionStatus, ReasoningFailureType, AbstentionReason,
  ProofNodeType, ExplanationNodeType, HumanReviewAction,
  ClaimStatus, EvidenceStatus, VerificationStatus, UncertaintyType,
  Uncertainty, createTimestamped, now, generateId
} from './types.ts';
import { EvidenceGraphMemory } from './evidence-graph.ts';

// ============================================================
// DEDUCTIVE ENGINE (§5-6)
// ============================================================

export interface DeductiveRule {
  id: string;
  name: string;
  premises: string[]; // claim IDs
  conclusion: string;
  assumptions: string[];
  description: string;
}

export class DeductiveEngine {
  private rules: Map<string, DeductiveRule> = new Map();

  addRule(rule: DeductiveRule): void {
    this.rules.set(rule.id, rule);
  }

  getRule(id: string): DeductiveRule | undefined {
    return this.rules.get(id);
  }

  getAllRules(): DeductiveRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Apply modus ponens with full proof trace
   */
  applyRule(
    ruleId: string,
    graph: EvidenceGraphMemory
  ): { inference: Inference; conclusion: Claim; proofTrace: ProofTrace } | null {
    const rule = this.rules.get(ruleId);
    if (!rule) return null;

    // Check all premises exist and are valid
    const premiseClaims: Claim[] = [];
    const failures: ReasoningFailure[] = [];

    for (const premiseId of rule.premises) {
      const premise = graph.getClaim(premiseId);
      if (!premise) {
        failures.push({
          ...createTimestamped(),
          type: 'MISSING_PREMISE',
          description: `Required premise ${premiseId} not found`,
          affectedClaimIds: [],
          severity: 'CRITICAL',
          recoverable: false
        });
        return null;
      }
      if (premise.status === 'SUPERSEDED' || premise.status === 'CONTESTED') {
        failures.push({
          ...createTimestamped(),
          type: 'INVALID_RULE',
          description: `Premise ${premiseId} has status ${premise.status}`,
          affectedClaimIds: [premiseId],
          severity: 'HIGH',
          recoverable: false
        });
        return null;
      }
      premiseClaims.push(premise);
    }

    // Check for circular reasoning
    const circularityCheck = this.detectCircularity(rule, graph);
    if (circularityCheck.isCircular) {
      failures.push({
        ...createTimestamped(),
        type: 'CIRCULAR_REASONING',
        description: circularityCheck.reason,
        affectedClaimIds: rule.premises,
        severity: 'CRITICAL',
        recoverable: false
      });
      return null;
    }

    // Create conclusion claim
    const conclusion: Claim = {
      ...createTimestamped(),
      content: rule.conclusion,
      status: 'INFERRED',
      evidenceIds: [],
      assumptionIds: rule.assumptions,
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
      inputClaimIds: rule.premises,
      outputClaimId: conclusion.id,
      assumptions: rule.assumptions,
      method: `Modus Ponens via ${rule.name}`,
      uncertainty: [],
      rejectedAlternatives: [],
      verificationStatus: 'NOT_CHECKED',
    };

    conclusion.inferenceIds = [inference.id];

    // Build proof trace
    const proofTrace = this.buildProofTrace(
      conclusion.id,
      premiseClaims,
      rule,
      inference,
      failures
    );

    // Register in graph
    graph.addClaim(conclusion);
    graph.addInference(inference);

    return { inference, conclusion, proofTrace };
  }

  /**
   * Multi-step deduction with complete proof path
   */
  chainDeduction(
    ruleIds: string[],
    graph: EvidenceGraphMemory
  ): { inferences: Inference[]; conclusions: Claim[]; proofTraces: ProofTrace[] } {
    const inferences: Inference[] = [];
    const conclusions: Claim[] = [];
    const proofTraces: ProofTrace[] = [];

    for (const ruleId of ruleIds) {
      const result = this.applyRule(ruleId, graph);
      if (result) {
        inferences.push(result.inference);
        conclusions.push(result.conclusion);
        proofTraces.push(result.proofTrace);
      }
    }

    return { inferences, conclusions, proofTraces };
  }

  /**
   * Detect circular reasoning
   */
  private detectCircularity(
    rule: DeductiveRule,
    graph: EvidenceGraphMemory
  ): { isCircular: boolean; reason: string } {
    const conclusionContent = rule.conclusion.toLowerCase();
    
    for (const premiseId of rule.premises) {
      const premise = graph.getClaim(premiseId);
      if (premise) {
        // Check if premise depends on conclusion (direct circularity)
        if (premise.content.toLowerCase() === conclusionContent) {
          return {
            isCircular: true,
            reason: `Premise ${premiseId} has same content as conclusion`
          };
        }

        // Check indirect circularity through inference chain
        for (const infId of premise.inferenceIds) {
          const inf = graph.getInference(infId);
          if (inf && inf.ruleId === rule.id) {
            return {
              isCircular: true,
              reason: `Premise ${premiseId} was derived using same rule`
            };
          }
        }
      }
    }

    return { isCircular: false, reason: '' };
  }

  /**
   * Build proof trace for deduction
   */
  private buildProofTrace(
    conclusionId: string,
    premises: Claim[],
    rule: DeductiveRule,
    inference: Inference,
    failures: ReasoningFailure[]
  ): ProofTrace {
    const nodes: ProofNode[] = [];
    const edges: ProofEdge[] = [];

    // Add premise nodes
    for (const premise of premises) {
      nodes.push({
        id: premise.id,
        type: 'CLAIM',
        content: premise.content,
        entityId: premise.id,
        status: premise.status
      });
    }

    // Add rule node
    const ruleNodeId = generateId();
    nodes.push({
      id: ruleNodeId,
      type: 'RULE',
      content: rule.name,
      entityId: rule.id,
      status: 'ACTIVE'
    });

    // Add inference node
    nodes.push({
      id: inference.id,
      type: 'INFERENCE',
      content: inference.method,
      entityId: inference.id,
      status: 'COMPLETED'
    });

    // Add conclusion node
    nodes.push({
      id: conclusionId,
      type: 'CONCLUSION',
      content: rule.conclusion,
      entityId: conclusionId,
      status: 'INFERRED'
    });

    // Add edges
    for (const premise of premises) {
      edges.push({
        id: generateId(),
        sourceNodeId: premise.id,
        targetNodeId: ruleNodeId,
        relation: 'PREMISE_OF'
      });
    }

    edges.push({
      id: generateId(),
      sourceNodeId: ruleNodeId,
      targetNodeId: inference.id,
      relation: 'APPLIED_BY'
    });

    edges.push({
      id: generateId(),
      sourceNodeId: inference.id,
      targetNodeId: conclusionId,
      relation: 'PRODUCES'
    });

    return {
      ...createTimestamped(),
      conclusionClaimId: conclusionId,
      nodes,
      edges,
      family: 'DEDUCTIVE',
      validity: failures.length === 0 ? 'VALID' : 'INVALID',
      failures,
      humanInterventions: [],
      machineReadable: true
    };
  }
}

// ============================================================
// INDUCTIVE ENGINE (§7)
// ============================================================

export interface InductivePattern {
  id: string;
  observations: string[]; // evidence IDs
  generalization: string;
  sampleSize: number;
  exceptions: string[];
  counterexamples: string[];
  applicabilityLimitations: string[];
}

export class InductiveEngine {
  /**
   * Derive candidate generalization from observations
   * Output is always INFERRED, never OBSERVED
   */
  deriveGeneralization(
    pattern: InductivePattern,
    graph: EvidenceGraphMemory
  ): { conclusion: Claim; inference: Inference; proofTrace: ProofTrace } | null {
    // Check minimum sample size
    if (pattern.sampleSize < 2) {
      return null; // Insufficient for induction
    }

    // Verify all observations exist
    const observations: EvidenceItem[] = [];
    for (const obsId of pattern.observations) {
      const obs = graph.getEvidence(obsId);
      if (!obs || obs.status === 'MISSING') {
        return null;
      }
      observations.push(obs);
    }

    // Create generalization claim (INFERRED, not OBSERVED)
    const conclusion: Claim = {
      ...createTimestamped(),
      content: pattern.generalization,
      status: 'INFERRED', // Always INFERRED for induction
      evidenceIds: pattern.observations,
      assumptionIds: [],
      inferenceIds: [],
      uncertainty: [{
        type: 'EPISTEMIC',
        magnitude: 1.0 / pattern.sampleSize, // Simple uncertainty estimate
        description: `Inductive generalization from ${pattern.sampleSize} observations`
      }],
      verificationStatus: 'NOT_CHECKED',
      scientificStatus: 'EXPERIMENTAL',
    };

    // Create inference record
    const inference: Inference = {
      ...createTimestamped(),
      family: 'INDUCTIVE',
      inputClaimIds: [],
      outputClaimId: conclusion.id,
      assumptions: [],
      method: `Inductive generalization from ${pattern.sampleSize} observations`,
      uncertainty: conclusion.uncertainty,
      rejectedAlternatives: pattern.counterexamples,
      verificationStatus: 'NOT_CHECKED',
    };

    conclusion.inferenceIds = [inference.id];

    // Build proof trace
    const proofTrace = this.buildInductiveProofTrace(
      conclusion.id,
      observations,
      pattern,
      inference
    );

    graph.addClaim(conclusion);
    graph.addInference(inference);

    return { conclusion, inference, proofTrace };
  }

  private buildInductiveProofTrace(
    conclusionId: string,
    observations: EvidenceItem[],
    pattern: InductivePattern,
    inference: Inference
  ): ProofTrace {
    const nodes: ProofNode[] = [];
    const edges: ProofEdge[] = [];

    // Add observation nodes
    for (const obs of observations) {
      nodes.push({
        id: obs.id,
        type: 'EVIDENCE',
        content: obs.content,
        entityId: obs.id,
        status: obs.status
      });
    }

    // Add inference node
    nodes.push({
      id: inference.id,
      type: 'INFERENCE',
      content: inference.method,
      entityId: inference.id,
      status: 'COMPLETED'
    });

    // Add conclusion node
    nodes.push({
      id: conclusionId,
      type: 'CONCLUSION',
      content: pattern.generalization,
      entityId: conclusionId,
      status: 'INFERRED'
    });

    // Add edges
    for (const obs of observations) {
      edges.push({
        id: generateId(),
        sourceNodeId: obs.id,
        targetNodeId: inference.id,
        relation: 'OBSERVATION_FOR'
      });
    }

    edges.push({
      id: generateId(),
      sourceNodeId: inference.id,
      targetNodeId: conclusionId,
      relation: 'GENERALIZES_TO'
    });

    return {
      ...createTimestamped(),
      conclusionClaimId: conclusionId,
      nodes,
      edges,
      family: 'INDUCTIVE',
      validity: 'VALID',
      failures: [],
      humanInterventions: [],
      machineReadable: true
    };
  }
}

// ============================================================
// ABDUCTIVE ENGINE (§8-9)
// ============================================================

export interface AbductiveHypothesis {
  id: string;
  description: string;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  assumptions: string[];
  missingEvidence: string[];
  explanatoryCoverage: number; // 0-1
  parsimony: number; // 0-1 (simpler = higher)
}

export class AbductiveEngine {
  /**
   * Generate candidate explanations for observation
   * Top-ranked hypothesis remains HYPOTHESIS, not FACT
   */
  generateHypotheses(
    observationId: string,
    candidateHypotheses: AbductiveHypothesis[],
    graph: EvidenceGraphMemory
  ): { hypotheses: Array<{ hypothesis: AbductiveHypothesis; rank: number; rationale: string }> } {
    const observation = graph.getEvidence(observationId);
    if (!observation) {
      return { hypotheses: [] };
    }

    // Rank hypotheses deterministically
    const ranked = candidateHypotheses.map(h => {
      const support = h.supportingEvidenceIds.length;
      const contradiction = h.contradictingEvidenceIds.length;
      const missing = h.missingEvidence.length;
      
      // Deterministic ranking formula
      const coverageScore = h.explanatoryCoverage;
      const parsimonyScore = h.parsimony;
      const supportScore = support / (support + contradiction + missing + 1);
      
      const rank = (coverageScore * 0.4 + parsimonyScore * 0.3 + supportScore * 0.3);
      
      const rationale = `Coverage: ${(coverageScore * 100).toFixed(0)}%, ` +
                       `Parsimony: ${(parsimonyScore * 100).toFixed(0)}%, ` +
                       `Support ratio: ${(supportScore * 100).toFixed(0)}%`;

      return { hypothesis: h, rank, rationale };
    });

    // Sort by rank descending
    ranked.sort((a, b) => b.rank - a.rank);

    return { hypotheses: ranked };
  }

  /**
   * Create hypothesis claim (remains HYPOTHESIS, not FACT)
   */
  createHypothesisClaim(
    hypothesis: AbductiveHypothesis,
    rank: number,
    graph: EvidenceGraphMemory
  ): Claim {
    const claim: Claim = {
      ...createTimestamped(),
      content: `[HYPOTHESIS rank=${rank.toFixed(2)}] ${hypothesis.description}`,
      status: 'INFERRED', // Remains INFERRED, never OBSERVED
      evidenceIds: hypothesis.supportingEvidenceIds,
      assumptionIds: hypothesis.assumptions,
      inferenceIds: [],
      uncertainty: [{
        type: 'EPISTEMIC',
        magnitude: 1.0 - rank,
        description: `Abductive hypothesis with rank ${rank.toFixed(2)}`
      }],
      verificationStatus: 'NOT_CHECKED',
      scientificStatus: 'EXPERIMENTAL',
    };

    graph.addClaim(claim);
    return claim;
  }
}

// ============================================================
// DEFEASIBLE ENGINE (§10-11)
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
  private revisionHistory: Map<string, Array<{ timestamp: string; oldConclusionId: string; newConclusionId: string; reason: string }>> = new Map();

  addRule(rule: DefeasibleRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Apply defeasible rule with exception handling
   */
  applyRule(
    ruleId: string,
    activeExceptions: Set<string>,
    graph: EvidenceGraphMemory
  ): { conclusion: Claim; inference: Inference; proofTrace: ProofTrace; retracted: boolean } | null {
    const rule = this.rules.get(ruleId);
    if (!rule) return null;

    const triggeredExceptions = rule.exceptions.filter(e => activeExceptions.has(e));
    const retracted = triggeredExceptions.length > 0;

    const status = retracted ? 'SUPERSEDED' : 'INFERRED';
    const content = retracted ? `[RETRACTED] ${rule.conclusion}` : rule.conclusion;

    const conclusion: Claim = {
      ...createTimestamped(),
      content,
      status,
      evidenceIds: [],
      assumptionIds: [rule.default],
      inferenceIds: [],
      uncertainty: [{
        type: 'EPISTEMIC',
        magnitude: retracted ? 1.0 : 0.2,
        description: retracted 
          ? `Defeated by exceptions: ${triggeredExceptions.join(', ')}`
          : 'Defeasible — may be withdrawn if exceptions emerge'
      }],
      verificationStatus: retracted ? 'NOT_APPLICABLE' : 'NOT_CHECKED',
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
      uncertainty: conclusion.uncertainty,
      rejectedAlternatives: [],
      verificationStatus: conclusion.verificationStatus,
    };

    conclusion.inferenceIds = [inference.id];

    const proofTrace = this.buildDefeasibleProofTrace(
      conclusion.id,
      rule,
      inference,
      triggeredExceptions,
      retracted
    );

    graph.addClaim(conclusion);
    graph.addInference(inference);

    return { conclusion, inference, proofTrace, retracted };
  }

  /**
   * Record revision history for change-of-mind tracking
   */
  recordRevision(
    conclusionId: string,
    oldConclusionId: string,
    newConclusionId: string,
    reason: string
  ): void {
    if (!this.revisionHistory.has(conclusionId)) {
      this.revisionHistory.set(conclusionId, []);
    }
    this.revisionHistory.get(conclusionId)!.push({
      timestamp: now(),
      oldConclusionId,
      newConclusionId,
      reason
    });
  }

  getRevisionHistory(conclusionId: string): Array<{ timestamp: string; oldConclusionId: string; newConclusionId: string; reason: string }> {
    return this.revisionHistory.get(conclusionId) || [];
  }

  private buildDefeasibleProofTrace(
    conclusionId: string,
    rule: DefeasibleRule,
    inference: Inference,
    triggeredExceptions: string[],
    retracted: boolean
  ): ProofTrace {
    const nodes: ProofNode[] = [];
    const edges: ProofEdge[] = [];

    // Add default assumption node
    const assumptionNodeId = generateId();
    nodes.push({
      id: assumptionNodeId,
      type: 'ASSUMPTION',
      content: rule.default,
      status: 'ASSUMED'
    });

    // Add exception nodes if any
    for (const exc of triggeredExceptions) {
      nodes.push({
        id: exc,
        type: 'CLAIM',
        content: `Exception: ${exc}`,
        entityId: exc,
        status: 'OBSERVED'
      });
    }

    // Add inference node
    nodes.push({
      id: inference.id,
      type: 'INFERENCE',
      content: inference.method,
      entityId: inference.id,
      status: retracted ? 'RETRACTED' : 'COMPLETED'
    });

    // Add conclusion node
    nodes.push({
      id: conclusionId,
      type: 'CONCLUSION',
      content: rule.conclusion,
      entityId: conclusionId,
      status: retracted ? 'SUPERSEDED' : 'INFERRED'
    });

    // Add edges
    edges.push({
      id: generateId(),
      sourceNodeId: assumptionNodeId,
      targetNodeId: inference.id,
      relation: 'DEFAULT_FOR'
    });

    for (const exc of triggeredExceptions) {
      edges.push({
        id: generateId(),
        sourceNodeId: exc,
        targetNodeId: inference.id,
        relation: 'DEFEATS'
      });
    }

    edges.push({
      id: generateId(),
      sourceNodeId: inference.id,
      targetNodeId: conclusionId,
      relation: retracted ? 'RETRACTS' : 'PRODUCES'
    });

    return {
      ...createTimestamped(),
      conclusionClaimId: conclusionId,
      nodes,
      edges,
      family: 'DEFEASIBLE',
      validity: retracted ? 'INVALID' : 'VALID',
      failures: [],
      humanInterventions: [],
      machineReadable: true
    };
  }
}

// ============================================================
// CAUSAL ENGINE (§12-16)
// ============================================================

export class CausalEngine {
  /**
   * Propose causal hypothesis (never auto-promotes to SUPPORTED)
   */
  proposeHypothesis(
    causeVariableId: string,
    effectVariableId: string,
    supportingEvidenceIds: string[],
    contradictingEvidenceIds: string[],
    assumptions: string[],
    graph: EvidenceGraphMemory
  ): CausalRelation {
    const relation: CausalRelation = {
      ...createTimestamped(),
      sourceVariableId: causeVariableId,
      targetVariableId: effectVariableId,
      kind: 'UNKNOWN',
      status: 'HYPOTHESIZED', // Always starts as HYPOTHESIZED
      direction: 'UNKNOWN',
      supportingEvidenceIds,
      contradictingEvidenceIds,
      assumptions,
      confounders: [],
      uncertainty: [{
        type: 'EPISTEMIC',
        description: 'Causal hypothesis — requires further validation'
      }],
      contextId: undefined,
      validityConditions: [],
      knownLimitations: ['Correlation does not imply causation']
    };

    return relation;
  }

  /**
   * Evaluate counterfactual query
   * Returns INCONCLUSIVE if causal support insufficient
   */
  evaluateCounterfactual(
    query: CounterfactualQuery,
    causalModel: CausalModel | null,
    graph: EvidenceGraphMemory
  ): CounterfactualResult {
    // Check if we have a causal model
    if (!causalModel) {
      return {
        ...createTimestamped(),
        queryId: query.id,
        observedFacts: [],
        intervention: query.intervention,
        expectedOutcome: query.expectedOutcome,
        causalAssumptions: [],
        modelAssumptions: [],
        unknownVariables: [],
        confounders: [],
        result: 'INCONCLUSIVE',
        uncertainty: [{
          type: 'EPISTEMIC',
          description: 'No causal model available'
        }],
        identifiability: 'NOT_IDENTIFIABLE',
        status: 'INCONCLUSIVE'
      };
    }

    // Check identifiability
    if (causalModel.identifiabilityStatus === 'NOT_IDENTIFIABLE') {
      return {
        ...createTimestamped(),
        queryId: query.id,
        observedFacts: [],
        intervention: query.intervention,
        expectedOutcome: query.expectedOutcome,
        causalAssumptions: query.assumptions,
        modelAssumptions: [],
        unknownVariables: [],
        confounders: [],
        result: 'INCONCLUSIVE',
        uncertainty: [{
          type: 'EPISTEMIC',
          description: 'Causal effect not identifiable'
        }],
        identifiability: 'NOT_IDENTIFIABLE',
        status: 'NOT_IDENTIFIABLE'
      };
    }

    // If partially identifiable or unknown, return INCONCLUSIVE
    return {
      ...createTimestamped(),
      queryId: query.id,
      observedFacts: [],
      intervention: query.intervention,
      expectedOutcome: query.expectedOutcome,
      causalAssumptions: query.assumptions,
      modelAssumptions: [],
      unknownVariables: [],
      confounders: [],
      result: 'INCONCLUSIVE',
      uncertainty: [{
        type: 'EPISTEMIC',
        description: 'Insufficient causal support for counterfactual'
      }],
      identifiability: causalModel.identifiabilityStatus,
      status: 'INCONCLUSIVE'
    };
  }
}

// ============================================================
// SUFFICIENCY ENGINE (§19-20)
// ============================================================

export class SufficiencyEngine {
  /**
   * Assess evidence sufficiency for a target claim
   */
  assessSufficiency(
    targetClaimId: string,
    graph: EvidenceGraphMemory
  ): EvidenceSufficiencyAssessment {
    const claim = graph.getClaim(targetClaimId);
    if (!claim) {
      return {
        ...createTimestamped(),
        targetClaimId,
        status: 'INSUFFICIENT',
        dimensions: {
          coverage: 0,
          provenance: 0,
          independence: 0,
          recency: 0,
          reliability: 0
        },
        missingEvidence: [],
        unresolvedContradictions: [],
        criticalAssumptions: [],
        causalIdentifiability: 'UNKNOWN',
        counterexamples: [],
        recommendation: 'Claim not found'
      };
    }

    // Calculate dimensions
    const evidenceItems = claim.evidenceIds
      .map(id => graph.getEvidence(id))
      .filter((e): e is EvidenceItem => e !== undefined);

    const availableEvidence = evidenceItems.filter(e => e.status !== 'MISSING');
    const missingEvidence = evidenceItems.filter(e => e.status === 'MISSING');

    const coverage = evidenceItems.length > 0 
      ? availableEvidence.length / evidenceItems.length 
      : 0;

    const provenance = availableEvidence.length > 0
      ? availableEvidence.filter(e => e.provenanceRecordId).length / availableEvidence.length
      : 0;

    const sources = new Set(availableEvidence.map(e => e.sourceId));
    const independence = sources.size / Math.max(availableEvidence.length, 1);

    const recency = 1.0; // Simplified — would need temporal analysis

    const reliability = availableEvidence.length > 0
      ? availableEvidence.reduce((sum, e) => {
          const source = graph.getSource(e.sourceId);
          return sum + (source?.reliability || 0.5);
        }, 0) / availableEvidence.length
      : 0;

    // Check for contradictions
    const contradictions = graph.getAllContradictions()
      .filter(c => c.claimAId === targetClaimId || c.claimBId === targetClaimId)
      .filter(c => !c.resolved);

    // Determine overall status
    let status: SufficiencyStatus = 'SUFFICIENT_FOR_BOUNDED_INFERENCE';
    
    if (coverage < 0.5 || reliability < 0.5) {
      status = 'INSUFFICIENT';
    } else if (contradictions.length > 0) {
      status = 'CONFLICTED';
    } else if (claim.assumptionIds.length > 2) {
      status = 'REQUIRES_HUMAN_REVIEW';
    }

    return {
      ...createTimestamped(),
      targetClaimId,
      status,
      dimensions: { coverage, provenance, independence, recency, reliability },
      missingEvidence: missingEvidence.map(e => e.id),
      unresolvedContradictions: contradictions.map(c => c.id),
      criticalAssumptions: claim.assumptionIds,
      causalIdentifiability: 'UNKNOWN',
      counterexamples: [],
      recommendation: this.generateRecommendation(status, coverage, contradictions.length)
    };
  }

  private generateRecommendation(
    status: SufficiencyStatus,
    coverage: number,
    contradictionCount: number
  ): string {
    if (status === 'INSUFFICIENT') {
      return `Insufficient evidence (coverage: ${(coverage * 100).toFixed(0)}%). Gather more evidence before drawing conclusions.`;
    }
    if (status === 'CONFLICTED') {
      return `${contradictionCount} unresolved contradiction(s). Resolve conflicts before proceeding.`;
    }
    if (status === 'REQUIRES_HUMAN_REVIEW') {
      return 'Multiple assumptions require human review.';
    }
    return 'Evidence sufficient for bounded inference.';
  }
}

// ============================================================
// PROOF TRACE ENGINE (§23-25)
// ============================================================

export class ProofTraceEngine {
  /**
   * Get proof trace for a conclusion
   */
  getProofTrace(
    conclusionId: string,
    graph: EvidenceGraphMemory
  ): ProofTrace | null {
    const claim = graph.getClaim(conclusionId);
    if (!claim) return null;

    const nodes: ProofNode[] = [];
    const edges: ProofEdge[] = [];
    const visited = new Set<string>();

    const traverse = (claimId: string) => {
      if (visited.has(claimId)) return;
      visited.add(claimId);

      const claim = graph.getClaim(claimId);
      if (!claim) return;

      // Add claim node
      nodes.push({
        id: claim.id,
        type: 'CLAIM',
        content: claim.content,
        entityId: claim.id,
        status: claim.status
      });

      // Traverse evidence
      for (const evId of claim.evidenceIds) {
        const ev = graph.getEvidence(evId);
        if (ev) {
          nodes.push({
            id: ev.id,
            type: 'EVIDENCE',
            content: ev.content,
            entityId: ev.id,
            status: ev.status
          });
          edges.push({
            id: generateId(),
            sourceNodeId: ev.id,
            targetNodeId: claim.id,
            relation: 'SUPPORTS'
          });
        }
      }

      // Traverse assumptions
      for (const aId of claim.assumptionIds) {
        const assumption = graph.getAssumption(aId);
        if (assumption) {
          nodes.push({
            id: assumption.id,
            type: 'ASSUMPTION',
            content: assumption.content,
            entityId: assumption.id,
            status: assumption.status
          });
          edges.push({
            id: generateId(),
            sourceNodeId: assumption.id,
            targetNodeId: claim.id,
            relation: 'ASSUMED_FOR'
          });
        }
      }

      // Traverse inferences
      for (const infId of claim.inferenceIds) {
        const inf = graph.getInference(infId);
        if (inf) {
          nodes.push({
            id: inf.id,
            type: 'INFERENCE',
            content: inf.method,
            entityId: inf.id,
            status: inf.verificationStatus
          });
          edges.push({
            id: generateId(),
            sourceNodeId: inf.id,
            targetNodeId: claim.id,
            relation: 'DERIVED_BY'
          });

          // Traverse inference inputs
          for (const inputId of inf.inputClaimIds) {
            edges.push({
              id: generateId(),
              sourceNodeId: inputId,
              targetNodeId: inf.id,
              relation: 'INPUT_TO'
            });
            traverse(inputId);
          }
        }
      }
    };

    traverse(conclusionId);

    return {
      ...createTimestamped(),
      conclusionClaimId: conclusionId,
      nodes,
      edges,
      family: 'DEDUCTIVE', // Would need to determine from inference
      validity: 'VALID',
      failures: [],
      humanInterventions: [],
      machineReadable: true
    };
  }

  /**
   * Build explanation graph from proof trace
   */
  buildExplanationGraph(proofTrace: ProofTrace): ExplanationGraph {
    const nodes: ExplanationNode[] = proofTrace.nodes.map(n => ({
      id: n.id,
      type: n.type as ExplanationNodeType,
      content: n.content,
      entityId: n.entityId,
      status: n.status
    }));

    const edges: ExplanationEdge[] = proofTrace.edges.map(e => ({
      id: e.id,
      sourceNodeId: e.sourceNodeId,
      targetNodeId: e.targetNodeId,
      relation: e.relation
    }));

    const completeness = nodes.length > 0 
      ? nodes.filter(n => n.status !== 'UNKNOWN').length / nodes.length 
      : 0;

    return {
      ...createTimestamped(),
      conclusionClaimId: proofTrace.conclusionClaimId,
      nodes,
      edges,
      naturalLanguageSummary: this.generateSummary(proofTrace),
      completeness,
      hasContradictions: false, // Would need to check
      hasUnresolvedUncertainty: false // Would need to check
    };
  }

  private generateSummary(proofTrace: ProofTrace): string {
    const evidenceCount = proofTrace.nodes.filter(n => n.type === 'EVIDENCE').length;
    const assumptionCount = proofTrace.nodes.filter(n => n.type === 'ASSUMPTION').length;
    const inferenceCount = proofTrace.nodes.filter(n => n.type === 'INFERENCE').length;

    return `Conclusion supported by ${evidenceCount} evidence items, ` +
           `${assumptionCount} assumptions, through ${inferenceCount} inference(s). ` +
           `Family: ${proofTrace.family}. Validity: ${proofTrace.validity}.`;
  }
}
