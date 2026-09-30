/**
 * HAG-RAP LAB — WP4 Deep Abstraction & Transferable World Models Engines
 * 
 * SCIENTIFIC STATUS: IMPLEMENTED (deterministic core)
 * 
 * This module implements WP4 capabilities:
 * - Concept induction and stability assessment
 * - Abstraction structure and refinement
 * - Applicability envelopes
 * - Analogical mapping and validation
 * - Compositional world models
 * - Low-data transfer infrastructure
 * 
 * All engines preserve WP2/WP3 invariants.
 */

import {
  ConceptCandidate, ConceptDefinition, ConceptCounterexample,
  ConceptStabilityAssessment, ConceptUtilityAssessment, ConceptRevision,
  ObservationInstance, RelationalPattern,
  WP4AbstractionNode, WP4AbstractionEdge, AbstractionLattice, AbstractionOperation,
  WP4ApplicabilityEnvelope, ApplicabilityCondition, ApplicabilityViolation,
  AnalogicalMapping, AnalogicalCorrespondence, AnalogicalPrediction, AnalogyValidation,
  WP4WorldObject, WorldAgent, WorldResource, WorldConstraint, WorldEvent,
  WP4WorldState, WP4StateVariable, TransitionMechanism,
  WorldModelPrediction, ModelDisagreement, OODAssessment,
  TransferExperiment, TransferResult, TransferMetric,
  WP4ModelCard,
  ConceptStatus, StabilityStatus, AbstractionRelation, ApplicabilityStatus,
  AnalogyStatus, StateVariableStatus, OODStatus, TransferConfigurationType,
  AbstentionReasonWP4, Uncertainty,
  createTimestamped, now, generateId
} from './types.ts';
import { EvidenceGraphMemory } from './evidence-graph.ts';

// ============================================================
// CONCEPT ENGINE (§5-8)
// ============================================================

export class ConceptEngine {
  /**
   * Generate concept candidate from recurring patterns
   * Status starts as CANDIDATE, never TRUE/VALIDATED
   */
  generateConceptCandidate(
    name: string,
    definition: string,
    supportingInstances: string[],
    relations: string[],
    taskContext: string,
    sourceEvidenceIds: string[],
    generationMethod: string
  ): ConceptCandidate {
    return {
      ...createTimestamped(),
      name,
      definition,
      status: 'CANDIDATE', // Never TRUE/VALIDATED initially
      supportingInstances,
      relations,
      counterexamples: [],
      causalRoles: [],
      functionalRoles: [],
      taskContext,
      sourceEvidenceIds,
      assumptions: [],
      uncertainties: [{
        type: 'EPISTEMIC',
        description: 'Concept is candidate until stability testing'
      }],
      generationMethod
    };
  }

  /**
   * Add counterexample to concept
   * Counterexamples are first-class, never discarded
   */
  addCounterexample(
    conceptId: string,
    instance: string,
    violatedExpectation: string,
    source: string,
    context: string,
    relevance: string,
    effectOnConcept: ConceptCounterexample['effectOnConcept'],
    graph: EvidenceGraphMemory
  ): ConceptCounterexample {
    const counterexample: ConceptCounterexample = {
      ...createTimestamped(),
      conceptId,
      instance,
      violatedExpectation,
      source,
      context,
      relevance,
      effectOnConcept
    };

    graph.addConceptCounterexample(counterexample);
    return counterexample;
  }

  /**
   * Assess concept stability
   * Returns STABLE_WITHIN_ENVELOPE, UNSTABLE, CONTESTED, INSUFFICIENT_EVIDENCE, or UNKNOWN
   */
  assessStability(
    conceptId: string,
    testSet: string[],
    perturbations: Array<{ type: string; description: string; result: string }>,
    failures: string[],
    counterexamples: string[],
    limits: string[]
  ): ConceptStabilityAssessment {
    let status: StabilityStatus;

    if (testSet.length === 0) {
      status = 'INSUFFICIENT_EVIDENCE';
    } else if (failures.length > testSet.length / 2) {
      status = 'UNSTABLE';
    } else if (counterexamples.length > 0) {
      status = 'CONTESTED';
    } else if (failures.length === 0) {
      status = 'STABLE_WITHIN_ENVELOPE';
    } else {
      status = 'UNKNOWN';
    }

    return {
      ...createTimestamped(),
      conceptId,
      testSet,
      status,
      perturbations,
      failures,
      uncertainty: [{
        type: 'EPISTEMIC',
        description: `Stability assessment based on ${testSet.length} tests`
      }],
      counterexamples,
      limits
    };
  }

