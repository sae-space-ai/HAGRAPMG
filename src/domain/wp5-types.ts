/**
 * HAG-RAP LAB — WP5 Domain Types (Refactored)
 * Deep Planning & Continual Replanning
 * 
 * ARCHITECTURE: Bounded Planning Context
 * WP5 references canonical WP2-WP4 objects through stable IDs.
 * WP5-specific state is orthogonal and composable.
 * 
 * SCIENTIFIC STATUS: IMPLEMENTED
 */

import { Timestamped, Uncertainty } from './types.ts';

// ============================================================
// AUTHORITY MODEL (§4-5)
// ============================================================

export type AuthoritySource = 'HUMAN' | 'SYSTEM' | 'DELEGATED' | 'UNKNOWN';

export type ConstraintMutability = 
  | 'NON_NEGOTIABLE'
  | 'HUMAN_LOCKED'
  | 'SYSTEM_DERIVED'
  | 'PLAN_LOCAL'
  | 'ADVISORY';

export type PlanningConstraintType =
  | 'SAFETY'
  | 'RIGHTS'
  | 'LEGAL'
  | 'ETHICAL_POLICY'
  | 'TEMPORAL'
  | 'RESOURCE'
  | 'DEPENDENCY'
  | 'PRECONDITION'
  | 'PROHIBITED_ACTION'
  | 'PROHIBITED_OUTCOME'
  | 'MANDATORY_REVIEW'
  | 'DATA_USE'
  | 'AUTHORITY'
  | 'OPERATIONAL'
  | 'OTHER';

// ============================================================
// PLANNING GOAL (§6-7)
// References canonical Goal via ID, adds planning metadata
// ============================================================

export interface PlanningGoal extends Timestamped {
  planningGoalId: string;
  canonicalGoalId: string; // Reference to canonical Goal
  caseId: string;
  parentPlanningGoalId?: string;
  origin: 'HUMAN' | 'SYSTEM' | 'DECOMPOSED';
  priority: number;
  successCriteria: string[];
  failureCriteria: string[];
  dependencyIds: string[];
  constraintIds: string[]; // References to PlanningConstraints
  uncertainties: Uncertainty[];
  decompositionStatus: 'ATOMIC' | 'DECOMPOSED' | 'DRIFT_DETECTED';
  driftScore?: number;
  version: number;
  provenance: string[];
}

export interface GoalDecomposition extends Timestamped {
  decompositionId: string;
  parentPlanningGoalId: string;
  subgoalPlanningIds: string[];
  method: string;
  assumptions: string[];
  evidence: string[];
  constraintsInherited: string[];
  constraintsAdded: string[];
  provenance: string[];
}

export interface GoalRevision extends Timestamped {
  revisionId: string;
  planningGoalId: string;
  previousVersion: number;
  newVersion: number;
  changeType: 'MODIFIED' | 'SUPERSEDED' | 'ABANDONED';
  reason: string;
  evidence: string[];
  humanIntervention?: string;
  provenance: string[];
}

// ============================================================
// PLANNING CONSTRAINT (§8-9)
// References canonical Constraint via ID, adds planning authority
// ============================================================

export interface PlanningConstraint extends Timestamped {
  planningConstraintId: string;
  canonicalConstraintId?: string; // Optional reference to canonical Constraint
  caseId: string;
  type: PlanningConstraintType;
  description: string;
  source: 'HUMAN' | 'SYSTEM' | 'DERIVED';
  authority: AuthoritySource;
  mutability: ConstraintMutability;
  hard: boolean;
  scope: string[];
  condition: string;
  violationSemantics: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  locked: boolean;
  version: number;
  provenance: string[];
}

// ============================================================
// PLANNING OPERATOR (§10)
// ============================================================

