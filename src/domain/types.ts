/**
 * HAG-RAP LAB — Domain Types
 * Human-Governed Deep Reasoning, Abstraction and Planning
 * 
 * SCIENTIFIC STATUS: IMPLEMENTED
 * This file defines the complete epistemic type system.
 */

// ============================================================
// EPISTEMIC CONSTITUTION (§4)
// ============================================================

export type ClaimStatus =
  | 'OBSERVED'
  | 'INFERRED'
  | 'ASSUMED'
  | 'CONTESTED'
  | 'SUPERSEDED'
  | 'UNKNOWN';

export type EvidenceStatus =
  | 'AVAILABLE'
  | 'MISSING'
  | 'CONFLICTED'
  | 'STALE'
  | 'UNVERIFIED'
  | 'VERIFIED';

export type UncertaintyType =
  | 'ALEATORIC'
  | 'EPISTEMIC'
  | 'SOURCE_RELIABILITY'
  | 'MODEL'
  | 'NORMATIVE'
  | 'UNKNOWN';

export type VerificationStatus =
  | 'NOT_CHECKED'
  | 'PASSED'
  | 'FAILED'
  | 'INCONCLUSIVE'
  | 'NOT_APPLICABLE';

export type HumanDecisionStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CORRECTED'
  | 'OVERRIDDEN'
  | 'STOPPED';

export type ScientificStatus =
  | 'IMPLEMENTED'
  | 'EXPERIMENTAL'
  | 'SIMULATED'
  | 'PLACEHOLDER'
  | 'NOT_IMPLEMENTED'
  | 'NOT_TESTED'
  | 'UNKNOWN';

export type CausalRelationType =
  | 'CORRELATION'
  | 'CANDIDATE_CAUSE'
  | 'SUPPORTED_CAUSAL_RELATION'
  | 'CONTESTED_CAUSAL_RELATION'
  | 'UNKNOWN';

export type DeviationSeverity =
  | 'MINOR'
  | 'MAJOR'
  | 'SAFETY_CRITICAL'
  | 'UNKNOWN';

export type ActorType = 'HUMAN' | 'AI_COMPONENT' | 'SYSTEM' | 'TOOL';

export type ReasoningFamily =
  | 'DEDUCTIVE'
  | 'INDUCTIVE'
  | 'ABDUCTIVE'
  | 'DEFEASIBLE'
  | 'CAUSAL';

export type ConflictCause =
  | 'SOURCE_RELIABILITY'
  | 'TEMPORAL_CHANGE'
  | 'DEFINITION_MISMATCH'
  | 'EXTRACTION_ERROR'
  | 'GENUINE_UNCERTAINTY'
  | 'UNKNOWN';

export type ResourceMetricType =
  | 'CPU_TIME'
  | 'GPU_TIME'
  | 'MEMORY'
  | 'LATENCY'
  | 'ENERGY_PROXY'
  | 'MONETARY_COST';

export type ResourceProvenance =
  | 'MEASURED'
  | 'PROVIDER_REPORTED'
  | 'CALCULATED'
  | 'ESTIMATED'
  | 'UNKNOWN';

export type PerturbationClass =
  | 'MISSING_EVIDENCE'
  | 'CONFLICTING_EVIDENCE'
  | 'TEMPORAL_CHANGE'
  | 'RESOURCE_REDUCTION'
  | 'TOOL_UNAVAILABLE'
  | 'CONSTRAINT_CHANGE'
  | 'GOAL_CHANGE'
  | 'OUT_OF_DISTRIBUTION';

export type FailureClass =
  | 'PERCEPTION'
  | 'REPRESENTATION'
  | 'INFERENCE'
  | 'ABSTRACTION'
  | 'PLANNING'
  | 'ASSURANCE'
  | 'INTERACTION'
  | 'INFRASTRUCTURE';

// ============================================================
// WP3 DOMAIN EXTENSIONS (§3)
// ============================================================

export type InferenceFamily =
  | 'DEDUCTIVE'
  | 'INDUCTIVE'
  | 'ABDUCTIVE'
  | 'DEFEASIBLE'
  | 'CAUSAL';

export type CausalRelationStatus =
  | 'HYPOTHESIZED'
  | 'SUPPORTED'
  | 'CONTESTED'
  | 'REJECTED'
  | 'UNKNOWN';

export type CausalRelationKind =
  | 'CAUSES'
  | 'ENABLES'
  | 'PREVENTS'
  | 'MODERATES'
  | 'MEDIATES'
  | 'CONFOUNDS'
  | 'UNKNOWN';

export type IdentifiabilityStatus =
  | 'IDENTIFIABLE'
  | 'PARTIALLY_IDENTIFIABLE'
  | 'NOT_IDENTIFIABLE'
  | 'UNKNOWN';

export type SufficiencyStatus =
  | 'SUFFICIENT_FOR_BOUNDED_INFERENCE'
  | 'INSUFFICIENT'
  | 'CONFLICTED'
  | 'REQUIRES_HUMAN_REVIEW'
  | 'UNKNOWN';

export type ConflictCategory =
  | 'SOURCE_CONFLICT'
  | 'TEMPORAL_CONFLICT'
  | 'DEFINITION_CONFLICT'
  | 'LOGICAL_CONFLICT'
  | 'CAUSAL_CONFLICT'
  | 'MODEL_CONFLICT'
  | 'UNKNOWN';

export type ConflictResolutionStatus =
  | 'RESOLVED'
  | 'PARTIALLY_RESOLVED'
  | 'UNRESOLVED'
  | 'REQUIRES_MORE_EVIDENCE'
  | 'REQUIRES_HUMAN_REVIEW';

export type ReasoningFailureType =
  | 'MISSING_PREMISE'
  | 'INVALID_RULE'
  | 'CIRCULAR_REASONING'
  | 'CONTRADICTION'
  | 'INSUFFICIENT_EVIDENCE'
  | 'CAUSAL_NON_IDENTIFIABILITY'
  | 'OUT_OF_SCOPE'
  | 'UNSUPPORTED_ASSUMPTION'
  | 'NUMERICAL_ERROR'
  | 'UNKNOWN';

