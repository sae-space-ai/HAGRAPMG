/**
 * HAG-RAP LAB — WP5 Planning Repository
 * Dedicated repository for WP5 planning state.
 * Does NOT pollute EvidenceGraphMemory.
 * 
 * ARCHITECTURE: Bounded Planning Context
 * 
 * SCIENTIFIC STATUS: IMPLEMENTED
 */

import {
  PlanningGoal, GoalDecomposition, GoalRevision,
  PlanningConstraint, PlanningOperator,
  PlanningPlan, PlanEvaluation, PlanAlternative,
  Deviation, PlanRepair, PlanRevision,
  ResourceRequirement, ResourceConflict, ResourceBudget,
  AgentDeclaration, MultiagentCommitment,
  WP5PlanCard, PlanHistoryEntry, WhatChangedTrace
} from './wp5-types.ts';
import { createTimestamped, generateId } from './types.ts';

/**
 * WP5 Planning Repository
 * Manages all WP5-specific planning state.
 * References canonical WP2-WP4 objects through stable IDs.
 */
export class WP5PlanningRepository {
  // Goals
  private planningGoals: Map<string, PlanningGoal> = new Map();
  private goalDecompositions: Map<string, GoalDecomposition> = new Map();
  private goalRevisions: Map<string, GoalRevision> = new Map();
  
  // Constraints
  private planningConstraints: Map<string, PlanningConstraint> = new Map();
  
  // Operators
  private planningOperators: Map<string, PlanningOperator> = new Map();
  
  // Plans
  private planningPlans: Map<string, PlanningPlan> = new Map();
  private planEvaluations: Map<string, PlanEvaluation> = new Map();
  private planAlternatives: Map<string, PlanAlternative> = new Map();
  private planRevisions: Map<string, PlanRevision> = new Map();
  private planHistory: Map<string, PlanHistoryEntry> = new Map();
  private whatChangedTraces: Map<string, WhatChangedTrace> = new Map();
  
  // Deviations & Repairs
  private deviations: Map<string, Deviation> = new Map();
  private planRepairs: Map<string, PlanRepair> = new Map();
  
  // Resources
  private resourceRequirements: Map<string, ResourceRequirement> = new Map();
  private resourceConflicts: Map<string, ResourceConflict> = new Map();
  private resourceBudgets: Map<string, ResourceBudget> = new Map();
  
  // Multiagent
  private agentDeclarations: Map<string, AgentDeclaration> = new Map();
  private multiagentCommitments: Map<string, MultiagentCommitment> = new Map();
  
  // Model Card
  private planCards: Map<string, WP5PlanCard> = new Map();

  // ============================================================
  // GOALS
  // ============================================================

  addPlanningGoal(goal: PlanningGoal): void {
    this.planningGoals.set(goal.planningGoalId, goal);
  }

  getPlanningGoal(id: string): PlanningGoal | undefined {
    return this.planningGoals.get(id);
  }

  getAllPlanningGoals(): PlanningGoal[] {
    return Array.from(this.planningGoals.values());
  }

  getPlanningGoalsByCase(caseId: string): PlanningGoal[] {
    return Array.from(this.planningGoals.values()).filter(g => g.caseId === caseId);
  }

  updatePlanningGoal(goal: PlanningGoal): void {
    this.planningGoals.set(goal.planningGoalId, goal);
  }

  addGoalDecomposition(decomposition: GoalDecomposition): void {
    this.goalDecompositions.set(decomposition.decompositionId, decomposition);
  }

  getGoalDecomposition(id: string): GoalDecomposition | undefined {
    return this.goalDecompositions.get(id);
  }

  getAllGoalDecompositions(): GoalDecomposition[] {
    return Array.from(this.goalDecompositions.values());
  }

  addGoalRevision(revision: GoalRevision): void {
    this.goalRevisions.set(revision.revisionId, revision);
  }

  getGoalRevision(id: string): GoalRevision | undefined {
    return this.goalRevisions.get(id);
  }

  getAllGoalRevisions(): GoalRevision[] {
    return Array.from(this.goalRevisions.values());
  }

  // ============================================================
  // CONSTRAINTS
  // ============================================================

  addPlanningConstraint(constraint: PlanningConstraint): void {
    this.planningConstraints.set(constraint.planningConstraintId, constraint);
  }

