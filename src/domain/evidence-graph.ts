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
  Uncertainty,
  // WP3 entities
  CausalVariable, CausalRelation, CausalModel,
  ProofTrace, ExplanationGraph,
  EvidenceSufficiencyAssessment, EvidenceConflict,
  ReasoningSession, ReasoningReview, CalibrationRecord,
  BenchmarkCase, BenchmarkRun, AblationConfiguration,
  // WP4 entities
  ConceptCandidate, ConceptCounterexample, ConceptRevision,
  WP4AbstractionNode, WP4AbstractionEdge, AbstractionLattice, AbstractionOperation,
  WP4ApplicabilityEnvelope,
  AnalogicalMapping, AnalogicalCorrespondence, AnalogicalPrediction, AnalogyValidation,
  WP4WorldObject, WorldAgent, WorldResource, WorldConstraint, WorldEvent,
  WP4WorldState, WP4StateVariable, TransitionMechanism,
  WorldModelPrediction, ModelDisagreement, OODAssessment,
  TransferExperiment, TransferResult,
  WP4ModelCard,
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
  
  // WP3 entities
  private causalVariables: Map<string, CausalVariable> = new Map();
  private causalRelations: Map<string, CausalRelation> = new Map();
  private causalModels: Map<string, CausalModel> = new Map();
  private proofTraces: Map<string, ProofTrace> = new Map();
  private explanationGraphs: Map<string, ExplanationGraph> = new Map();
  private sufficiencyAssessments: Map<string, EvidenceSufficiencyAssessment> = new Map();
  private evidenceConflicts: Map<string, EvidenceConflict> = new Map();
  private reasoningSessions: Map<string, ReasoningSession> = new Map();
  private reasoningReviews: Map<string, ReasoningReview> = new Map();
  private calibrationRecords: Map<string, CalibrationRecord> = new Map();
  private benchmarkCases: Map<string, BenchmarkCase> = new Map();
  private benchmarkRuns: Map<string, BenchmarkRun> = new Map();
  private ablationConfigurations: Map<string, AblationConfiguration> = new Map();
  
  // WP4 entities
  private conceptCandidates: Map<string, ConceptCandidate> = new Map();
  private conceptCounterexamples: Map<string, ConceptCounterexample> = new Map();
  private conceptRevisions: Map<string, ConceptRevision> = new Map();
  private wp4AbstractionNodes: Map<string, WP4AbstractionNode> = new Map();
  private wp4AbstractionEdges: Map<string, WP4AbstractionEdge> = new Map();
  private abstractionLattices: Map<string, AbstractionLattice> = new Map();
  private abstractionOperations: Map<string, AbstractionOperation> = new Map();
  private wp4ApplicabilityEnvelopes: Map<string, WP4ApplicabilityEnvelope> = new Map();
  private analogicalMappings: Map<string, AnalogicalMapping> = new Map();
  private analogicalCorrespondences: Map<string, AnalogicalCorrespondence> = new Map();
  private analogicalPredictions: Map<string, AnalogicalPrediction> = new Map();
  private analogyValidations: Map<string, AnalogyValidation> = new Map();
  private wp4WorldObjects: Map<string, WP4WorldObject> = new Map();
  private worldAgents: Map<string, WorldAgent> = new Map();
  private worldResources: Map<string, WorldResource> = new Map();
  private worldConstraints: Map<string, WorldConstraint> = new Map();
  private worldEvents: Map<string, WorldEvent> = new Map();
  private wp4WorldStates: Map<string, WP4WorldState> = new Map();
  private wp4StateVariables: Map<string, WP4StateVariable> = new Map();
  private transitionMechanisms: Map<string, TransitionMechanism> = new Map();
  private worldModelPredictions: Map<string, WorldModelPrediction> = new Map();
  private modelDisagreements: Map<string, ModelDisagreement> = new Map();
  private oodAssessments: Map<string, OODAssessment> = new Map();
  private transferExperiments: Map<string, TransferExperiment> = new Map();
  private transferResults: Map<string, TransferResult> = new Map();
  private wp4ModelCards: Map<string, WP4ModelCard> = new Map();
  
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

  // ---- Unknowns / Readiness (§7, §58) ----
  getUnknowns(): {
    unknownClaims: Claim[];
    missingEvidence: EvidenceItem[];
    contestedClaims: Claim[];
    unresolvedContradictions: Contradiction[];
    unverifiedAssumptions: Assumption[];
    openUncertainties: Array<{ entityId: string; entityType: string; uncertainty: Uncertainty }>;
  } {
    const unknownClaims = Array.from(this.claims.values()).filter(c => c.status === 'UNKNOWN');
    const missingEvidence = Array.from(this.evidence.values()).filter(e => e.status === 'MISSING');
    const contestedClaims = Array.from(this.claims.values()).filter(c => c.status === 'CONTESTED');
    const unresolvedContradictions = this.getUnresolvedContradictions();
    const unverifiedAssumptions = Array.from(this.assumptions.values()).filter(a => a.status === 'ASSUMED' || a.status === 'UNKNOWN');
    
    const openUncertainties: Array<{ entityId: string; entityType: string; uncertainty: Uncertainty }> = [];
    for (const claim of this.claims.values()) {
      for (const u of claim.uncertainty) {
        openUncertainties.push({ entityId: claim.id, entityType: 'Claim', uncertainty: u });
      }
    }
    for (const ev of this.evidence.values()) {
      if (ev.confidence !== undefined && ev.confidence < 1.0) {
        openUncertainties.push({ 
          entityId: ev.id, entityType: 'Evidence', 
          uncertainty: { type: 'EPISTEMIC', description: `Confidence: ${ev.confidence}` }
        });
      }
    }

    return { unknownClaims, missingEvidence, contestedClaims, unresolvedContradictions, unverifiedAssumptions, openUncertainties };
  }

  getReadiness(): {
    status: 'NOT_READY' | 'READY_FOR_REASONING' | 'READY_FOR_REVIEW' | 'READY_FOR_EXECUTION';
    blockers: string[];
    warnings: string[];
  } {
    const unknowns = this.getUnknowns();
    const blockers: string[] = [];
    const warnings: string[] = [];

    if (unknowns.missingEvidence.length > 0) {
      blockers.push(`Missing evidence: ${unknowns.missingEvidence.length} items`);
    }
    if (unknowns.unresolvedContradictions.length > 0) {
      blockers.push(`Unresolved contradictions: ${unknowns.unresolvedContradictions.length}`);
    }
    if (unknowns.contestedClaims.length > 0) {
      warnings.push(`Contested claims: ${unknowns.contestedClaims.length}`);
    }
    if (unknowns.openUncertainties.length > 0) {
      warnings.push(`Open uncertainties: ${unknowns.openUncertainties.length}`);
    }
    if (this.claims.size === 0) {
      blockers.push('No claims in graph');
    }
    if (this.evidence.size === 0) {
      blockers.push('No evidence in graph');
    }

    let status: 'NOT_READY' | 'READY_FOR_REASONING' | 'READY_FOR_REVIEW' | 'READY_FOR_EXECUTION' = 'NOT_READY';
    if (blockers.length === 0 && warnings.length === 0) {
      status = 'READY_FOR_EXECUTION';
    } else if (blockers.length === 0) {
      status = 'READY_FOR_REVIEW';
    } else if (unknowns.missingEvidence.length === 0 && unknowns.unresolvedContradictions.length === 0) {
      status = 'READY_FOR_REASONING';
    }

    return { status, blockers, warnings };
  }

  // ---- Import / Export (§9) ----
  exportGraph(): {
    schemaVersion: string;
    exportedAt: string;
    sources: Source[];
    evidence: EvidenceItem[];
    claims: Claim[];
    assumptions: Assumption[];
    inferences: Inference[];
    contradictions: Contradiction[];
    interventions: HumanIntervention[];
    relations: GraphRelation[];
    stateHistory: CognitiveStateSnapshot[];
    changeRecords: ChangeRecord[];
  } {
    return {
      schemaVersion: '1.0.0',
      exportedAt: now(),
      sources: Array.from(this.sources.values()),
      evidence: Array.from(this.evidence.values()),
      claims: Array.from(this.claims.values()),
      assumptions: Array.from(this.assumptions.values()),
      inferences: Array.from(this.inferences.values()),
      contradictions: Array.from(this.contradictions.values()),
      interventions: Array.from(this.interventions.values()),
      relations: [...this.relations],
      stateHistory: [...this.stateHistory],
      changeRecords: [...this.changeRecords],
    };
  }

  importGraph(data: unknown): { success: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
      return { success: false, errors: ['Import data must be an object'] };
    }

    const d = data as Record<string, unknown>;

    if (!d.schemaVersion || typeof d.schemaVersion !== 'string') {
      return { success: false, errors: ['Missing or invalid schemaVersion'] };
    }

    if (!Array.isArray(d.sources) || !Array.isArray(d.evidence) || !Array.isArray(d.claims)) {
      return { success: false, errors: ['Missing required arrays: sources, evidence, claims'] };
    }

    // Validate each entity has required fields
    for (const s of d.sources as Array<Record<string, unknown>>) {
      if (!s.id || !s.name) errors.push(`Invalid source: missing id or name`);
    }
    for (const e of d.evidence as Array<Record<string, unknown>>) {
      if (!e.id || !e.sourceId || !e.content) errors.push(`Invalid evidence: missing required fields`);
    }
    for (const c of d.claims as Array<Record<string, unknown>>) {
      if (!c.id || !c.content || !c.status) errors.push(`Invalid claim: missing required fields`);
      if (c.status && !['OBSERVED', 'INFERRED', 'ASSUMED', 'CONTESTED', 'SUPERSEDED', 'UNKNOWN'].includes(c.status as string)) {
        errors.push(`Invalid claim status: ${c.status}`);
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    // Clear and import
    this.sources.clear();
    this.evidence.clear();
    this.claims.clear();
    this.assumptions.clear();
    this.inferences.clear();
    this.contradictions.clear();
    this.interventions.clear();
    this.relations = [];
    this.stateHistory = [];
    this.changeRecords = [];

    for (const s of d.sources as Source[]) this.sources.set(s.id, s);
    for (const e of d.evidence as EvidenceItem[]) this.evidence.set(e.id, e);
    for (const c of d.claims as Claim[]) this.claims.set(c.id, c);
    if (Array.isArray(d.assumptions)) for (const a of d.assumptions as Assumption[]) this.assumptions.set(a.id, a);
    if (Array.isArray(d.inferences)) for (const i of d.inferences as Inference[]) this.inferences.set(i.id, i);
    if (Array.isArray(d.contradictions)) for (const c of d.contradictions as Contradiction[]) this.contradictions.set(c.id, c);
    if (Array.isArray(d.interventions)) for (const i of d.interventions as HumanIntervention[]) this.interventions.set(i.id, i);
    if (Array.isArray(d.relations)) this.relations = d.relations as GraphRelation[];
    if (Array.isArray(d.stateHistory)) this.stateHistory = d.stateHistory as CognitiveStateSnapshot[];
    if (Array.isArray(d.changeRecords)) this.changeRecords = d.changeRecords as ChangeRecord[];

    return { success: true, errors: [] };
  }

  // ---- WP3 Entity Management ----
  
  // Causal Variables
  addCausalVariable(variable: CausalVariable): void {
    this.causalVariables.set(variable.id, variable);
  }
  
  getCausalVariable(id: string): CausalVariable | undefined {
    return this.causalVariables.get(id);
  }
  
  getAllCausalVariables(): CausalVariable[] {
    return Array.from(this.causalVariables.values());
  }
  
  // Causal Relations
  addCausalRelation(relation: CausalRelation): void {
    this.causalRelations.set(relation.id, relation);
  }
  
  getCausalRelation(id: string): CausalRelation | undefined {
    return this.causalRelations.get(id);
  }
  
  getAllCausalRelations(): CausalRelation[] {
    return Array.from(this.causalRelations.values());
  }
  
  // Causal Models
  addCausalModel(model: CausalModel): void {
    this.causalModels.set(model.id, model);
  }
  
  getCausalModel(id: string): CausalModel | undefined {
    return this.causalModels.get(id);
  }
  
  getAllCausalModels(): CausalModel[] {
    return Array.from(this.causalModels.values());
  }
  
  // Proof Traces
  addProofTrace(trace: ProofTrace): void {
    this.proofTraces.set(trace.id, trace);
  }
  
  getProofTrace(id: string): ProofTrace | undefined {
    return this.proofTraces.get(id);
  }
  
  getAllProofTraces(): ProofTrace[] {
    return Array.from(this.proofTraces.values());
  }
  
  getProofTraceForClaim(claimId: string): ProofTrace | undefined {
    return Array.from(this.proofTraces.values()).find(pt => pt.conclusionClaimId === claimId);
  }
  
  // Explanation Graphs
  addExplanationGraph(graph: ExplanationGraph): void {
    this.explanationGraphs.set(graph.id, graph);
  }
  
  getExplanationGraph(id: string): ExplanationGraph | undefined {
    return this.explanationGraphs.get(id);
  }
  
  getAllExplanationGraphs(): ExplanationGraph[] {
    return Array.from(this.explanationGraphs.values());
  }
  
  // Sufficiency Assessments
  addSufficiencyAssessment(assessment: EvidenceSufficiencyAssessment): void {
    this.sufficiencyAssessments.set(assessment.id, assessment);
  }
  
  getSufficiencyAssessment(id: string): EvidenceSufficiencyAssessment | undefined {
    return this.sufficiencyAssessments.get(id);
  }
  
  getAllSufficiencyAssessments(): EvidenceSufficiencyAssessment[] {
    return Array.from(this.sufficiencyAssessments.values());
  }
  
  // Evidence Conflicts
  addEvidenceConflict(conflict: EvidenceConflict): void {
    this.evidenceConflicts.set(conflict.id, conflict);
  }
  
  getEvidenceConflict(id: string): EvidenceConflict | undefined {
    return this.evidenceConflicts.get(id);
  }
  
  getAllEvidenceConflicts(): EvidenceConflict[] {
    return Array.from(this.evidenceConflicts.values());
  }
  
  // Reasoning Sessions
  addReasoningSession(session: ReasoningSession): void {
    this.reasoningSessions.set(session.id, session);
  }
  
  getReasoningSession(id: string): ReasoningSession | undefined {
    return this.reasoningSessions.get(id);
  }
  
  getAllReasoningSessions(): ReasoningSession[] {
    return Array.from(this.reasoningSessions.values());
  }
  
  // Reasoning Reviews
  addReasoningReview(review: ReasoningReview): void {
    this.reasoningReviews.set(review.id, review);
  }
  
  getReasoningReview(id: string): ReasoningReview | undefined {
    return this.reasoningReviews.get(id);
  }
  
  getAllReasoningReviews(): ReasoningReview[] {
    return Array.from(this.reasoningReviews.values());
  }
  
  // Calibration Records
  addCalibrationRecord(record: CalibrationRecord): void {
    this.calibrationRecords.set(record.id, record);
  }
  
  getCalibrationRecord(id: string): CalibrationRecord | undefined {
    return this.calibrationRecords.get(id);
  }
  
  getAllCalibrationRecords(): CalibrationRecord[] {
    return Array.from(this.calibrationRecords.values());
  }
  
  // Benchmark Cases
  addBenchmarkCase(bCase: BenchmarkCase): void {
    this.benchmarkCases.set(bCase.id, bCase);
  }
  
  getBenchmarkCase(id: string): BenchmarkCase | undefined {
    return this.benchmarkCases.get(id);
  }
  
  getAllBenchmarkCases(): BenchmarkCase[] {
    return Array.from(this.benchmarkCases.values());
  }
  
  // Benchmark Runs
  addBenchmarkRun(run: BenchmarkRun): void {
    this.benchmarkRuns.set(run.id, run);
  }
  
  getBenchmarkRun(id: string): BenchmarkRun | undefined {
    return this.benchmarkRuns.get(id);
  }
  
  getAllBenchmarkRuns(): BenchmarkRun[] {
    return Array.from(this.benchmarkRuns.values());
  }
  
  // Ablation Configurations
  addAblationConfiguration(config: AblationConfiguration): void {
    this.ablationConfigurations.set(config.id, config);
  }
  
  getAblationConfiguration(id: string): AblationConfiguration | undefined {
    return this.ablationConfigurations.get(id);
  }
  
  getAllAblationConfigurations(): AblationConfiguration[] {
    return Array.from(this.ablationConfigurations.values());
  }

  // ---- WP4 Entities ----
  
  // Concept Counterexamples
  addConceptCounterexample(counterexample: ConceptCounterexample): void {
    this.conceptCounterexamples.set(counterexample.id, counterexample);
  }
  
  getConceptCounterexample(id: string): ConceptCounterexample | undefined {
    return this.conceptCounterexamples.get(id);
  }
  
  getAllConceptCounterexamples(): ConceptCounterexample[] {
    return Array.from(this.conceptCounterexamples.values());
  }
  
  // Concept Revisions
  addConceptRevision(revision: ConceptRevision): void {
    this.conceptRevisions.set(revision.id, revision);
  }
  
  getConceptRevision(id: string): ConceptRevision | undefined {
    return this.conceptRevisions.get(id);
  }
  
  getAllConceptRevisions(): ConceptRevision[] {
    return Array.from(this.conceptRevisions.values());
  }
  
  // Abstraction Operations
  addAbstractionOperation(operation: AbstractionOperation): void {
    this.abstractionOperations.set(operation.id, operation);
  }
  
  getAbstractionOperation(id: string): AbstractionOperation | undefined {
    return this.abstractionOperations.get(id);
  }
  
  getAllAbstractionOperations(): AbstractionOperation[] {
    return Array.from(this.abstractionOperations.values());
  }

  // ---- Clear ----
  clear(): void {
    this.sources.clear();
    this.evidence.clear();
    this.claims.clear();
    this.assumptions.clear();
    this.inferences.clear();
    this.contradictions.clear();
    this.causalNodes.clear();
    this.causalEdges.clear();
    this.causalHypotheses.clear();
    this.concepts.clear();
    this.abstractionNodes.clear();
    this.abstractionEdges.clear();
    this.worldModels.clear();
    this.plans.clear();
    this.goals.clear();
    this.constraints.clear();
    this.interventions.clear();
    // WP3 entities
    this.causalVariables.clear();
    this.causalRelations.clear();
    this.causalModels.clear();
    this.proofTraces.clear();
    this.explanationGraphs.clear();
    this.sufficiencyAssessments.clear();
    this.evidenceConflicts.clear();
    this.reasoningSessions.clear();
    this.reasoningReviews.clear();
    this.calibrationRecords.clear();
    this.benchmarkCases.clear();
    this.benchmarkRuns.clear();
    this.ablationConfigurations.clear();
    // WP4 entities
    this.conceptCandidates.clear();
    this.conceptCounterexamples.clear();
    this.conceptRevisions.clear();
    this.wp4AbstractionNodes.clear();
    this.wp4AbstractionEdges.clear();
    this.abstractionLattices.clear();
    this.abstractionOperations.clear();
    this.wp4ApplicabilityEnvelopes.clear();
    this.analogicalMappings.clear();
    this.analogicalCorrespondences.clear();
    this.analogicalPredictions.clear();
    this.analogyValidations.clear();
    this.wp4WorldObjects.clear();
    this.worldAgents.clear();
    this.worldResources.clear();
    this.worldConstraints.clear();
    this.worldEvents.clear();
    this.wp4WorldStates.clear();
    this.wp4StateVariables.clear();
    this.transitionMechanisms.clear();
    this.worldModelPredictions.clear();
    this.modelDisagreements.clear();
    this.oodAssessments.clear();
    this.transferExperiments.clear();
    this.transferResults.clear();
    this.wp4ModelCards.clear();
    this.relations = [];
    this.stateHistory = [];
    this.changeRecords = [];
  }
}