export type AbstentionReason =
  | 'INSUFFICIENT_EVIDENCE'
  | 'INCONCLUSIVE'
  | 'UNRESOLVED_CONFLICT'
  | 'NOT_IDENTIFIABLE'
  | 'OUTSIDE_SUPPORTED_SCOPE';

export type ProofNodeType =
  | 'EVIDENCE'
  | 'CLAIM'
  | 'ASSUMPTION'
  | 'RULE'
  | 'INFERENCE'
  | 'CAUSAL_RELATION'
  | 'UNCERTAINTY'
  | 'CONTRADICTION'
  | 'CONCLUSION'
  | 'HUMAN_INTERVENTION';

export type ExplanationNodeType =
  | 'SOURCE'
  | 'EVIDENCE'
  | 'CLAIM'
  | 'ASSUMPTION'
  | 'RULE'
  | 'INFERENCE'
  | 'CAUSAL_RELATION'
  | 'UNCERTAINTY'
  | 'CONTRADICTION'
  | 'CONCLUSION'
  | 'HUMAN_INTERVENTION';

export type HumanReviewAction =
  | 'CHALLENGE_INFERENCE'
  | 'CHALLENGE_CAUSAL_ASSUMPTION'
  | 'REQUEST_EVIDENCE'
  | 'REQUEST_COUNTERFACTUAL'
  | 'CORRECT_PREMISE'
  | 'REJECT_CONCLUSION_FOR_RESEARCH'
  | 'ACCEPT_CONCLUSION_FOR_RESEARCH';

export type BaselineClass =
  | 'RULE_ONLY'
  | 'HEURISTIC'
  | 'HYBRID';

// ============================================================
// CORE DOMAIN ENTITIES (§5)
// ============================================================