export interface PlanningOperator extends Timestamped {
  operatorId: string;
  name: string;
  preconditions: Array<{
    condition: string;
    status: 'KNOWN_TRUE' | 'KNOWN_FALSE' | 'UNKNOWN';
    evidence?: string[];
  }>;
  effects: string[];
  possibleEffects: string[];
  resources: Array<{
    resource: string;
    required: number;
    available?: number;
  }>;
  duration?: {
    min?: number;
    max?: number;
    estimated: number;
  };
  dependencies: string[];
  applicableWorldStates: string[];
  forbiddenContexts: string[];
  authorityRequirement?: string;
  risk: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  uncertainties: Uncertainty[];
  reversibility: 'FULL' | 'PARTIAL' | 'NONE';
  informationEffects: string[];
  version: number;
  provenance: string[];
}

// ============================================================
// PLANNING PLAN (§11-12)
// References canonical Plan via ID, adds orthogonal planning states
// ============================================================

// ORTHOGONAL DIMENSIONS - Do not collapse into single enum
export type PlanningLifecycleStatus = 
  | 'DRAFT'
  | 'EVALUATED'
  | 'SELECTED'
  | 'EXECUTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'STOPPED';

export type PlanningAdmissibility =
  | 'NOT_EVALUATED'
  | 'ADMISSIBLE'
  | 'INADMISSIBLE'
  | 'CONTESTED'
  | 'UNKNOWN';

export type PlanningReplanningStatus =
  | 'STABLE'
  | 'DEVIATED'
  | 'REPAIRING'
  | 'REPLANNING'
  | 'SAFE_STOPPED';

export type PlanningAuthorityStatus =
  | 'WITHIN_AUTHORITY'
  | 'HUMAN_REVIEW_REQUIRED'
  | 'AUTHORITY_BLOCKED';

export type OrderingRelation = 'BEFORE' | 'AFTER' | 'CONCURRENT_WITH' | 'INDEPENDENT_OF' | 'UNKNOWN';

export interface PlanningPlan extends Timestamped {
  planningPlanId: string;
  canonicalPlanId?: string; // Optional reference to canonical Plan
  caseId: string;
  goalIds: string[]; // References to PlanningGoals
  worldModelId?: string;
  worldStateId?: string;
  steps: PlanningStep[];
  dependencies: PlanDependency[];
  branches: PlanBranch[];
  constraintIds: string[]; // References to PlanningConstraints
  lockedConstraintIds: string[];
  assumptions: string[];
  uncertainties: Uncertainty[];
  expectedEffects: string[];
  resources: Array<{ resource: string; allocated: number }>;
  cost?: number;
  risk: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  humanGates: string[];
  fallbacks: string[];
  
  // ORTHOGONAL STATES - Separate dimensions
  lifecycleStatus: PlanningLifecycleStatus;
  admissibility: PlanningAdmissibility;
  replanningStatus: PlanningReplanningStatus;
  authorityStatus: PlanningAuthorityStatus;
  
  version: number;
  parentPlanningPlanId?: string;
  provenance: string[];
}

export interface PlanningStep extends Timestamped {
  stepId: string;
  planningPlanId: string;
  operatorId: string;
  preconditions: string[];
  expectedEffects: string[];
  resources: Array<{ resource: string; allocated: number }>;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  simulatedExecution?: {
    timestamp: string;
    predictedOutcome: string;
    uncertainties: Uncertainty[];
  };
  observedExecution?: {
    timestamp: string;
    actualOutcome: string;
    deviations: string[];
  };
  version: number;
}

export interface PlanDependency extends Timestamped {
  dependencyId: string;
  planningPlanId: string;
  fromStepId: string;
  toStepId: string;
  relation: OrderingRelation;
  constraints: string[];
}

export interface PlanBranch extends Timestamped {
  branchId: string;
  planningPlanId: string;
  condition: string;
  trigger: string;
  requiredObservation?: string;
  evidence: string[];
  uncertainties: Uncertainty[];
  constraints: string[];
  steps: PlanningStep[];
  fallback: boolean;
  humanGate: boolean;
  version: number;
}

