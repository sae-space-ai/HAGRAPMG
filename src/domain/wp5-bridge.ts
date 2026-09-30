/**
 * HAG-RAP LAB — Evidence Graph Bridge
 * Adapter between canonical WP2-WP4 EvidenceGraphMemory and WP5 Planning Context.
 * 
 * ARCHITECTURE: Bounded Planning Context
 * WP5 reads canonical objects through this bridge.
 * WP5 does NOT mutate canonical state.
 * 
 * SCIENTIFIC STATUS: IMPLEMENTED
 */

import { EvidenceGraphMemory } from './evidence-graph.ts';
import { Goal, Constraint, Plan } from './types.ts';

/**
 * Evidence Graph Bridge
 * Provides read-only access to canonical WP2-WP4 objects for WP5 planning.
 */
export class EvidenceGraphBridge {
  private graph: EvidenceGraphMemory;

  constructor(graph: EvidenceGraphMemory) {
    this.graph = graph;
  }

  // ============================================================
  // GOALS (Canonical)
  // ============================================================

  getGoal(goalId: string): Goal | undefined {
    return this.graph.getGoal(goalId);
  }

  getAllGoals(): Goal[] {
    return this.graph.getAllGoals();
  }

  // ============================================================
  // CONSTRAINTS (Canonical)
  // ============================================================

  getConstraint(constraintId: string): Constraint | undefined {
    return this.graph.getConstraint(constraintId);
  }

  getAllConstraints(): Constraint[] {
    return this.graph.getAllConstraints();
  }

  // ============================================================
  // PLANS (Canonical)
  // ============================================================

  getPlan(planId: string): Plan | undefined {
    return this.graph.getPlan(planId);
  }

  getAllPlans(): Plan[] {
    return this.graph.getAllPlans();
  }

  // ============================================================
  // EVIDENCE & CLAIMS (Canonical)
  // ============================================================

  getEvidence(evidenceId: string) {
    return this.graph.getEvidence(evidenceId);
  }

  getAllEvidence() {
    return this.graph.getAllEvidence();
  }

  getClaim(claimId: string) {
    return this.graph.getClaim(claimId);
  }

  getAllClaims() {
    return this.graph.getAllClaims();
  }

  // ============================================================
  // WORLD MODELS (Canonical)
  // ============================================================

  getWorldModel(worldModelId: string) {
    return this.graph.getWorldModel(worldModelId);
  }

  getAllWorldModels() {
    return this.graph.getAllWorldModels();
  }

  // ============================================================
  // HUMAN INTERVENTIONS (Canonical)
  // ============================================================

  getAllInterventions() {
    return this.graph.getAllInterventions();
  }

  // ============================================================
  // CASE ISOLATION
  // ============================================================

  /**
   * Verify that an object belongs to the specified case.
   * Enforces case isolation invariant.
   */
  verifyCaseIsolation(objectCaseId: string | undefined, expectedCaseId: string): boolean {
    if (!objectCaseId) return false;
    return objectCaseId === expectedCaseId;
  }
}