export interface Timestamped {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface VerificationResult {
  checkId: string;
  property: string;
  status: VerificationStatus;
  evidence?: string;
  timestamp: string;
}

export interface ProvenanceRecord extends Timestamped {
  sourceId: string;
  evidenceId?: string;
  transformation?: string;
  assumptions: string[];
  inferenceMethod?: string;
  rules?: string[];
  causalAssumptions?: string[];
  uncertainty?: Uncertainty[];
  verificationResults: VerificationResult[];
  systemVersion: string;
}

export interface Source extends Timestamped {
  name: string;
  type: string;
  reliability: number; // 0-1
  provenance?: string;
  status: EvidenceStatus;
}

export interface EvidenceItem extends Timestamped {
  sourceId: string;
  content: string;
  type: string;
  status: EvidenceStatus;
  confidence?: number;
  provenanceRecordId?: string;
  tags: string[];
}

export interface Claim extends Timestamped {
  content: string;
  status: ClaimStatus;
  evidenceIds: string[];
  assumptionIds: string[];
  inferenceIds: string[];
  uncertainty: Uncertainty[];
  supersededBy?: string;
  supersedes?: string;
  verificationStatus: VerificationStatus;
  scientificStatus: ScientificStatus;
  provenanceRecordId?: string;
}

export interface Assumption extends Timestamped {
  content: string;
  justification: string;
  status: ClaimStatus;
  challengeable: boolean;
  challengedBy?: string[];
}

export interface Uncertainty {
  type: UncertaintyType;
  magnitude?: number; // 0-1 where defined
  description: string;
  source?: string;
}

export interface Inference extends Timestamped {
  ruleId?: string;
  family: ReasoningFamily;
  inputClaimIds: string[];
  outputClaimId: string;
  assumptions: string[];
  method: string;
  uncertainty: Uncertainty[];
  rejectedAlternatives: string[];
  verificationStatus: VerificationStatus;
}

export interface InferenceRule extends Timestamped {
  name: string;
  family: ReasoningFamily;
  premises: string[];
  conclusion: string;
  description: string;
  applicabilityConditions: string[];
}

export interface Contradiction extends Timestamped {
  claimAId: string;
  claimBId: string;
  classification: ConflictCause;
  resolved: boolean;
  resolution?: string;
  resolutionTimestamp?: string;
}

// ============================================================
// CAUSAL MODEL (§14)
// ============================================================

export interface CausalNode extends Timestamped {
  name: string;
  type: string;
  description: string;
  evidenceIds: string[];
}

export interface CausalEdge extends Timestamped {
  sourceNodeId: string;
  targetNodeId: string;
  relationType: CausalRelationType;
  strength?: number;
  evidenceIds: string[];
  assumptions: string[];
}

export interface CausalHypothesis extends Timestamped {
  description: string;
  nodeId: string;
  supportingEdgeIds: string[];
  contradictingEdgeIds: string[];
  status: CausalRelationType;
  identifiability: VerificationStatus;
  assumptions: string[];
}

export interface CounterfactualQuery extends Timestamped {
  hypothesis: string;
  intervention: string;
  expectedOutcome: string;
  assumptions: string[];
  status: VerificationStatus;
}

// ============================================================
// ABSTRACTION (§16-19)
// ============================================================

export interface Concept extends Timestamped {
  name: string;
  definition: string;
  abstractionLevel: number;
  parentId?: string;
  instanceIds: string[];
  counterexamples: string[];
  stability: number; // 0-1
  scientificStatus: ScientificStatus;
}

export interface ConceptInstance extends Timestamped {
  conceptId: string;
  evidence: string;
  context: string;
}

export interface AbstractionNode extends Timestamped {
  level: number;
  content: string;
  supportingEvidenceIds: string[];
  counterexampleIds: string[];
  uncertainty: Uncertainty[];
  causalRole?: string;
  taskContexts: string[];
  validityConditions: string[];
}

export interface AbstractionEdge extends Timestamped {
  sourceId: string;
  targetId: string;
  relation: 'INSTANCE_OF' | 'SUBTYPE_OF' | 'ABSTRACTS' | 'REFINES';
}

export interface ApplicabilityEnvelope extends Timestamped {
  conceptId: string;
  validContexts: string[];
  invalidContexts: string[];
  unknownContexts: string[];
  assumptions: string[];
  boundaryConditions: string[];
  counterexamples: string[];
}

export interface Analogy extends Timestamped {
  sourceDomain: string;
  targetDomain: string;
  entityCorrespondences: Array<{ source: string; target: string }>;
  relationCorrespondences: Array<{ source: string; target: string }>;
  predictedConsequences: string[];
  uncertainty: Uncertainty[];
  validityConditions: string[];
  counterexamples: string[];
  verificationStatus: VerificationStatus;
}

// ============================================================
// WORLD MODEL (§20)
// ============================================================

export interface WorldModel extends Timestamped {
  name: string;
  version: number;
  stateVariables: StateVariable[];
  objects: WorldObject[];
  transitionMechanisms: TransitionMechanism[];
  uncertainty: Uncertainty[];
  provenanceRecordId?: string;
}

export interface WorldObject {
  id: string;
  name: string;
  type: string;
  properties: Record<string, unknown>;
}

export interface StateVariable {
  id: string;
  name: string;
  value: unknown;
  type: string;
  timestamp: string;
  uncertainty?: Uncertainty;
}

export interface WorldState extends Timestamped {
  worldModelId: string;
  variables: StateVariable[];
  timestamp: string;
}

export interface TransitionMechanism extends Timestamped {
  name: string;
  preconditions: string[];
  effects: string[];
  type: string;
  uncertainty: Uncertainty[];
}

// ============================================================
// PLANNING (§21-24)
// ============================================================

export interface Goal extends Timestamped {
  description: string;
  priority: number;
  parentId?: string;
  subGoalIds: string[];
  status: 'ACTIVE' | 'SATISFIED' | 'ABANDONED' | 'BLOCKED';
}

export interface Constraint extends Timestamped {
  description: string;
  type: 'HARD' | 'SOFT' | 'SAFETY' | 'RIGHTS' | 'RESOURCE';
  overridable: boolean;
  requiredAuthority?: ActorType;
  violated: boolean;
}

export interface PlanningOperator extends Timestamped {
  name: string;
  preconditions: string[];
  effects: string[];
  resourceCost: ResourceUsage;
  requiredAuthority?: ActorType;
}

export interface Plan extends Timestamped {
  goalId: string;
  steps: PlanStep[];
  branches: PlanBranch[];
  status: 'DRAFT' | 'EVALUATED' | 'SELECTED' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'STOPPED';
  evaluation?: PlanEvaluation;
  selectedByHuman?: string;
}

export interface PlanStep extends Timestamped {
  operatorId: string;
  preconditions: string[];
  expectedEffects: string[];
  order: number;
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
}

export interface PlanBranch extends Timestamped {
  condition: string;
  steps: PlanStep[];
  type: 'CONTINGENT' | 'FALLBACK' | 'SAFE_STOP';
}

export interface PlanAlternative extends Timestamped {
  planId: string;
  alternativePlanId: string;
  comparisonRationale: string;
}

export interface PlanEvaluation extends Timestamped {
  planId: string;
  goalSatisfaction: number;
  constraintSatisfaction: boolean;
  resourceUse: ResourceUsage;
  risk: number;
  uncertainty: Uncertainty[];
  predictedOutcome: string;
  verificationStatus: VerificationStatus;
  requiresHumanReview: boolean;
}

export interface Deviation extends Timestamped {
  planId: string;
  predictedState: string;
  observedState: string;
  severity: DeviationSeverity;
  description: string;
}

export interface ReplanningEvent extends Timestamped {
  triggerId: string;
  oldPlanId: string;
  newPlanId?: string;
  reason: string;
  deviationId?: string;
}

export interface SafeStopCondition extends Timestamped {
  description: string;
  trigger: string;
  action: 'STOP' | 'ESCALATE' | 'QUARANTINE';
}

// ============================================================
// HUMAN GOVERNANCE (§30-31)
// ============================================================

export interface HumanActor extends Timestamped {
  name: string;
  role: string;
  authorityScope: string[];
  actorType: ActorType;
}

export interface HumanIntervention extends Timestamped {
  actorId: string;
  type: 'ANNOTATE_EVIDENCE' | 'CHALLENGE_INFERENCE' | 'REQUEST_COUNTERFACTUAL' |
        'LOCK_CONSTRAINT' | 'MODIFY_PRIORITY' | 'CORRECT_CLAIM' |
        'REJECT_RECOMMENDATION' | 'OVERRIDE_RECOMMENDATION' | 'STOP_EXECUTION';
  targetId: string;
  targetType: string;
  rationale: string;
  previousState: unknown;
  newState: unknown;
  status: HumanDecisionStatus;
}

export interface HumanReview extends Timestamped {
  reviewerId: string;
  targetId: string;
  targetType: string;
  decision: HumanDecisionStatus;
  rationale: string;
  corrections?: string[];
}

// ============================================================
// ASSURANCE (§27-29)
// ============================================================

export interface AssuranceProperty extends Timestamped {
  name: string;
  type: 'LOGICAL' | 'TEMPORAL' | 'NUMERICAL' | 'SECURITY' | 'HUMAN_AUTHORITY' | 'DATA_USE' | 'SAFETY' | 'RIGHTS';
  description: string;
  verificationStatus: VerificationStatus;
}

export interface AssuranceCheck extends Timestamped {
  propertyId: string;
  method: string;
  result: VerificationStatus;
  evidence: string;
  timestamp: string;
}

export interface RuntimeMonitor extends Timestamped {
  name: string;
  invariant: string;
  type: 'PROHIBITED_ACTION' | 'MANDATORY_HUMAN_REVIEW' | 'DATA_USE_RESTRICTION' |
        'SAFE_STOP' | 'AUTHORITY_REQUIRED' | 'UNRESOLVED_CRITICAL_CONTRADICTION' |
        'OUTSIDE_APPLICABILITY_ENVELOPE' | 'RESOURCE_BUDGET_EXCEEDED';
  status: 'ACTIVE' | 'TRIGGERED' | 'VIOLATED' | 'DISABLED';
  policy: 'BLOCK' | 'QUARANTINE' | 'ESCALATE' | 'STOP';
}

export interface Hazard extends Timestamped {
  description: string;
  cause: string;
  consequence: string;
  severity: number; // 1-5
  likelihood: number; // 1-5
  controls: string[];
  residualRisk: number;
  owner: string;
}

export interface Control extends Timestamped {
  hazardId: string;
  description: string;
  effectiveness: number;
  verificationStatus: VerificationStatus;
}

// ============================================================
// RESOURCES (§32-33)
// ============================================================

export interface ResourceBudget extends Timestamped {
  limits: Record<ResourceMetricType, number>;
  currentUsage: Record<ResourceMetricType, number>;
  exceeded: boolean;
}

export interface ResourceUsage {
  cpuTime?: number;
  memory?: number;
  latency?: number;
  monetaryCost?: number;
  provenance: ResourceProvenance;
}

export interface ResourceAccount extends Timestamped {
  operationId: string;
  usage: ResourceUsage;
  timestamp: string;
}

// ============================================================
// EXPERIMENTS (§38, 41-47)
// ============================================================

// Note: BenchmarkCase is defined in WP3 section below with updated structure

export interface BenchmarkRun extends Timestamped {
  caseId: string;
  configurationId: string;
  result: unknown;
  metrics: Record<string, number>;
  status: 'NOT_RUN' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  duration?: number;
}

export interface Experiment extends Timestamped {
  name: string;
  description: string;
  configuration: ExperimentConfiguration;
  status: 'DESIGNED' | 'READY' | 'RUNNING' | 'COMPLETED' | 'ANALYZED';
  scientificStatus: ScientificStatus;
}

export interface ExperimentConfiguration extends Timestamped {
  parameters: Record<string, unknown>;
  seed?: number;
  componentVersions: Record<string, string>;
}

export interface AblationRun extends Timestamped {
  experimentId: string;
  removedComponent: string;
  result: unknown;
  metrics: Record<string, number>;
}

// ============================================================
// RESEARCH CASE (§37)
// ============================================================

export interface ResearchCase extends Timestamped {
  name: string;
  description: string;
  scenarioFamily: 'EDUCATION' | 'PUBLIC_ADMINISTRATION' | 'AI_COMPLIANCE';
  problemId: string;
  evidenceIds: string[];
  claimIds: string[];
  contradictionIds: string[];
  causalHypothesisIds: string[];
  abstractionIds: string[];
  worldModelId?: string;
  goalIds: string[];
  planIds: string[];
  humanInterventionIds: string[];
  assuranceCheckIds: string[];
  status: 'INITIALIZED' | 'EVIDENCE_GATHERED' | 'REASONING' | 'PLANNING' |
          'HUMAN_REVIEW' | 'EXECUTING' | 'COMPLETED' | 'STOPPED';
  isSynthetic: boolean;
}

export interface ProblemDefinition extends Timestamped {
  description: string;
  context: string;
  constraints: string[];
  scenarioFamily: string;
}

// ============================================================
// JUSTIFICATION / PROOF (§7, 15)
// ============================================================

export interface JustificationGraph {
  conclusionId: string;
  nodes: JustificationNode[];
  edges: JustificationEdge[];
  completeness: number;
  hasContradictions: boolean;
  hasUnresolvedUncertainty: boolean;
}

export interface JustificationNode {
  id: string;
  type: 'EVIDENCE' | 'CLAIM' | 'ASSUMPTION' | 'INFERENCE' | 'CAUSAL' | 'VERIFICATION' | 'HUMAN_DECISION';
  content: string;
  status: string;
}

export interface JustificationEdge {
  sourceId: string;
  targetId: string;
  relation: string;
}

// ============================================================
// COGNITIVE STATE EVOLUTION (§8)
// ============================================================

export interface CognitiveStateSnapshot extends Timestamped {
  claimStates: Record<string, ClaimStatus>;
  evidenceStates: Record<string, EvidenceStatus>;
  activeContradictions: string[];
  activePlanId?: string;
  worldModelState?: string;
  humanInterventions: string[];
}

export interface ChangeRecord extends Timestamped {
  fromSnapshotId: string;
  toSnapshotId: string;
  changes: ChangeDetail[];
  trigger: string;
}

export interface ChangeDetail {
  entityType: string;
  entityId: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  reason: string;
}

// ============================================================
// EMERGENT OUTCOME MODULE (§26)
// ============================================================

export interface EmergentOutcomeRecord extends Timestamped {
  intendedOutcome: string;
  plannedOutcome: string;
  authorizedOutcome: string;
  executedActions: string[];
  actualOutcome: string;
  status: 'POTENTIAL_ORPHAN_OUTCOME' | 'AUTHORIZED' | 'PLANNED' | 'INCONCLUSIVE';
  scientificStatus: ScientificStatus; // Always EXPERIMENTAL
  analysisNotes: string;
}

// ============================================================
// REQUIREMENTS REGISTER (§40)
// ============================================================

export interface Requirement extends Timestamped {
  id: string;
  wp: string;
  description: string;
  rationale: string;
  source: string;
  verificationMethod: string;
  acceptanceCriterion: string;
  status: 'DEFINED' | 'IMPLEMENTED' | 'VERIFIED' | 'NOT_YET_VERIFIED';
}

export interface HazardRegister extends Timestamped {
  id: string;
  hazard: string;
  cause: string;
  consequence: string;
  severity: number;
  likelihood: number;
  controls: string[];
  residualRisk: number;
  owner: string;
  verificationEvidence?: string;
}

// ============================================================
// OBJECTIVES (§39)
// ============================================================

export interface ResearchObjective {
  id: string;
  title: string;
  description: string;
  targetMilestone: string;
  targetMetric: string;
  targetValue: string;
  status: 'TARGET' | 'IN_PROGRESS' | 'NOT_YET_MEASURED';
  measuredResult?: string;
}

// ============================================================
// WP3 DOMAIN ENTITIES (§3)
// ============================================================

export interface InferencePremise extends Timestamped {
  claimId: string;
  role: 'SUPPORTING' | 'REQUIRED' | 'CONTEXTUAL';
  weight: number; // 0-1
  verificationStatus: VerificationStatus;
}

export interface InferenceResult extends Timestamped {
  inferenceId: string;
  conclusionClaimId: string;
  family: InferenceFamily;
  status: ClaimStatus;
  confidence: number | null; // null if not calibrated
  uncertainty: Uncertainty[];
  failures: ReasoningFailure[];
  proofTraceId?: string;
}

export interface InferenceAlternative extends Timestamped {
  inferenceId: string;
  alternativeConclusion: string;
  supportScore: number; // 0-1
  rankingRationale: string;
  missingEvidence: string[];
  contradictions: string[];
}

export interface ReasoningSession extends Timestamped {
  caseId: string;
  goalDescription: string;
  steps: ReasoningStep[];
  finalConclusionId?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'ABSTAINED';
  abstentionReason?: AbstentionReason;
  version: number;
}

export interface ReasoningStep extends Timestamped {
  sessionId: string;
  order: number;
  family: InferenceFamily;
  inputClaimIds: string[];
  outputClaimId?: string;
  ruleId?: string;
  assumptions: string[];
  result: 'SUCCESS' | 'FAILURE' | 'ABSTAINED';
  failureType?: ReasoningFailureType;
  failureDetails?: string;
}

export interface ReasoningFailure extends Timestamped {
  type: ReasoningFailureType;
  description: string;
  affectedClaimIds: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recoverable: boolean;
}

// ============================================================
// WP3 CAUSAL ENTITIES (§12-16)
// ============================================================

export interface CausalVariable extends Timestamped {
  name: string;
  type: 'OBSERVED' | 'INTERVENED' | 'LATENT' | 'OUTCOME';
  description: string;
  evidenceIds: string[];
  measurementMethod?: string;
}

export interface CausalRelation extends Timestamped {
  sourceVariableId: string;
  targetVariableId: string;
  kind: CausalRelationKind;
  status: CausalRelationStatus;
  direction: 'POSITIVE' | 'NEGATIVE' | 'NON_MONOTONIC' | 'UNKNOWN';
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  assumptions: string[];
  confounders: string[];
  uncertainty: Uncertainty[];
  contextId?: string;
  validityConditions: string[];
  knownLimitations: string[];
}

export interface CausalModel extends Timestamped {
  name: string;
  description: string;
  variableIds: string[];
  relationIds: string[];
  contextId: string;
  assumptions: string[];
  identifiabilityStatus: IdentifiabilityStatus;
  version: number;
}

export interface Intervention extends Timestamped {
  variableId: string;
  fromValue: unknown;
  toValue: unknown;
  description: string;
  feasibility: 'FEASIBLE' | 'THEORETICAL' | 'INFEASIBLE' | 'UNKNOWN';
}

export interface CounterfactualResult extends Timestamped {
  queryId: string;
  observedFacts: string[];
  intervention: string;
  expectedOutcome: string;
  causalAssumptions: string[];
  modelAssumptions: string[];
  unknownVariables: string[];
  confounders: string[];
  result: string;
  uncertainty: Uncertainty[];
  identifiability: IdentifiabilityStatus;
  status: 'CONCLUSIVE' | 'INCONCLUSIVE' | 'NOT_IDENTIFIABLE';
}

// ============================================================
// WP3 CONFLICT & SUFFICIENCY (§17-20)
// ============================================================

export interface EvidenceConflict extends Timestamped {
  category: ConflictCategory;
  claimIds: string[];
  evidenceIds: string[];
  description: string;
  resolutionStatus: ConflictResolutionStatus;
  resolutionMethod?: string;
  remainingUncertainty: Uncertainty[];
  requiresHumanReview: boolean;
}

export interface EvidenceSufficiencyAssessment extends Timestamped {
  targetClaimId: string;
  status: SufficiencyStatus;
  dimensions: {
    coverage: number; // 0-1
    provenance: number; // 0-1
    independence: number; // 0-1
    recency: number; // 0-1
    reliability: number; // 0-1
  };
  missingEvidence: string[];
  unresolvedContradictions: string[];
  criticalAssumptions: string[];
  causalIdentifiability: IdentifiabilityStatus;
  counterexamples: string[];
  recommendation: string;
}

// ============================================================
// WP3 PROOF & EXPLANATION (§23-24)
// ============================================================

export interface ProofTrace extends Timestamped {
  conclusionClaimId: string;
  nodes: ProofNode[];
  edges: ProofEdge[];
  family: InferenceFamily;
  validity: 'VALID' | 'INVALID' | 'INCOMPLETE' | 'CIRCULAR';
  failures: ReasoningFailure[];
  humanInterventions: string[];
  machineReadable: boolean;
}

export interface ProofNode {
  id: string;
  type: ProofNodeType;
  content: string;
  entityId?: string;
  status: string;
  metadata?: Record<string, unknown>;
}

export interface ProofEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relation: string;
  metadata?: Record<string, unknown>;
}