  /**
   * Assess concept utility (separate from stability)
   * UTILITY != TRUTH
   */
  assessUtility(
    conceptId: string,
    discrimination: number | null,
    compression: number | null,
    explanatoryRelevance: number | null,
    taskRelevance: number | null,
    transferRelevance: number | null,
    notes: string
  ): ConceptUtilityAssessment {
    const scores = [discrimination, compression, explanatoryRelevance, taskRelevance, transferRelevance]
      .filter((s): s is number => s !== null);
    
    const avgScore = scores.length > 0 
      ? scores.reduce((a, b) => a + b, 0) / scores.length 
      : null;

    let overallUtility: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
    if (avgScore === null) {
      overallUtility = 'UNKNOWN';
    } else if (avgScore >= 0.7) {
      overallUtility = 'HIGH';
    } else if (avgScore >= 0.4) {
      overallUtility = 'MEDIUM';
    } else {
      overallUtility = 'LOW';
    }

    return {
      ...createTimestamped(),
      conceptId,
      discrimination,
      compression,
      explanatoryRelevance,
      taskRelevance,
      transferRelevance,
      overallUtility,
      notes
    };
  }

  /**
   * Revise concept (refine, split, specialise, etc.)
   * Preserves history, never erases
   */
  reviseConcept(
    conceptId: string,
    revisionType: ConceptRevision['revisionType'],
    previousVersion: number,
    reason: string,
    evidence: string[],
    actorOrMethod: string,
    graph: EvidenceGraphMemory
  ): ConceptRevision {
    const revision: ConceptRevision = {
      ...createTimestamped(),
      conceptId,
      revisionType,
      previousVersion,
      newVersion: previousVersion + 1,
      reason,
      evidence,
      actorOrMethod
    };

    graph.addConceptRevision(revision);
    return revision;
  }
}

// ============================================================
// ABSTRACTION ENGINE (§9-10)
// ============================================================

export class AbstractionStructureEngine {
  /**
   * Create abstraction node
   */
  createNode(
    type: WP4AbstractionNode['type'],
    content: string,
    definition: string | undefined,
    evidenceIds: string[],
    caseId?: string
  ): WP4AbstractionNode {
    return {
      ...createTimestamped(),
      nodeId: generateId(),
      type,
      content,
      definition,
      relations: [],
      examples: [],
      counterexamples: [],
      uncertainty: [],
      evidenceIds,
      history: [],
      caseId
    };
  }

  /**
   * Create abstraction edge
   */
  createEdge(
    sourceNodeId: string,
    targetNodeId: string,
    relation: AbstractionRelation,
    evidence?: string[]
  ): WP4AbstractionEdge {
    return {
      ...createTimestamped(),
      sourceNodeId,
      targetNodeId,
      relation,
      evidence
    };
  }

  /**
   * Perform abstraction operation (merge, split, etc.)
   * Records full provenance
   */
  performOperation(
    operationType: AbstractionOperation['operationType'],
    previousState: unknown,
    newState: unknown,
    reason: string,
    evidence: string[],
    actorOrMethod: string,
    affectedNodeIds: string[],
    graph: EvidenceGraphMemory
  ): AbstractionOperation {
    const operation: AbstractionOperation = {
      ...createTimestamped(),
      operationType,
      previousState,
      newState,
      reason,
      evidence,
      actorOrMethod,
      affectedNodeIds
    };

    graph.addAbstractionOperation(operation);
    return operation;
  }
}

// ============================================================
// APPLICABILITY ENGINE (§11)
// ============================================================

export class ApplicabilityEngine {
  /**
   * Create applicability envelope
   */
  createEnvelope(
    entityId: string,
    entityType: WP4ApplicabilityEnvelope['entityType'],
    validContexts: string[],
    invalidContexts: string[],
    requiredConditions: string[],
    forbiddenConditions: string[],
    knownCounterexamples: string[],
    evidenceRequirements: string[],
    testedBoundaries: string[],
    untestedBoundaries: string[]
  ): WP4ApplicabilityEnvelope {
    return {
      ...createTimestamped(),
      entityId,
      entityType,
      validContexts,
      invalidContexts,
      requiredConditions,
      forbiddenConditions,
      knownCounterexamples,
      evidenceRequirements,
      uncertainty: [],
      supportStatus: 'UNKNOWN',
      testedBoundaries,
      untestedBoundaries
    };
  }

