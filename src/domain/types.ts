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

export interface BenchmarkCase extends Timestamped {
  name: string;
  description: string;
  category: string;
  input: unknown;
  expectedOutput?: unknown;
  isSynthetic: boolean;
}

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