  getPlanningConstraint(id: string): PlanningConstraint | undefined {
    return this.planningConstraints.get(id);
  }

  getAllPlanningConstraints(): PlanningConstraint[] {
    return Array.from(this.planningConstraints.values());
  }

  getPlanningConstraintsByCase(caseId: string): PlanningConstraint[] {
    return Array.from(this.planningConstraints.values()).filter(c => c.caseId === caseId);
  }

  updatePlanningConstraint(constraint: PlanningConstraint): void {
    this.planningConstraints.set(constraint.planningConstraintId, constraint);
  }

  // ============================================================
  // OPERATORS
  // ============================================================

  addPlanningOperator(operator: PlanningOperator): void {
    this.planningOperators.set(operator.operatorId, operator);
  }

  getPlanningOperator(id: string): PlanningOperator | undefined {
    return this.planningOperators.get(id);
  }

  getAllPlanningOperators(): PlanningOperator[] {
    return Array.from(this.planningOperators.values());
  }

  // ============================================================
  // PLANS
  // ============================================================

  addPlanningPlan(plan: PlanningPlan): void {
    this.planningPlans.set(plan.planningPlanId, plan);
  }

  getPlanningPlan(id: string): PlanningPlan | undefined {
    return this.planningPlans.get(id);
  }

  getAllPlanningPlans(): PlanningPlan[] {
    return Array.from(this.planningPlans.values());
  }

  getPlanningPlansByCase(caseId: string): PlanningPlan[] {
    return Array.from(this.planningPlans.values()).filter(p => p.caseId === caseId);
  }

  updatePlanningPlan(plan: PlanningPlan): void {
    this.planningPlans.set(plan.planningPlanId, plan);
  }

  addPlanEvaluation(evaluation: PlanEvaluation): void {
    this.planEvaluations.set(evaluation.evaluationId, evaluation);
  }

  getPlanEvaluation(id: string): PlanEvaluation | undefined {
    return this.planEvaluations.get(id);
  }

  getAllPlanEvaluations(): PlanEvaluation[] {
    return Array.from(this.planEvaluations.values());
  }

  addPlanAlternative(alternative: PlanAlternative): void {
    this.planAlternatives.set(alternative.alternativeId, alternative);
  }

  getPlanAlternative(id: string): PlanAlternative | undefined {
    return this.planAlternatives.get(id);
  }

  getAllPlanAlternatives(): PlanAlternative[] {
    return Array.from(this.planAlternatives.values());
  }

  addPlanRevision(revision: PlanRevision): void {
    this.planRevisions.set(revision.revisionId, revision);
  }

  getPlanRevision(id: string): PlanRevision | undefined {
    return this.planRevisions.get(id);
  }

  getAllPlanRevisions(): PlanRevision[] {
    return Array.from(this.planRevisions.values());
  }

  addPlanHistoryEntry(entry: PlanHistoryEntry): void {
    this.planHistory.set(entry.entryId, entry);
  }

  getPlanHistoryEntry(id: string): PlanHistoryEntry | undefined {
    return this.planHistory.get(id);
  }

  getAllPlanHistoryEntries(): PlanHistoryEntry[] {
    return Array.from(this.planHistory.values());
  }

  getPlanHistoryByPlan(planningPlanId: string): PlanHistoryEntry[] {
    return Array.from(this.planHistory.values()).filter(e => e.planningPlanId === planningPlanId);
  }

  addWhatChangedTrace(trace: WhatChangedTrace): void {
    this.whatChangedTraces.set(trace.traceId, trace);
  }

  getWhatChangedTrace(id: string): WhatChangedTrace | undefined {
    return this.whatChangedTraces.get(id);
  }

  getAllWhatChangedTraces(): WhatChangedTrace[] {
    return Array.from(this.whatChangedTraces.values());
  }

  // ============================================================
  // DEVIATIONS & REPAIRS
  // ============================================================

  addDeviation(deviation: Deviation): void {
    this.deviations.set(deviation.deviationId, deviation);
  }

  getDeviation(id: string): Deviation | undefined {
    return this.deviations.get(id);
  }

  getAllDeviations(): Deviation[] {
    return Array.from(this.deviations.values());
  }

  addPlanRepair(repair: PlanRepair): void {
    this.planRepairs.set(repair.repairId, repair);
  }

  getPlanRepair(id: string): PlanRepair | undefined {
    return this.planRepairs.get(id);
  }

