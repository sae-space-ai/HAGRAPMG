/**
 * HAG-RAP LAB — WP5 Domain Types
 * Deep Planning & Continual Replanning
 * 
 * SCIENTIFIC STATUS: IMPLEMENTED
 */

import { Timestamped, Uncertainty } from './types.ts';

// ============================================================
// AUTHORITY MODEL (§4-5)
// ============================================================

export type AuthoritySource = 'HUMAN' | 'SYSTEM' | 'DELEGATED' | 'UNKNOWN';

export type AuthorityLevel = 'ABSOLUTE' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export type ConstraintMutability = 
  | 'NON_NEGOTIABLE'
  | 'HUMAN_LOCKED'
  | 'SYSTEM_DERIVED'
  | 'PLAN_LOCAL'
  | 'ADVISORY';

export type ConstraintType =
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

export interface AuthorityBoundary extends Timestamped {
  boundaryId: string;
  caseId: string;
  description: string;
  scope: string[];
  level: AuthorityLevel;
  source: AuthoritySource;
  locked: boolean;
  provenance: string[];
}

export interface AuthorityDecision extends Timestamped {
  decisionId: string;
  caseId: string;
  authorityId: string;
  action: string;
  targetId: string;
  targetType: string;
  rationale: string;
  previousState: unknown;
  newState: unknown;
  provenance: string[];
}

export interface AuthorityViolation extends Timestamped {
  violationId: string;
  caseId: string;
  constraintId: string;
  planId?: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  detected: boolean;
  resolved: boolean;
  resolution?: string;
  provenance: string[];
}

// ============================================================
// GOAL MODEL (§6-7)
// ============================================================

export type GoalStatus =
  | 'PROPOSED'
  | 'ACTIVE'
  | 'PARTIALLY_SATISFIED'
  | 'SATISFIED'
  | 'BLOCKED'
  | 'CONTESTED'
  | 'ABANDONED'
  | 'SUPERSEDED'
  | 'UNKNOWN';

export interface Goal extends Timestamped {
  goalId: string;
  caseId: string;
  description: string;
  origin: 'HUMAN' | 'SYSTEM' | 'DECOMPOSED';
  parentGoalId?: string;
  priority: number;
  successCriteria: string[];
  failureCriteria: string[];
  dependencies: string[];
  constraints: string[];
  uncertainties: Uncertainty[];
  status: GoalStatus;
  version: number;
  provenance: string[];
}

export interface GoalDecomposition extends Timestamped {
  decompositionId: string;
  parentGoalId: string;
  subgoalIds: string[];
  method: string;
  assumptions: string[];
  evidence: string[];
  constraintsInherited: string[];
  constraintsAdded: string[];
  constraintsNotApplicable: Array<{ constraintId: string; justification: string }>;
  provenance: string[];
}

export interface GoalRevision extends Timestamped {
  revisionId: string;
  goalId: string;
  previousVersion: number;
  newVersion: number;
  changeType: 'MODIFIED' | 'SUPERSEDED' | 'ABANDONED';
  reason: string;
  evidence: string[];
  humanIntervention?: string;
  provenance: string[];
}

// ============================================================
// CONSTRAINT MODEL (§8-9)
// ============================================================

export interface WP5Constraint extends Timestamped {
  constraintId: string;
  caseId: string;
  type: ConstraintType;
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
// PLANNING OPERATORS (§10)
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
// PLAN MODEL (§11-12)
// ============================================================

export type PlanStatus =
  | 'CANDIDATE'
  | 'UNDER_EVALUATION'
  | 'ADMISSIBLE'
  | 'INADMISSIBLE'
  | 'SELECTED_FOR_SIMULATION'
  | 'AWAITING_HUMAN_REVIEW'
  | 'APPROVED_FOR_RESEARCH_SIMULATION'
  | 'ACTIVE_SIMULATION'
  | 'DEVIATED'
  | 'REPAIRING'
  | 'REPLANNING'
  | 'BLOCKED'
  | 'SAFE_STOPPED'
  | 'COMPLETED'
  | 'FAILED'
  | 'ABANDONED'
  | 'SUPERSEDED'
  | 'UNKNOWN';

export type OrderingRelation = 'BEFORE' | 'AFTER' | 'CONCURRENT_WITH' | 'INDEPENDENT_OF' | 'UNKNOWN';

export interface Plan extends Timestamped {
  planId: string;
  caseId: string;
  goalIds: string[];
  worldModelId?: string;
  worldStateId?: string;
  steps: PlanStep[];
  dependencies: PlanDependency[];
  branches: PlanBranch[];
  constraints: string[];
  lockedConstraints: string[];
  assumptions: string[];
  uncertainties: Uncertainty[];
  expectedEffects: string[];
  resources: Array<{ resource: string; allocated: number }>;
  cost?: number;
  risk: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  humanGates: string[];
  fallbacks: string[];
  validationStatus: 'VALID' | 'INVALID' | 'PENDING' | 'UNKNOWN';
  status: PlanStatus;
  version: number;
  parentPlanId?: string;
  provenance: string[];
}

export interface PlanStep extends Timestamped {
  stepId: string;
  planId: string;
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
  planId: string;
  fromStepId: string;
  toStepId: string;
  relation: OrderingRelation;
  constraints: string[];
}

export interface PlanBranch extends Timestamped {
  branchId: string;
  planId: string;
  condition: string;
  trigger: string;
  requiredObservation?: string;
  evidence: string[];
  uncertainties: Uncertainty[];
  constraints: string[];
  steps: PlanStep[];
  fallback: boolean;
  humanGate: boolean;
  version: number;
}

export interface PlanEvaluation extends Timestamped {
  evaluationId: string;
  planId: string;
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
  planId: string;
  alternativePlanId: string;
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
  planId: string;
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
  planId: string;
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
  planId: string;
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
  planId: string;
  selectedBy: 'HUMAN' | 'SYSTEM';
  selectorId: string;
  rationale: string;
  alternativesConsidered: string[];
  timestamp: string;
  provenance: string[];
}

export interface PlanExecutionTrace extends Timestamped {
  traceId: string;
  planId: string;
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
  planId: string;
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
  planId: string;
  stepId?: string;
  resource: string;
  required: number;
  available?: number;
  status: 'SATISFIED' | 'INSUFFICIENT' | 'UNKNOWN';
  provenance: string[];
}

export interface ResourceConflict extends Timestamped {
  conflictId: string;
  planId: string;
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
  planId: string;
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
  planId: string;
  chain: Array<{
    event: string;
    description: string;
    timestamp: string;
    evidence: string[];
  }>;
  summary: string;
  provenance: string[];
}