export interface PlanEvaluation extends Timestamped {
  evaluationId: string;
  planningPlanId: string;
  goalAlignment: number;
  constraintsSatisfied: string[];
  constraintsViolated: Array<{ constraintId: string; reason: string }>;
  assumptions: string[];
  uncertainties: Uncertainty[];
  resourceRequirements: Array<{ resource: string; required: number; available?: number }>;
  expectedOutcome: string;
  risk: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  admissible: boolean;
  blockingConstraints: string[];
  reason: string;
  provenance: string[];
}

export interface PlanAlternative extends Timestamped {
  alternativeId: string;
  planningPlanId: string;
  alternativePlanningPlanId: string;
  comparisonRationale: string;
  whyGenerated: string;
  whySelected: boolean;
  whyRejected: boolean;
  rejectionReason?: string;
  humanIntervention?: string;
  provenance: string[];
}

export interface PlanFailure extends Timestamped {
  failureId: string;
  planningPlanId: string;
  stepId?: string;
  failureType: string;
  description: string;
  timestamp: string;
  consequences: string[];
  recoveryActions: string[];
  provenance: string[];
}

export interface PlanRepair extends Timestamped {
  repairId: string;
  planningPlanId: string;
  deviationId: string;
  repairType: 'STEP_REPLACEMENT' | 'REORDERING' | 'RETRY' | 'FALLBACK_ACTIVATION' | 'INFORMATION_GATHERING' | 'RESOURCE_REALLOCATION';
  description: string;
  changes: Array<{
    type: string;
    target: string;
    before: unknown;
    after: unknown;
  }>;
  constraintsPreserved: boolean;
  lockedConstraintsPreserved: boolean;
  humanGatesPreserved: boolean;
  authorityPreserved: boolean;
  provenance: string[];
}

export interface PlanRevision extends Timestamped {
  revisionId: string;
  planningPlanId: string;
  previousVersion: number;
  newVersion: number;
  revisionType: 'REPAIR' | 'REPLAN' | 'HUMAN_MODIFICATION';
  reason: string;
  evidence: string[];
  newEvidence: string[];
  updatedWorldState?: string;
  failedSteps: string[];
  constraintsChanged: boolean;
  humanIntervention?: string;
  provenance: string[];
}

export interface PlanSelectionRecord extends Timestamped {
  selectionId: string;
  planningPlanId: string;
  selectedBy: 'HUMAN' | 'SYSTEM';
  selectorId: string;
  rationale: string;
  alternativesConsidered: string[];
  timestamp: string;
  provenance: string[];
}

export interface PlanExecutionTrace extends Timestamped {
  traceId: string;
  planningPlanId: string;
  executionType: 'SIMULATED' | 'OBSERVED' | 'PREDICTED' | 'REQUESTED' | 'NOT_EXECUTED';
  steps: Array<{
    stepId: string;
    timestamp: string;
    status: string;
    outcome: string;
    deviations: string[];
  }>;
  provenance: string[];
}

// ============================================================
// DEVIATION MODEL (§26-28)
// ============================================================

export type DeviationType =
  | 'STATE_MISMATCH'
  | 'PRECONDITION_FAILURE'
  | 'RESOURCE_CHANGE'
  | 'TEMPORAL_DELAY'
  | 'NEW_EVIDENCE'
  | 'CONTRADICTION_DISCOVERED'
  | 'CONSTRAINT_CHANGE'
  | 'ACTION_FAILURE'
  | 'WORLD_MODEL_ERROR'
  | 'OOD_CONTEXT'
  | 'HUMAN_INTERVENTION'
  | 'EXTERNAL_DEPENDENCY_FAILURE';

export type DeviationSeverity = 'MINOR' | 'MAJOR' | 'SAFETY_CRITICAL' | 'AUTHORITY_CRITICAL' | 'UNKNOWN';