  /**
   * Check applicability for a target context
   */
  checkApplicability(
    envelope: WP4ApplicabilityEnvelope,
    targetContext: string,
    conditions: string[]
  ): {
    status: ApplicabilityStatus;
    matchedConditions: string[];
    violatedConditions: string[];
    missingConditions: string[];
    counterexamples: string[];
    uncertainty: Uncertainty[];
    requiredEvidence: string[];
    reason: string;
  } {
    const matchedConditions = conditions.filter((c: string) => envelope.requiredConditions.includes(c));
    const violatedConditions = conditions.filter((c: string) => envelope.forbiddenConditions.includes(c));
    const missingConditions = envelope.requiredConditions.filter((c: string) => !conditions.includes(c));

    let status: ApplicabilityStatus;
    let reason: string;

    if (envelope.invalidContexts.includes(targetContext)) {
      status = 'OUTSIDE_ENVELOPE';
      reason = `Context ${targetContext} is explicitly invalid`;
    } else if (violatedConditions.length > 0) {
      status = 'OUTSIDE_ENVELOPE';
      reason = `Forbidden conditions violated: ${violatedConditions.join(', ')}`;
    } else if (missingConditions.length > 0) {
      status = 'INSUFFICIENT_EVIDENCE';
      reason = `Missing required conditions: ${missingConditions.join(', ')}`;
    } else if (envelope.validContexts.includes(targetContext)) {
      status = 'SUPPORTED_WITHIN_ENVELOPE';
      reason = `Context ${targetContext} is within valid envelope`;
    } else {
      status = 'UNKNOWN';
      reason = `Context ${targetContext} not explicitly covered`;
    }

    return {
      status,
      matchedConditions,
      violatedConditions,
      missingConditions,
      counterexamples: envelope.knownCounterexamples,
      uncertainty: envelope.uncertainty,
      requiredEvidence: envelope.evidenceRequirements,
      reason
    };
  }
}

// ============================================================
// ANALOGICAL MAPPING ENGINE (§12-15)
// ============================================================

export class AnalogicalMappingEngine {
  /**
   * Create analogical mapping
   * Transfers RELATIONAL STRUCTURE, not labels
   */
  createMapping(
    sourceDomain: string,
    targetDomain: string,
    correspondences: AnalogicalMapping['correspondences'],
    caseId?: string
  ): AnalogicalMapping {
    return {
      ...createTimestamped(),
      mappingId: generateId(),
      sourceDomain,
      targetDomain,
      status: 'CANDIDATE', // Starts as CANDIDATE, not validated
      correspondences,
      predictions: [],
      counterexamples: [],
      caseId
    };
  }

  /**
   * Validate analogy
   * Surface similarity alone MUST NOT validate
   */
  validateAnalogy(
    mapping: AnalogicalMapping,
    structuralConsistency: boolean,
    relationPreservation: boolean,
    causalRoleCompatibility: boolean,
    semanticCompatibility: boolean,
    counterexamples: string[],
    evidence: string[]
  ): AnalogyValidation {
    let overallStatus: AnalogyStatus;

    if (!structuralConsistency || !relationPreservation) {
      overallStatus = 'INVALIDATED';
    } else if (counterexamples.length > 0) {
      overallStatus = 'CONTESTED';
    } else if (structuralConsistency && relationPreservation && causalRoleCompatibility) {
      overallStatus = 'STRUCTURALLY_SUPPORTED';
    } else {
      overallStatus = 'PARTIALLY_SUPPORTED';
    }

    return {
      ...createTimestamped(),
      mappingId: mapping.mappingId,
      structuralConsistency,
      relationPreservation,
      causalRoleCompatibility,
      semanticCompatibility,
      predictedConsequences: [],
      counterexamples,
      applicabilityCheck: 'UNKNOWN',
      overallStatus,
      evidence
    };
  }

  /**
   * Create analogical prediction
   * Prediction != fact
   */
  createPrediction(
    mappingId: string,
    sourceRelation: string,
    targetPrediction: string,
    assumptions: string[],
    requiredEvidence: string[]
  ): AnalogicalPrediction {
    return {
      ...createTimestamped(),
      mappingId,
      sourceRelation,
      targetPrediction,
      assumptions,
      uncertainty: [{
        type: 'EPISTEMIC',
        description: 'Prediction from analogy, not confirmed by evidence'
      }],
      validationStatus: 'PREDICTED', // Never OBSERVED automatically
      requiredEvidence
    };
  }