export interface ExplanationGraph extends Timestamped {
  conclusionClaimId: string;
  nodes: ExplanationNode[];
  edges: ExplanationEdge[];
  naturalLanguageSummary: string;
  completeness: number; // 0-1
  hasContradictions: boolean;
  hasUnresolvedUncertainty: boolean;
}

export interface ExplanationNode {
  id: string;
  type: ExplanationNodeType;
  content: string;
  entityId?: string;
  status: string;
}

export interface ExplanationEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relation: string;
}

// ============================================================
// WP3 CALIBRATION & REVIEW (§22, 28-29)
// ============================================================

export interface CalibrationRecord extends Timestamped {
  prediction: string;
  predictedConfidence: number | null;
  observedOutcome: string | null;
  calibrationBin?: number;
  error: number | null;
  method: string;
  datasetId?: string;
  experimentId?: string;
  status: 'NOT_CALIBRATED' | 'CALIBRATED' | 'PARTIALLY_CALIBRATED';
}

export interface ReasoningReview extends Timestamped {
  inferenceId: string;
  reviewerId: string;
  action: HumanReviewAction;
  rationale: string;
  corrections?: string[];
  affectedInferenceIds: string[];
  timestamp: string;
}

// ============================================================
// WP3 BENCHMARK INFRASTRUCTURE (§39-42)
// ============================================================