export interface Deviation extends Timestamped {
  deviationId: string;
  planningPlanId: string;
  stepId?: string;
  type: DeviationType;
  severity: DeviationSeverity;
  description: string;
  predictedState: string;
  observedState: string;
  evidence: string[];
  constraintsAffected: string[];
  lockedConstraintsAffected: string[];
  repairable: boolean;
  repairAttempted: boolean;
  repairId?: string;
  provenance: string[];
}

// ============================================================
// RESOURCE MODEL (§15)
// ============================================================

export interface ResourceRequirement extends Timestamped {
  requirementId: string;
  planningPlanId: string;
  stepId?: string;
  resource: string;
  required: number;
  available?: number;
  status: 'SATISFIED' | 'INSUFFICIENT' | 'UNKNOWN';
  provenance: string[];
}

export interface ResourceConflict extends Timestamped {
  conflictId: string;
  planningPlanId: string;
  resource: string;
  conflictingSteps: string[];
  description: string;
  resolution?: string;
  provenance: string[];
}

export interface ResourceBudget extends Timestamped {
  budgetId: string;
  caseId: string;
  resource: string;
  total: number;
  allocated: number;
  remaining: number;
  locked: boolean;
  provenance: string[];
}

// ============================================================
// MULTIAGENT MODEL (§38-40)
// ============================================================

export interface AgentDeclaration extends Timestamped {
  agentId: string;
  caseId: string;
  name: string;
  capabilities: string[];
  limitations: string[];
  confidence?: number;
  dependencies: string[];
  acceptedGoals: string[];
  acceptedConstraints: string[];
  authorityScope: string[];
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'UNKNOWN';
  provenance: string[];
}

export type CommitmentStatus =
  | 'PROPOSED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'FULFILLED'
  | 'FAILED'
  | 'WITHDRAWN'
  | 'CONTESTED'
  | 'UNKNOWN';

export interface MultiagentCommitment extends Timestamped {
  commitmentId: string;
  caseId: string;
  issuerId: string;
  receiverId: string;
  goalOrAction: string;
  conditions: string[];
  constraints: string[];
  deadline?: string;
  status: CommitmentStatus;
  evidence: string[];
  verification: string[];
  provenance: string[];
}

// ============================================================
// PLAN CARD (§45)
// ============================================================

export interface WP5PlanCard extends Timestamped {
  cardId: string;
  purpose: string;
  scope: string;
  planningMethod: string;
  supportedOperatorTypes: string[];
  scenarioFamily: string[];
  goals: string[];
  constraintSemantics: string;
  authorityModel: string;
  resourceSemantics: string;
  worldModelDependency: string;
  uncertaintyHandling: string;
  replanningPolicy: string;
  safeStopPolicy: string;
  humanReviewRequirements: string[];
  multiagentLimitations: string[];
  validationStatus: 'VALIDATED' | 'PARTIALLY_VALIDATED' | 'NOT_VALIDATED' | 'UNKNOWN';
  metricsExecuted: string[];
  metricsNotExecuted: string[];
  knownLimitations: string[];
  version: number;
}

// ============================================================
// PLAN HISTORY (§31-32)
// ============================================================

export interface PlanHistoryEntry extends Timestamped {
  entryId: string;
  planningPlanId: string;
  version: number;
  event: 'CREATED' | 'EVALUATED' | 'SELECTED' | 'DEVIATED' | 'REPAIRED' | 'REPLANNED' | 'HUMAN_MODIFIED' | 'COMPLETED' | 'FAILED' | 'ABANDONED';
  description: string;
  evidence: string[];
  humanIntervention?: string;
  constraintsChanged: boolean;
  provenance: string[];
}

export interface WhatChangedTrace extends Timestamped {
  traceId: string;
  planningPlanId: string;
  chain: Array<{
    event: string;
    description: string;
    timestamp: string;
    evidence: string[];
  }>;
  summary: string;
  provenance: string[];
}
