/**
 * HAG-RAP LAB — Evidence Graph Memory (§6)
 * The shared cognitive substrate. Typed and version-aware.
 * 
 * SCIENTIFIC STATUS: IMPLEMENTED
 */

import {
  EvidenceItem, Claim, Assumption, Contradiction, Inference,
  Source, CausalNode, CausalEdge, CausalHypothesis,
  Concept, AbstractionNode, AbstractionEdge, WorldModel,
  Plan, Goal, Constraint, HumanIntervention,
  ClaimStatus, EvidenceStatus, ConflictCause,
  JustificationGraph, JustificationNode, JustificationEdge,
  CognitiveStateSnapshot, ChangeRecord, ChangeDetail,
  createTimestamped, now, generateId
} from './types.ts';

// ============================================================
// EVIDENCE GRAPH MEMORY
// ============================================================

export interface GraphRelation {
  id: string;
  sourceId: string;
  targetId: string;
  relationType: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export class EvidenceGraphMemory {
  private sources: Map<string, Source> = new Map();
  private evidence: Map<string, EvidenceItem> = new Map();
  private claims: Map<string, Claim> = new Map();
  private assumptions: Map<string, Assumption> = new Map();
  private inferences: Map<string, Inference> = new Map();
  private contradictions: Map<string, Contradiction> = new Map();
  private causalNodes: Map<string, CausalNode> = new Map();
  private causalEdges: Map<string, CausalEdge> = new Map();
  private causalHypotheses: Map<string, CausalHypothesis> = new Map();
  private concepts: Map<string, Concept> = new Map();
  private abstractionNodes: Map<string, AbstractionNode> = new Map();
  private abstractionEdges: Map<string, AbstractionEdge> = new Map();
  private worldModels: Map<string, WorldModel> = new Map();
  private plans: Map<string, Plan> = new Map();
  private goals: Map<string, Goal> = new Map();
  private constraints: Map<string, Constraint> = new Map();
  private interventions: Map<string, HumanIntervention> = new Map();
  private relations: GraphRelation[] = [];
  private stateHistory: CognitiveStateSnapshot[] = [];
  private changeRecords: ChangeRecord[] = [];

  // ---- Sources ----
  addSource(source: Source): void {
    this.sources.set(source.id, source);
  }

  getSource(id: string): Source | undefined {
    return this.sources.get(id);
  }

  getAllSources(): Source[] {
    return Array.from(this.sources.values());
  }

  // ---- Evidence ----
  addEvidence(item: EvidenceItem): void {
    this.evidence.set(item.id, item);
    this.addRelation({
      id: generateId(),
      sourceId: item.sourceId,
      targetId: item.id,
      relationType: 'SOURCE_PROVIDES_EVIDENCE',
      createdAt: now()
    });
  }

  getEvidence(id: string): EvidenceItem | undefined {
    return this.evidence.get(id);
  }

  getAllEvidence(): EvidenceItem[] {
    return Array.from(this.evidence.values());
  }

  getEvidenceByTag(tag: string): EvidenceItem[] {
    return Array.from(this.evidence.values()).filter(e => e.tags.includes(tag));
  }

  // ---- Claims ----
  addClaim(claim: Claim): void {
    this.claims.set(claim.id, claim);
    // Link evidence to claim
    for (const evidenceId of claim.evidenceIds) {
      this.addRelation({
        id: generateId(),
        sourceId: evidenceId,
        targetId: claim.id,
        relationType: 'EVIDENCE_SUPPORTS_CLAIM',
        createdAt: now()
      });
    }
  }

  getClaim(id: string): Claim | undefined {
    return this.claims.get(id);
  }

  getAllClaims(): Claim[] {
    return Array.from(this.claims.values());
  }

  updateClaimStatus(id: string, status: ClaimStatus): void {
    const claim = this.claims.get(id);
    if (claim) {
      const oldStatus = claim.status;
      claim.status = status;
      claim.updatedAt = now();
      claim.version += 1;
      this.recordChange('Claim', id, 'status', oldStatus, status, 'Status update');
    }
  }

  supersedeClaim(oldId: string, newId: string, reason: string): void {
    const oldClaim = this.claims.get(oldId);
    const newClaim = this.claims.get(newId);
    if (oldClaim && newClaim) {
      oldClaim.status = 'SUPERSEDED';
      oldClaim.supersededBy = newId;
      oldClaim.updatedAt = now();
      newClaim.supersedes = oldId;
      this.addRelation({
        id: generateId(),
        sourceId: newId,
        targetId: oldId,
        relationType: 'SUPERSEDES',
        createdAt: now(),
        metadata: { reason }
      });
      this.recordChange('Claim', oldId, 'status', oldClaim.status, 'SUPERSEDED', reason);
    }
  }

  // ---- Assumptions ----
  addAssumption(assumption: Assumption): void {
    this.assumptions.set(assumption.id, assumption);
  }

  getAssumption(id: string): Assumption | undefined {
    return this.assumptions.get(id);
  }

  getAllAssumptions(): Assumption[] {
    return Array.from(this.assumptions.values());
  }

  challengeAssumption(id: string, challengeId: string): void {
    const assumption = this.assumptions.get(id);
    if (assumption) {
      if (!assumption.challengedBy) assumption.challengedBy = [];
      assumption.challengedBy.push(challengeId);
      assumption.updatedAt = now();
    }
  }

  // ---- Inferences ----
  addInference(inference: Inference): void {
    this.inferences.set(inference.id, inference);
    for (const inputId of inference.inputClaimIds) {
      this.addRelation({
        id: generateId(),
        sourceId: inputId,
        targetId: inference.id,
        relationType: 'CLAIM_USED_IN_INFERENCE',
        createdAt: now()
      });
    }
    this.addRelation({
      id: generateId(),
      sourceId: inference.id,
      targetId: inference.outputClaimId,
      relationType: 'INFERENCE_PRODUCES_CLAIM',
      createdAt: now()
    });
  }

  getInference(id: string): Inference | undefined {
    return this.inferences.get(id);
  }

  getAllInferences(): Inference[] {
    return Array.from(this.inferences.values());
  }

  // ---- Contradictions (§13) ----
  addContradiction(contradiction: Contradiction): void {
    this.contradictions.set(contradiction.id, contradiction);
    this.addRelation({
      id: generateId(),
      sourceId: contradiction.claimAId,
      targetId: contradiction.claimBId,
      relationType: 'CONTRADICTS',
      createdAt: now()
    });
  }

  getContradiction(id: string): Contradiction | undefined {
    return this.contradictions.get(id);
  }

  getAllContradictions(): Contradiction[] {
    return Array.from(this.contradictions.values());
  }

  getUnresolvedContradictions(): Contradiction[] {
    return Array.from(this.contradictions.values()).filter(c => !c.resolved);
  }

  resolveContradiction(id: string, resolution: string, classification: ConflictCause): void {
    const contradiction = this.contradictions.get(id);
    if (contradiction) {
      contradiction.resolved = true;
      contradiction.resolution = resolution;
      contradiction.classification = classification;
      contradiction.resolutionTimestamp = now();
      contradiction.updatedAt = now();
    }
  }

  // ---- Causal Model ----
  addCausalNode(node: CausalNode): void {
    this.causalNodes.set(node.id, node);
  }

  addCausalEdge(edge: CausalEdge): void {
    this.causalEdges.set(edge.id, edge);
    this.addRelation({
      id: generateId(),
      sourceId: edge.sourceNodeId,
      targetId: edge.targetNodeId,
      relationType: `CAUSAL_${edge.relationType}`,
      createdAt: now()
    });
  }

  addCausalHypothesis(hypothesis: CausalHypothesis): void {
    this.causalHypotheses.set(hypothesis.id, hypothesis);
  }

  getCausalNode(id: string): CausalNode | undefined {
    return this.causalNodes.get(id);
  }

  getAllCausalNodes(): CausalNode[] {
    return Array.from(this.causalNodes.values());
  }

  getAllCausalEdges(): CausalEdge[] {
    return Array.from(this.causalEdges.values());
  }

  getAllCausalHypotheses(): CausalHypothesis[] {
    return Array.from(this.causalHypotheses.values());
  }

  // ---- Abstraction ----
  addConcept(concept: Concept): void {
    this.concepts.set(concept.id, concept);
  }

  getConcept(id: string): Concept | undefined {
    return this.concepts.get(id);
  }

  getAllConcepts(): Concept[] {
    return Array.from(this.concepts.values());
  }

  addAbstractionNode(node: AbstractionNode): void {
    this.abstractionNodes.set(node.id, node);
  }

  addAbstractionEdge(edge: AbstractionEdge): void {
    this.abstractionEdges.set(edge.id, edge);
  }

  getAllAbstractionNodes(): AbstractionNode[] {
    return Array.from(this.abstractionNodes.values());
  }

  // ---- World Model ----
  addWorldModel(model: WorldModel): void {
    this.worldModels.set(model.id, model);
  }

  getWorldModel(id: string): WorldModel | undefined {
    return this.worldModels.get(id);
  }

  getAllWorldModels(): WorldModel[] {
    return Array.from(this.worldModels.values());
  }

  // ---- Planning ----
  addPlan(plan: Plan): void {
    this.plans.set(plan.id, plan);
  }

  getPlan(id: string): Plan | undefined {
    return this.plans.get(id);
  }

  getAllPlans(): Plan[] {
    return Array.from(this.plans.values());
  }

  addGoal(goal: Goal): void {
    this.goals.set(goal.id, goal);
  }

  getGoal(id: string): Goal | undefined {
    return this.goals.get(id);
  }

  getAllGoals(): Goal[] {
    return Array.from(this.goals.values());
  }

  addConstraint(constraint: Constraint): void {
    this.constraints.set(constraint.id, constraint);
  }

  getConstraint(id: string): Constraint | undefined {
    return this.constraints.get(id);
  }

  getAllConstraints(): Constraint[] {
    return Array.from(this.constraints.values());
  }

  // ---- Human Interventions ----
  addIntervention(intervention: HumanIntervention): void {
    this.interventions.set(intervention.id, intervention);
    this.addRelation({
      id: generateId(),
      sourceId: intervention.actorId,
      targetId: intervention.targetId,
      relationType: `HUMAN_${intervention.type}`,
      createdAt: now()
    });
  }

  getAllInterventions(): HumanIntervention[] {
    return Array.from(this.interventions.values());
  }

  // ---- Relations ----
  private addRelation(relation: GraphRelation): void {
    this.relations.push(relation);
  }

  getRelations(): GraphRelation[] {
    return [...this.relations];
  }

  getRelationsFor(entityId: string): GraphRelation[] {
    return this.relations.filter(
      r => r.sourceId === entityId || r.targetId === entityId
    );
  }

  // ---- State Snapshots (§8) ----
  takeSnapshot(trigger: string): CognitiveStateSnapshot {
    const snapshot: CognitiveStateSnapshot = {
      ...createTimestamped(),
      claimStates: Object.fromEntries(
        Array.from(this.claims.entries()).map(([id, c]) => [id, c.status])
      ),
      evidenceStates: Object.fromEntries(
        Array.from(this.evidence.entries()).map(([id, e]) => [id, e.status])
      ),
      activeContradictions: this.getUnresolvedContradictions().map(c => c.id),
      humanInterventions: Array.from(this.interventions.keys()),
    };
    this.stateHistory.push(snapshot);
    return snapshot;
  }

  getStateHistory(): CognitiveStateSnapshot[] {
    return [...this.stateHistory];
  }

  // ---- Change Records ----
  private recordChange(
    entityType: string, entityId: string, field: string,
    oldValue: unknown, newValue: unknown, reason: string
  ): void {
    const detail: ChangeDetail = {
      entityType, entityId, field, oldValue, newValue, reason
    };
    const record: ChangeRecord = {
      ...createTimestamped(),
      fromSnapshotId: '',
      toSnapshotId: '',
      changes: [detail],
      trigger: reason
    };
    this.changeRecords.push(record);
  }

  getChangeRecords(): ChangeRecord[] {
    return [...this.changeRecords];
  }

  // ---- WHY Query (§7, 15) ----
  why(conclusionId: string): JustificationGraph {
    const nodes: JustificationNode[] = [];
    const edges: JustificationEdge[] = [];
    const visited = new Set<string>();

    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      // Check if it's a claim
      const claim = this.claims.get(id);
      if (claim) {
        nodes.push({
          id: claim.id,
          type: 'CLAIM',
          content: claim.content,
          status: claim.status
        });

        // Trace evidence
        for (const evidenceId of claim.evidenceIds) {
          const ev = this.evidence.get(evidenceId);
          if (ev) {
            nodes.push({
              id: ev.id,
              type: 'EVIDENCE',
              content: ev.content,
              status: ev.status
            });
            edges.push({
              sourceId: ev.id,
              targetId: claim.id,
              relation: 'SUPPORTS'
            });
            traverse(evidenceId);
          }
        }

        // Trace assumptions
        for (const assumptionId of claim.assumptionIds) {
          const assumption = this.assumptions.get(assumptionId);
          if (assumption) {
            nodes.push({
              id: assumption.id,
              type: 'ASSUMPTION',
              content: assumption.content,
              status: assumption.status
            });
            edges.push({
              sourceId: assumption.id,
              targetId: claim.id,
              relation: 'ASSUMED_FOR'
            });
          }
        }

        // Trace inferences
        for (const infId of claim.inferenceIds) {
          const inf = this.inferences.get(infId);
          if (inf) {
            nodes.push({
              id: inf.id,
              type: 'INFERENCE',
              content: `${inf.family}: ${inf.method}`,
              status: inf.verificationStatus
            });
            edges.push({
              sourceId: inf.id,
              targetId: claim.id,
              relation: 'DERIVED_BY'
            });
            // Trace inference inputs
            for (const inputId of inf.inputClaimIds) {
              edges.push({
                sourceId: inputId,
                targetId: inf.id,
                relation: 'INPUT_TO'
              });
              traverse(inputId);
            }
          }
        }
      }

      // Check if it's evidence
      const evidence = this.evidence.get(id);
      if (evidence) {
        nodes.push({
          id: evidence.id,
          type: 'EVIDENCE',
          content: evidence.content,
          status: evidence.status
        });
        const source = this.sources.get(evidence.sourceId);
        if (source) {
          nodes.push({
            id: source.id,
            type: 'EVIDENCE',
            content: `Source: ${source.name}`,
            status: source.status
          });
          edges.push({
            sourceId: source.id,
            targetId: evidence.id,
            relation: 'PROVIDED_BY'
          });
        }
      }
    };

    traverse(conclusionId);

    const hasContradictions = this.getUnresolvedContradictions().some(
      c => c.claimAId === conclusionId || c.claimBId === conclusionId
    );

    const hasUnresolvedUncertainty = nodes.some(n => 
      n.status === 'UNKNOWN' || n.status === 'CONTESTED'
    );

    return {
      conclusionId,
      nodes,
      edges,
      completeness: nodes.length > 0 ? Math.min(1, nodes.filter(n => n.status !== 'UNKNOWN').length / nodes.length) : 0,
      hasContradictions,
      hasUnresolvedUncertainty
    };
  }