export interface BenchmarkCase extends Timestamped {
  family: string;
  task: string;
  groundTruth: unknown;
  evidence: string[];
  expectedReasoningProperties: Record<string, unknown>;
  expectedConclusion?: string;
  allowedAbstention: boolean;
  adversarialFeatures: string[];
  metadata: Record<string, unknown>;
}

export interface BenchmarkRun extends Timestamped {
  benchmarkCaseId: string;
  engineVersion: string;
  configuration: Record<string, unknown>;
  result: unknown;
  proofTraceId?: string;
  metrics: Record<string, number>;
  status: 'NOT_RUN' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  duration?: number;
}

export interface AblationConfiguration extends Timestamped {
  name: string;
  disabledComponents: string[];
  description: string;
}

// ============================================================
// WP3 CLAIM EXTRACTION (§34)
// ============================================================

export interface ClaimExtraction {
  inputType: 'TEXT' | 'TABLE' | 'IMAGE' | 'STRUCTURED_RECORD' | 'OTHER';
  sourceId: string;
  extractedClaims: Array<{
    content: string;
    confidence: number | null;
    evidenceSpan?: string;
  }>;
  method: string;
  timestamp: string;
}

// ============================================================
// WP4 DOMAIN TYPES (§4)
// ============================================================

export type ConceptStatus =
  | 'CANDIDATE'
  | 'UNDER_TEST'
  | 'STABLE_WITHIN_ENVELOPE'
  | 'UNSTABLE'
  | 'CONTESTED'
  | 'RETIRED'
  | 'SUPERSEDED'
  | 'UNKNOWN';