  /**
   * Check causal transfer safety
   * Source causality cannot transfer without structural correspondence
   */
  checkCausalTransfer(
    sourceCausalRelation: string,
    targetContext: string,
    structuralCorrespondence: boolean,
    contextCompatibility: boolean,
    evidence: string[]
  ): {
    supported: boolean;
    reason: string;
    abstentionReason?: AbstentionReasonWP4;
  } {
    if (!structuralCorrespondence) {
      return {
        supported: false,
        reason: 'No structural correspondence between source and target',
        abstentionReason: 'CAUSAL_TRANSFER_UNSUPPORTED'
      };
    }

    if (!contextCompatibility) {
      return {
        supported: false,
        reason: 'Target context incompatible with source causal relation',
        abstentionReason: 'OUTSIDE_APPLICABILITY_ENVELOPE'
      };
    }

    if (evidence.length === 0) {
      return {
        supported: false,
        reason: 'No evidence supporting causal transfer',
        abstentionReason: 'INSUFFICIENT_EVIDENCE'
      };
    }

    return {
      supported: true,
      reason: 'Causal transfer supported by structural correspondence and evidence'
    };
  }
}

// ============================================================
// WORLD MODEL ENGINE (§16-21)
// ============================================================

export class WorldModelEngine {
  /**
   * Create world state
   */
  createState(
    worldModelId: string,
    variables: WP4StateVariable[],
    objects: string[],
    agents: string[],
    resources: string[],
    constraints: string[],
    knownFacts: string[],
    assumptions: string[],
    provenance: string[]
  ): WP4WorldState {
    return {
      ...createTimestamped(),
      stateId: generateId(),
      worldModelId,
      timestamp: now(),
      variables,
      objects,
      agents,
      resources,
      constraints,
      knownFacts,
      assumptions,
      uncertainties: [],
      provenance
    };
  }

  /**
   * Create state variable
   * Status is OBSERVED, INFERRED, ASSUMED, PREDICTED, or UNKNOWN
   */
  createVariable(
    name: string,
    value: unknown,
    status: StateVariableStatus,
    type: string,
    worldStateId: string
  ): WP4StateVariable {
    return {
      ...createTimestamped(),
      variableId: generateId(),
      name,
      value,
      status,
      type,
      worldStateId
    };
  }

  /**
   * Apply transition mechanism
   * Returns predicted state, never mutates observed state
   */
  applyTransition(
    currentState: WP4WorldState,
    mechanism: TransitionMechanism
  ): {
    predictedState: WP4WorldState;
    violatedConstraints: string[];
    unknownEffects: string[];
  } {
    // Check preconditions
    const preconditionsMet = mechanism.preconditions.every(p => 
      currentState.knownFacts.includes(p) || 
      currentState.variables.some(v => v.value === p)
    );

    if (!preconditionsMet) {
      // Return current state with warning
      return {
        predictedState: currentState,
        violatedConstraints: ['Preconditions not met'],
        unknownEffects: ['Transition not applicable']
      };
    }

    // Apply state changes
    const newVariables = [...currentState.variables];
    for (const change of mechanism.stateChanges) {
      const varIdx = newVariables.findIndex(v => v.name === change.variable);
      if (varIdx >= 0) {
        newVariables[varIdx] = {
          ...newVariables[varIdx],
          value: change.to,
          status: 'PREDICTED' // Never OBSERVED automatically
        };
      }
    }

    const predictedState: WP4WorldState = {
      ...createTimestamped(),
      stateId: generateId(),
      worldModelId: currentState.worldModelId,
      timestamp: now(),
      variables: newVariables,
      objects: currentState.objects,
      agents: currentState.agents,
      resources: currentState.resources,
      constraints: currentState.constraints,
      knownFacts: currentState.knownFacts,
      assumptions: [...currentState.assumptions, ...mechanism.assumptions],
      uncertainties: [...currentState.uncertainties, ...mechanism.uncertainty],
      provenance: [...currentState.provenance, mechanism.id]
    };

    // Check constraints
    const violatedConstraints = mechanism.constraints.filter(c => 
      !predictedState.constraints.includes(c)
    );

    return {
      predictedState,
      violatedConstraints,
      unknownEffects: []
    };
  }

  /**
   * Detect model disagreement
   * Preserves both predictions, does not fabricate consensus
   */
  detectDisagreement(
    worldModelId: string,
    stateId: string,
    predictions: ModelDisagreement['predictions']
  ): ModelDisagreement {
    return {
      ...createTimestamped(),
      disagreementId: generateId(),
      worldModelId,
      stateId,
      predictions,
      resolution: 'DISAGREEMENT' // Never fabricate consensus
    };
  }