  getAllPlanRepairs(): PlanRepair[] {
    return Array.from(this.planRepairs.values());
  }

  // ============================================================
  // RESOURCES
  // ============================================================

  addResourceRequirement(requirement: ResourceRequirement): void {
    this.resourceRequirements.set(requirement.requirementId, requirement);
  }

  getResourceRequirement(id: string): ResourceRequirement | undefined {
    return this.resourceRequirements.get(id);
  }

  getAllResourceRequirements(): ResourceRequirement[] {
    return Array.from(this.resourceRequirements.values());
  }

  addResourceConflict(conflict: ResourceConflict): void {
    this.resourceConflicts.set(conflict.conflictId, conflict);
  }

  getResourceConflict(id: string): ResourceConflict | undefined {
    return this.resourceConflicts.get(id);
  }

  getAllResourceConflicts(): ResourceConflict[] {
    return Array.from(this.resourceConflicts.values());
  }

  addResourceBudget(budget: ResourceBudget): void {
    this.resourceBudgets.set(budget.budgetId, budget);
  }

  getResourceBudget(id: string): ResourceBudget | undefined {
    return this.resourceBudgets.get(id);
  }

  getAllResourceBudgets(): ResourceBudget[] {
    return Array.from(this.resourceBudgets.values());
  }

  // ============================================================
  // MULTIAGENT
  // ============================================================

  addAgentDeclaration(agent: AgentDeclaration): void {
    this.agentDeclarations.set(agent.agentId, agent);
  }

  getAgentDeclaration(id: string): AgentDeclaration | undefined {
    return this.agentDeclarations.get(id);
  }

  getAllAgentDeclarations(): AgentDeclaration[] {
    return Array.from(this.agentDeclarations.values());
  }

  addMultiagentCommitment(commitment: MultiagentCommitment): void {
    this.multiagentCommitments.set(commitment.commitmentId, commitment);
  }

  getMultiagentCommitment(id: string): MultiagentCommitment | undefined {
    return this.multiagentCommitments.get(id);
  }

  getAllMultiagentCommitments(): MultiagentCommitment[] {
    return Array.from(this.multiagentCommitments.values());
  }

  // ============================================================
  // MODEL CARD
  // ============================================================

  addPlanCard(card: WP5PlanCard): void {
    this.planCards.set(card.cardId, card);
  }

  getPlanCard(id: string): WP5PlanCard | undefined {
    return this.planCards.get(id);
  }

  getAllPlanCards(): WP5PlanCard[] {
    return Array.from(this.planCards.values());
  }

  // ============================================================
  // CLEAR
  // ============================================================

  clear(): void {
    this.planningGoals.clear();
    this.goalDecompositions.clear();
    this.goalRevisions.clear();
    this.planningConstraints.clear();
    this.planningOperators.clear();
    this.planningPlans.clear();
    this.planEvaluations.clear();
    this.planAlternatives.clear();
    this.planRevisions.clear();
    this.planHistory.clear();
    this.whatChangedTraces.clear();
    this.deviations.clear();
    this.planRepairs.clear();
    this.resourceRequirements.clear();
    this.resourceConflicts.clear();
    this.resourceBudgets.clear();
    this.agentDeclarations.clear();
    this.multiagentCommitments.clear();
    this.planCards.clear();
  }

  // ============================================================
  // STATISTICS
  // ============================================================

  getStats() {
    return {
      planningGoals: this.planningGoals.size,
      goalDecompositions: this.goalDecompositions.size,
      goalRevisions: this.goalRevisions.size,
      planningConstraints: this.planningConstraints.size,
      planningOperators: this.planningOperators.size,
      planningPlans: this.planningPlans.size,
      planEvaluations: this.planEvaluations.size,
      planAlternatives: this.planAlternatives.size,
      planRevisions: this.planRevisions.size,
      planHistory: this.planHistory.size,
      whatChangedTraces: this.whatChangedTraces.size,
      deviations: this.deviations.size,
      planRepairs: this.planRepairs.size,
      resourceRequirements: this.resourceRequirements.size,
      resourceConflicts: this.resourceConflicts.size,
      resourceBudgets: this.resourceBudgets.size,
      agentDeclarations: this.agentDeclarations.size,
      multiagentCommitments: this.multiagentCommitments.size,
      planCards: this.planCards.size,
    };
  }
}