export type StabilityStatus =
  | 'STABLE_WITHIN_ENVELOPE'
  | 'UNSTABLE'
  | 'CONTESTED'
  | 'INSUFFICIENT_EVIDENCE'
  | 'UNKNOWN';

export type AbstractionRelation =
  | 'INSTANCE_OF'
  | 'SPECIALISES'
  | 'GENERALISES'
  | 'OVERLAPS'
  | 'RELATED_TO'
  | 'SUPERSEDES';

export type ApplicabilityStatus =
  | 'SUPPORTED_WITHIN_ENVELOPE'
  | 'OUTSIDE_ENVELOPE'
  | 'BOUNDARY_CASE'
  | 'INSUFFICIENT_EVIDENCE'
  | 'CONTESTED'
  | 'UNKNOWN';

export type AnalogyStatus =
  | 'CANDIDATE'
  | 'STRUCTURALLY_SUPPORTED'
  | 'PARTIALLY_SUPPORTED'
  | 'VALIDATED_WITHIN_ENVELOPE'
  | 'CONTESTED'
  | 'INVALIDATED'
  | 'UNKNOWN';

export type StateVariableStatus =
  | 'OBSERVED'
  | 'INFERRED'
  | 'ASSUMED'
  | 'PREDICTED'
  | 'UNKNOWN';

export type OODStatus =
  | 'IN_DISTRIBUTION'
  | 'POSSIBLY_OOD'
  | 'OUT_OF_DISTRIBUTION'
  | 'NOT_ASSESSED'
  | 'UNKNOWN';

export type TransferConfigurationType =
  | 'NO_TRANSFER'
  | 'EMBEDDING_TRANSFER'
  | 'WORLD_MODEL_TRANSFER'
  | 'CONCEPT_PLUS_CAUSAL_TRANSFER';

export type AbstentionReasonWP4 =
  | 'INSUFFICIENT_EVIDENCE'
  | 'UNSTABLE_CONCEPT'
  | 'OUTSIDE_APPLICABILITY_ENVELOPE'
  | 'ANALOGY_UNSUPPORTED'
  | 'CAUSAL_TRANSFER_UNSUPPORTED'
  | 'WORLD_MODEL_UNSUPPORTED'
  | 'OOD'
  | 'TRANSFER_NOT_VALIDATED'
  | 'UNKNOWN';

// ============================================================
// WP4 CONCEPT ENTITIES (§4-8)
// ============================================================

export interface ObservationInstance extends Timestamped {
  caseId: string;
  content: string;
  properties: Record<string, unknown>;
  relations: string[];
  evidenceIds: string[];
  context: string;
}

export interface RelationalPattern extends Timestamped {
  pattern: string;
  instances: string[];
  frequency: number;
  context: string;
}

export interface FunctionalRole extends Timestamped {
  name: string;
  description: string;
  instances: string[];
  causalRole?: string;
}

export interface CausalRole extends Timestamped {
  name: string;
  causeEffectRelation: string;
  instances: string[];
  assumptions: string[];
}

export interface ConceptCandidate extends Timestamped {
  name: string;
  definition: string;
  status: ConceptStatus;
  supportingInstances: string[];
  relations: string[];
  counterexamples: string[];
  causalRoles: string[];
  functionalRoles: string[];
  taskContext: string;
  sourceEvidenceIds: string[];
  assumptions: string[];
  uncertainties: Uncertainty[];
  generationMethod: string;
  caseId?: string;
}

export interface ConceptDefinition extends Timestamped {
  conceptId: string;
  definition: string;
  necessaryConditions: string[];
  sufficientConditions: string[];
  examples: string[];
  counterexamples: string[];
  version: number;
}