  /**
   * Assess OOD status
   * No ML OOD detection, uses explicit metadata/rule checks
   */
  assessOOD(
    entityId: string,
    entityType: string,
    context: string,
    validContexts: string[],
    method: string,
    evidence: string[]
  ): OODAssessment {
    let status: OODStatus;
    let reasoning: string;

    if (validContexts.includes(context)) {
      status = 'IN_DISTRIBUTION';
      reasoning = `Context ${context} is in valid contexts`;
    } else if (validContexts.length === 0) {
      status = 'NOT_ASSESSED';
      reasoning = 'No valid contexts defined for assessment';
    } else {
      status = 'POSSIBLY_OOD';
      reasoning = `Context ${context} not in valid contexts, but not explicitly OOD`;
    }

    return {
      ...createTimestamped(),
      assessmentId: generateId(),
      entityId,
      entityType,
      context,
      status,
      method,
      evidence,
      reasoning
    };
  }
}

// ============================================================
// TRANSFER ENGINE (§22-26)
// ============================================================

export class TransferEngine {
  /**
   * Create transfer experiment
   * Requires explicit target example count
   */
  createExperiment(
    sourceScenarioFamily: TransferExperiment['sourceScenarioFamily'],
    targetScenarioFamily: TransferExperiment['targetScenarioFamily'],
    sourceDataDescriptor: string,
    targetDataDescriptor: string,
    targetExampleBudget: number,
    configuration: TransferConfigurationType,
    baseline: string,
    safetyConstraints: string[],
    explanationRequirements: string[],
    systemVersion: string,
    caseId?: string
  ): TransferExperiment {
    if (targetExampleBudget <= 0) {
      throw new Error('Target example budget must be positive');
    }

    return {
      ...createTimestamped(),
      experimentId: generateId(),
      sourceScenarioFamily,
      targetScenarioFamily,
      sourceDataDescriptor,
      targetDataDescriptor,
      targetExampleBudget,
      configuration,
      baseline,
      metrics: [],
      safetyConstraints,
      explanationRequirements,
      systemVersion,
      status: 'NOT_RUN',
      caseId
    };
  }

  /**
   * Evaluate transfer result
   * Success requires safety and explanation fidelity, not just performance
   */
  evaluateResult(
    experimentId: string,
    taskPerformance: number | null,
    safetyViolations: number,
    explanationFidelity: number | null,
    sampleEfficiency: number | null,
    applicabilityViolations: number,
    notes: string
  ): TransferResult {
    let overallSuccess: TransferResult['overallSuccess'];

    // Safety violations disqualify success
    if (safetyViolations > 0) {
      overallSuccess = 'FAILURE';
      notes += '; Safety violations present';
    }
    // Explanation fidelity degradation disqualifies success
    else if (explanationFidelity !== null && explanationFidelity < 0.5) {
      overallSuccess = 'FAILURE';
      notes += '; Explanation fidelity too low';
    }
    // Performance improvement with safety and explanation OK
    else if (taskPerformance !== null && taskPerformance > 0.7 && safetyViolations === 0) {
      overallSuccess = 'SUCCESS';
    }
    // Partial success
    else if (taskPerformance !== null && taskPerformance > 0.5) {
      overallSuccess = 'PARTIAL';
    }
    // Unknown
    else {
      overallSuccess = 'UNKNOWN';
    }

    return {
      ...createTimestamped(),
      experimentId,
      taskPerformance,
      safetyViolations,
      explanationFidelity,
      sampleEfficiency,
      applicabilityViolations,
      overallSuccess,
      notes
    };
  }
}

// ============================================================
// MODEL CARD ENGINE (§31)
// ============================================================

export class ModelCardEngine {
  /**
   * Create model card
   * No inflated claims
   */
  createModelCard(
    purpose: string,
    scope: string,
    scenarioFamily: string[],
    inputs: string[],
    outputs: string[],
    assumptions: string[],
    limitations: string[],
    oodMethod: string,
    validationStatus: WP4ModelCard['validationStatus'],
    metricsExecuted: string[],
    metricsNotExecuted: string[],
    humanReviewRequirements: string[]
  ): WP4ModelCard {
    return {
      ...createTimestamped(),
      cardId: generateId(),
      purpose,
      scope,
      scenarioFamily,
      inputs,
      outputs,
      assumptions,
      limitations,
      oodMethod,
      validationStatus,
      metricsExecuted,
      metricsNotExecuted,
      humanReviewRequirements,
      version: 1
    };
  }
}