  // ---- WHAT_CHANGED Query (§8) ----
  whatChanged(snapshotAId: string, snapshotBId: string): ChangeDetail[] {
    const snapA = this.stateHistory.find(s => s.id === snapshotAId);
    const snapB = this.stateHistory.find(s => s.id === snapshotBId);
    if (!snapA || !snapB) return [];

    const changes: ChangeDetail[] = [];

    // Compare claim states
    for (const [claimId, newStatus] of Object.entries(snapB.claimStates)) {
      const oldStatus = snapA.claimStates[claimId];
      if (oldStatus !== newStatus) {
        changes.push({
          entityType: 'Claim',
          entityId: claimId,
          field: 'status',
          oldValue: oldStatus || 'NOT_PRESENT',
          newValue: newStatus,
          reason: 'State evolution'
        });
      }
    }

    // Check for new contradictions
    for (const cId of snapB.activeContradictions) {
      if (!snapA.activeContradictions.includes(cId)) {
        changes.push({
          entityType: 'Contradiction',
          entityId: cId,
          field: 'active',
          oldValue: false,
          newValue: true,
          reason: 'New contradiction detected'
        });
      }
    }

    return changes;
  }

  // ---- Statistics ----
  getStats() {
    return {
      sources: this.sources.size,
      evidence: this.evidence.size,
      claims: this.claims.size,
      assumptions: this.assumptions.size,
      inferences: this.inferences.size,
      contradictions: this.contradictions.size,
      unresolvedContradictions: this.getUnresolvedContradictions().length,
      causalNodes: this.causalNodes.size,
      causalEdges: this.causalEdges.size,
      concepts: this.concepts.size,
      worldModels: this.worldModels.size,
      plans: this.plans.size,
      goals: this.goals.size,
      constraints: this.constraints.size,
      interventions: this.interventions.size,
      relations: this.relations.length,
      stateSnapshots: this.stateHistory.length,
      changeRecords: this.changeRecords.length,
    };
  }
}