export interface ConceptCounterexample extends Timestamped {
  conceptId: string;
  instance: string;
  violatedExpectation: string;
  source: string;
  context: string;
  relevance: string;
  effectOnConcept: 'REFINE' | 'SPLIT' | 'SPECIALISE' | 'CONTEST' | 'RETIRE';
  humanReview?: string;
}

export interface ConceptStabilityAssessment extends Timestamped {
  conceptId: string;
  testSet: string[];
  status: StabilityStatus;
  perturbations: Array<{
    type: string;
    description: string;
    result: string;
  }>;
  failures: string[];
  uncertainty: Uncertainty[];
  counterexamples: string[];
  limits: string[];
}

export interface ConceptUtilityAssessment extends Timestamped {
  conceptId: string;
  discrimination: number | null;
  compression: number | null;
  explanatoryRelevance: number | null;
  taskRelevance: number | null;
  transferRelevance: number | null;
  overallUtility: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  notes: string;
}

export interface ConceptRevision extends Timestamped {
  conceptId: string;
  revisionType: 'REFINE' | 'SPLIT' | 'SPECIALISE' | 'GENERALISE' | 'RETIRE' | 'SUPERSEDE';
  previousVersion: number;
  newVersion: number;
  reason: string;
  evidence: string[];
  actorOrMethod: string;
}

// ============================================================
// WP4 ABSTRACTION STRUCTURE (§9-10)
// ============================================================

export interface WP4AbstractionNode extends Timestamped {
  nodeId: string;
  type: 'INSTANCE' | 'CONCEPT' | 'SCHEMA';
  content: string;
  definition?: string;
  relations: string[];
  examples: string[];
  counterexamples: string[];
  causalRole?: string;
  functionalRole?: string;
  uncertainty: Uncertainty[];
  applicabilityEnvelopeId?: string;
  evidenceIds: string[];
  history: string[];
  caseId?: string;
}

export interface WP4AbstractionEdge extends Timestamped {
  sourceNodeId: string;
  targetNodeId: string;
  relation: AbstractionRelation;
  strength?: number;
  evidence?: string[];
}

export interface AbstractionLattice extends Timestamped {
  name: string;
  description: string;
  nodeIds: string[];
  edgeIds: string[];
  rootIds: string[];
  leafIds: string[];
  caseId?: string;
}

// Alias para compatibilidad con código WP2/WP3 existente
export type WP4AbstractionNodeType = WP4AbstractionNode['type'];

export interface AbstractionOperation extends Timestamped {
  operationType: 'MERGE' | 'SPLIT' | 'SPECIALISE' | 'GENERALISE' | 'REFINE' | 'RETIRE' | 'SUPERSEDE';
  previousState: unknown;
  newState: unknown;
  reason: string;
  evidence: string[];
  actorOrMethod: string;
  affectedNodeIds: string[];
}

// ============================================================
// WP4 APPLICABILITY ENVELOPE (§11)
// ============================================================

export interface WP4ApplicabilityEnvelope extends Timestamped {
  entityId: string;
  entityType: 'CONCEPT' | 'ANALOGY' | 'WORLD_MODEL';
  validContexts: string[];
  invalidContexts: string[];
  requiredConditions: string[];
  forbiddenConditions: string[];
  knownCounterexamples: string[];
  evidenceRequirements: string[];
  uncertainty: Uncertainty[];
  supportStatus: ApplicabilityStatus;
  testedBoundaries: string[];
  untestedBoundaries: string[];
}

export interface ApplicabilityCondition extends Timestamped {
  envelopeId: string;
  condition: string;
  type: 'REQUIRED' | 'FORBIDDEN' | 'OPTIONAL';
  evidence?: string[];
}

export interface ApplicabilityViolation extends Timestamped {
  envelopeId: string;
  context: string;
  violatedConditions: string[];
  missingConditions: string[];
  counterexamples: string[];
  status: ApplicabilityStatus;
  reason: string;
}

// ============================================================
// WP4 ANALOGICAL MAPPING (§12-15)
// ============================================================

export interface StructuralMapping extends Timestamped {
  sourceId: string;
  targetId: string;
  entityCorrespondences: Array<{
    source: string;
    target: string;
    relationType: string;
  }>;
  relationCorrespondences: Array<{
    source: string;
    target: string;
    structuralSupport: number;
  }>;
}

export interface AnalogicalMapping extends Timestamped {
  mappingId: string;
  sourceDomain: string;
  targetDomain: string;
  status: AnalogyStatus;
  correspondences: Array<{
    sourceElement: string;
    targetElement: string;
    relationType: string;
    structuralSupport: number;
    semanticCompatibility: number;
    causalRoleCompatibility: number;
    goalRelevance: number;
    conflicts: string[];
    uncertainty: Uncertainty[];
    evidence: string[];
  }>;
  predictions: string[];
  counterexamples: string[];
  applicabilityEnvelopeId?: string;
  caseId?: string;
}

export interface AnalogicalCorrespondence extends Timestamped {
  mappingId: string;
  sourceElement: string;
  targetElement: string;
  relationType: string;
  structuralSupport: number;
  semanticCompatibility: number;
  causalRoleCompatibility: number;
  goalRelevance: number;
  conflicts: string[];
  uncertainty: Uncertainty[];
  evidence: string[];
  status: 'SUPPORTED' | 'CONTESTED' | 'INVALIDATED' | 'UNKNOWN';
}

export interface AnalogicalPrediction extends Timestamped {
  mappingId: string;
  sourceRelation: string;
  targetPrediction: string;
  assumptions: string[];
  uncertainty: Uncertainty[];
  validationStatus: 'PREDICTED' | 'CONFIRMED' | 'REFUTED' | 'UNKNOWN';
  requiredEvidence: string[];
}

export interface AnalogyValidation extends Timestamped {
  mappingId: string;
  structuralConsistency: boolean;
  relationPreservation: boolean;
  causalRoleCompatibility: boolean;
  semanticCompatibility: boolean;
  predictedConsequences: string[];
  counterexamples: string[];
  applicabilityCheck: ApplicabilityStatus;
  overallStatus: AnalogyStatus;
  evidence: string[];
}

// ============================================================
// WP4 WORLD MODEL (§16-21)
// ============================================================

export interface WP4WorldObject extends Timestamped {
  objectId: string;
  name: string;
  type: string;
  properties: Record<string, unknown>;
  relations: string[];
  worldModelId: string;
}

export interface WorldAgent extends Timestamped {
  agentId: string;
  name: string;
  capabilities: string[];
  goals: string[];
  constraints: string[];
  worldModelId: string;
}

export interface WorldResource extends Timestamped {
  resourceId: string;
  name: string;
  type: string;
  quantity: number;
  constraints: string[];
  worldModelId: string;
}

export interface WorldConstraint extends Timestamped {
  constraintId: string;
  description: string;
  type: 'HARD' | 'SOFT' | 'SAFETY' | 'RESOURCE';
  expression: string;
  worldModelId: string;
}

export interface WorldEvent extends Timestamped {
  eventId: string;
  name: string;
  type: string;
  preconditions: string[];
  effects: string[];
  worldModelId: string;
}

export interface WP4WorldState extends Timestamped {
  stateId: string;
  worldModelId: string;
  timestamp: string;
  variables: WP4StateVariable[];
  objects: string[];
  agents: string[];
  resources: string[];
  constraints: string[];
  knownFacts: string[];
  assumptions: string[];
  uncertainties: Uncertainty[];
  provenance: string[];
}

export interface WP4StateVariable extends Timestamped {
  variableId: string;
  name: string;
  value: unknown;
  status: StateVariableStatus;
  type: string;
  worldStateId: string;
}

export interface WP4TransitionMechanism extends Timestamped {
  mechanismId: string;
  name: string;
  preconditions: string[];
  trigger: string;
  stateChanges: Array<{
    variable: string;
    from: unknown;
    to: unknown;
  }>;
  constraints: string[];
  assumptions: string[];
  uncertainty: Uncertainty[];
  evidence: string[];
  worldModelId: string;
}

export interface WorldModelPrediction extends Timestamped {
  predictionId: string;
  worldModelId: string;
  inputStateId: string;
  transitionId: string;
  predictedStateId: string;
  assumptions: string[];
  uncertainties: Uncertainty[];
  modelVersion: number;
  applicabilityEnvelopeId?: string;
  oodAssessment: OODStatus;
  modelDisagreement?: string;
  validationStatus: 'PREDICTED' | 'CONFIRMED' | 'REFUTED' | 'UNKNOWN';
}

export interface ModelDisagreement extends Timestamped {
  disagreementId: string;
  worldModelId: string;
  stateId: string;
  predictions: Array<{
    mechanismId: string;
    predictedValue: unknown;
    uncertainty: Uncertainty[];
  }>;
  resolution: 'DISAGREEMENT' | 'RESOLVED' | 'UNKNOWN';
  evidence?: string[];
}

export interface OODAssessment extends Timestamped {
  assessmentId: string;
  entityId: string;
  entityType: string;
  context: string;
  status: OODStatus;
  method: string;
  evidence: string[];
  reasoning: string;
}

// ============================================================
// WP4 LOW-DATA TRANSFER (§22-26)
// ============================================================

export interface TransferExperiment extends Timestamped {
  experimentId: string;
  sourceScenarioFamily: 'EDUCATION' | 'PUBLIC_ADMINISTRATION' | 'AI_COMPLIANCE';
  targetScenarioFamily: 'EDUCATION' | 'PUBLIC_ADMINISTRATION' | 'AI_COMPLIANCE';
  sourceDataDescriptor: string;
  targetDataDescriptor: string;
  targetExampleBudget: number;
  configuration: TransferConfigurationType;
  baseline: string;
  metrics: TransferMetric[];
  safetyConstraints: string[];
  explanationRequirements: string[];
  randomSeed?: number;
  systemVersion: string;
  status: 'NOT_RUN' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'NOT_IMPLEMENTED';
  caseId?: string;
}

export interface TransferConfiguration extends Timestamped {
  configurationId: string;
  type: TransferConfigurationType;
  parameters: Record<string, unknown>;
  description: string;
}

export interface TransferResult extends Timestamped {
  experimentId: string;
  taskPerformance: number | null;
  safetyViolations: number;
  explanationFidelity: number | null;
  sampleEfficiency: number | null;
  applicabilityViolations: number;
  overallSuccess: 'SUCCESS' | 'FAILURE' | 'PARTIAL' | 'UNKNOWN';
  notes: string;
}

export interface TransferMetric extends Timestamped {
  name: string;
  value: number | null;
  unit: string;
  status: 'MEASURED' | 'NOT_MEASURED' | 'UNKNOWN';
}

// ============================================================
// WP4 MODEL CARD (§31)
// ============================================================

export interface WP4ModelCard extends Timestamped {
  cardId: string;
  purpose: string;
  scope: string;
  scenarioFamily: string[];
  inputs: string[];
  outputs: string[];
  assumptions: string[];
  limitations: string[];
  applicabilityEnvelopeId?: string;
  oodMethod: string;
  validationStatus: 'VALIDATED' | 'PARTIALLY_VALIDATED' | 'NOT_VALIDATED' | 'UNKNOWN';
  metricsExecuted: string[];
  metricsNotExecuted: string[];
  humanReviewRequirements: string[];
  version: number;
}

// ============================================================
// UTILITY TYPES
// ============================================================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function now(): string {
  return new Date().toISOString();
}

export function createTimestamped(): Pick<Timestamped, 'id' | 'createdAt' | 'updatedAt' | 'version'> {
  const ts = now();
  return {
    id: generateId(),
    createdAt: ts,
    updatedAt: ts,
    version: 1,
  };
}
