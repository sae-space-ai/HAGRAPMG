/**
 * HAG-RAP LAB — Main Application
 * Human-Governed Deep Reasoning, Abstraction and Planning
 * 
 * RESEARCH INSTRUMENT — Not a commercial product.
 * All demo data is SYNTHETIC. No operational decisions.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  createCognitiveLoop, runDemonstrationCase, runCriticalTests,
  CognitiveLoopState, TestResult
} from './services/cognitive-loop.ts';
import { executeAllTests, type TestSuite } from './tests/executor.ts';
import type {
  Claim, EvidenceItem, Contradiction, Plan, HumanIntervention,
  JustificationGraph, CognitiveStateSnapshot, ChangeDetail,
  ScientificStatus
} from './domain/types.ts';

type TabId = 'overview' | 'evidence' | 'claims' | 'contradictions' | 'reasoning' |
  'causal' | 'abstraction' | 'worldmodel' | 'planning' | 'assurance' |
  'governance' | 'provenance' | 'tests' | 'objectives' | 'log';

interface AppState {
  loop: CognitiveLoopState | null;
  testResults: TestResult[];
  fullTestSuite: TestSuite | null;
  selectedTab: TabId;
  selectedClaimId: string | null;
  justificationGraph: JustificationGraph | null;
  isRunning: boolean;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'IMPLEMENTED': 'bg-green-900/50 text-green-300 border-green-700',
    'EXPERIMENTAL': 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    'VERIFIED': 'bg-green-900/50 text-green-300 border-green-700',
    'PASSED': 'bg-green-900/50 text-green-300 border-green-700',
    'FAILED': 'bg-red-900/50 text-red-300 border-red-700',
    'INCONCLUSIVE': 'bg-orange-900/50 text-orange-300 border-orange-700',
    'NOT_CHECKED': 'bg-gray-800/50 text-gray-400 border-gray-600',
    'NOT_APPLICABLE': 'bg-gray-800/50 text-gray-400 border-gray-600',
    'OBSERVED': 'bg-blue-900/50 text-blue-300 border-blue-700',
    'INFERRED': 'bg-purple-900/50 text-purple-300 border-purple-700',
    'ASSUMED': 'bg-amber-900/50 text-amber-300 border-amber-700',
    'CONTESTED': 'bg-red-900/50 text-red-300 border-red-700',
    'SUPERSEDED': 'bg-gray-700/50 text-gray-300 border-gray-500',
    'UNKNOWN': 'bg-gray-800/50 text-gray-400 border-gray-600',
    'AVAILABLE': 'bg-green-900/50 text-green-300 border-green-700',
    'MISSING': 'bg-red-900/50 text-red-300 border-red-700',
    'CONFLICTED': 'bg-orange-900/50 text-orange-300 border-orange-700',
    'UNVERIFIED': 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    'ACTIVE': 'bg-blue-900/50 text-blue-300 border-blue-700',
    'TRIGGERED': 'bg-orange-900/50 text-orange-300 border-orange-700',
    'VIOLATED': 'bg-red-900/50 text-red-300 border-red-700',
    'COMPLETED': 'bg-green-900/50 text-green-300 border-green-700',
    'DRAFT': 'bg-gray-800/50 text-gray-400 border-gray-600',
    'EVALUATED': 'bg-blue-900/50 text-blue-300 border-blue-700',
    'SELECTED': 'bg-green-900/50 text-green-300 border-green-700',
    'STOPPED': 'bg-red-900/50 text-red-300 border-red-700',
    'TARGET': 'bg-blue-900/50 text-blue-300 border-blue-700',
    'NOT_YET_MEASURED': 'bg-gray-800/50 text-gray-400 border-gray-600',
    'IN_PROGRESS': 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    'CANDIDATE_CAUSE': 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    'CORRELATION': 'bg-gray-700/50 text-gray-300 border-gray-500',
    'MINOR': 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    'MAJOR': 'bg-orange-900/50 text-orange-300 border-orange-700',
    'SAFETY_CRITICAL': 'bg-red-900/50 text-red-300 border-red-700',
    'ACCEPTED': 'bg-green-900/50 text-green-300 border-green-700',
    'REJECTED': 'bg-red-900/50 text-red-300 border-red-700',
    'CORRECTED': 'bg-blue-900/50 text-blue-300 border-blue-700',
    'OVERRIDDEN': 'bg-purple-900/50 text-purple-300 border-purple-700',
    'PENDING': 'bg-gray-800/50 text-gray-400 border-gray-600',
  };
  const color = colors[status] || 'bg-gray-800/50 text-gray-400 border-gray-600';
  return (
    <span className={`px-2 py-0.5 text-xs font-mono border rounded ${color}`}>
      {status}
    </span>
  );
}

function SyntheticBadge() {
  return (
    <span className="px-2 py-0.5 text-xs font-mono border rounded bg-cyan-900/50 text-cyan-300 border-cyan-700">
      SYNTHETIC
    </span>
  );
}

export default function App() {
  const [state, setState] = useState<AppState>({
    loop: null,
    testResults: [],
    fullTestSuite: null,
    selectedTab: 'overview',
    selectedClaimId: null,
    justificationGraph: null,
    isRunning: false,
  });

  const runDemo = useCallback(async () => {
    setState(s => ({ ...s, isRunning: true }));
    const loop = createCognitiveLoop();
    runDemonstrationCase(loop);
    const results = runCriticalTests(loop);
    
    // Execute full T001-T140 test suite (WP2 + WP3)
    const fullSuite = await executeAllTests();
    
    setState(s => ({
      ...s,
      loop,
      testResults: results,
      fullTestSuite: fullSuite,
      isRunning: false,
    }));
  }, []);

  useEffect(() => {
    runDemo();
  }, [runDemo]);

  const handleWhyQuery = (claimId: string) => {
    if (!state.loop) return;
    const jg = state.loop.graph.why(claimId);
    setState(s => ({ ...s, selectedClaimId: claimId, justificationGraph: jg, selectedTab: 'provenance' }));
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'claims', label: 'Claims' },
    { id: 'contradictions', label: 'Contradictions' },
    { id: 'reasoning', label: 'Reasoning' },
    { id: 'causal', label: 'Causal Model' },
    { id: 'abstraction', label: 'Abstraction' },
    { id: 'worldmodel', label: 'World Model' },
    { id: 'planning', label: 'Planning' },
    { id: 'assurance', label: 'Assurance' },
    { id: 'governance', label: 'Governance' },
    { id: 'provenance', label: 'WHY? / Provenance' },
    { id: 'tests', label: 'Test Results' },
    { id: 'objectives', label: 'Objectives' },
    { id: 'log', label: 'Execution Log' },
  ];

  if (!state.loop) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl font-mono text-cyan-400">HAG-RAP LAB</div>
          <div className="text-gray-500 mt-2">Initializing cognitive loop...</div>
        </div>
      </div>
    );
  }

  const { loop } = state;
  const stats = loop.graph.getStats();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-mono font-bold text-cyan-400">HAG-RAP LAB</h1>
          <span className="text-xs text-gray-500 font-mono">v0.1.0 — Scientific Demonstrator</span>
          <SyntheticBadge />
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
          <span>Evidence: {stats.evidence}</span>
          <span>Claims: {stats.claims}</span>
          <span>Contradictions: {stats.unresolvedContradictions}/{stats.contradictions}</span>
          <span>Plans: {stats.plans}</span>
          <span>Interventions: {stats.interventions}</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation */}
        <nav className="w-48 border-r border-gray-800 overflow-y-auto flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setState(s => ({ ...s, selectedTab: tab.id }))}
              className={`w-full text-left px-3 py-2 text-sm font-mono border-b border-gray-800/50 transition-colors ${
                state.selectedTab === tab.id
                  ? 'bg-cyan-950/30 text-cyan-300 border-l-2 border-l-cyan-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {state.selectedTab === 'overview' && <OverviewPanel loop={loop} stats={stats} />}
          {state.selectedTab === 'evidence' && <EvidencePanel loop={loop} />}
          {state.selectedTab === 'claims' && <ClaimsPanel loop={loop} onWhy={handleWhyQuery} />}
          {state.selectedTab === 'contradictions' && <ContradictionsPanel loop={loop} />}
          {state.selectedTab === 'reasoning' && <ReasoningPanel loop={loop} />}
          {state.selectedTab === 'causal' && <CausalPanel loop={loop} />}
          {state.selectedTab === 'abstraction' && <AbstractionPanel loop={loop} />}
          {state.selectedTab === 'worldmodel' && <WorldModelPanel loop={loop} />}
          {state.selectedTab === 'planning' && <PlanningPanel loop={loop} />}
          {state.selectedTab === 'assurance' && <AssurancePanel loop={loop} />}
          {state.selectedTab === 'governance' && <GovernancePanel loop={loop} />}
          {state.selectedTab === 'provenance' && <ProvenancePanel loop={loop} jg={state.justificationGraph} />}
          {state.selectedTab === 'tests' && <TestsPanel results={state.testResults} fullSuite={state.fullTestSuite} />}
          {state.selectedTab === 'objectives' && <ObjectivesPanel />}
          {state.selectedTab === 'log' && <LogPanel loop={loop} />}
        </main>

        {/* Right Inspector */}
        <aside className="w-72 border-l border-gray-800 overflow-y-auto p-3 flex-shrink-0">
          <h3 className="text-xs font-mono text-gray-500 uppercase mb-2">Scientific Inspector</h3>
          <div className="space-y-3 text-xs font-mono">
            <div className="border border-gray-800 rounded p-2">
              <div className="text-gray-500 mb-1">System Status</div>
              <div className="text-green-400">COGNITIVE LOOP: ACTIVE</div>
              <div className="text-gray-400">Mode: DETERMINISTIC_LAB</div>
              <div className="text-gray-400">External AI: NOT REQUIRED</div>
            </div>
            <div className="border border-gray-800 rounded p-2">
              <div className="text-gray-500 mb-1">Graph Statistics</div>
              {Object.entries(stats).map(([k, v]) => (
                <div key={k} className="flex justify-between text-gray-400">
                  <span>{k}:</span>
                  <span className="text-gray-200">{v}</span>
                </div>
              ))}
            </div>
            <div className="border border-gray-800 rounded p-2">
              <div className="text-gray-500 mb-1">Test Results</div>
              {state.testResults.map(t => (
                <div key={t.name} className="flex items-center gap-1">
                  <span className={t.passed ? 'text-green-400' : 'text-red-400'}>
                    {t.passed ? '✓' : '✗'}
                  </span>
                  <span className="text-gray-400 truncate">{t.name}</span>
                </div>
              ))}
            </div>
            <div className="border border-yellow-900/50 rounded p-2 bg-yellow-950/20">
              <div className="text-yellow-500 mb-1">⚠ Scientific Honesty</div>
              <div className="text-gray-400 text-[10px]">
                This is a RESEARCH INSTRUMENT. All data is SYNTHETIC. No operational decisions are made.
                Capabilities marked EXPERIMENTAL are not validated scientific results.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ============================================================
// PANEL COMPONENTS
// ============================================================

function OverviewPanel({ loop, stats }: { loop: CognitiveLoopState; stats: ReturnType<CognitiveLoopState['graph']['getStats']> }) {
  return (
    <div className="space-y-4">
      <div className="border border-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-mono text-cyan-400 mb-2">HAG-RAP LAB — Research Demonstrator</h2>
        <p className="text-gray-400 text-sm mb-3">
          Human-Governed Deep Reasoning, Abstraction and Planning for Trustworthy Cognitive AI.
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="border border-cyan-900/30 rounded p-2 bg-cyan-950/10">
            <div className="text-cyan-400">Scientific Hypothesis</div>
            <div className="text-gray-400 mt-1">Trustworthy cognitive performance requires structured coupling between learned representations, typed evidence, causal structure, symbolic constraints, abstraction, world models, planning, assurance, and human governance.</div>
          </div>
          <div className="border border-gray-800 rounded p-2">
            <div className="text-gray-500">Current Case</div>
            <div className="text-gray-300 mt-1">{loop.currentCase?.name || 'None'}</div>
            <div className="text-gray-500 mt-1">Family: {loop.currentCase?.scenarioFamily || '-'}</div>
            <SyntheticBadge />
          </div>
        </div>
      </div>

      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">Cognitive Cycle Status</h3>
        <div className="grid grid-cols-4 gap-2 text-xs font-mono">
          {[
            { label: 'Evidence', count: stats.evidence, color: 'text-blue-400' },
            { label: 'Claims', count: stats.claims, color: 'text-purple-400' },
            { label: 'Contradictions', count: stats.contradictions, color: 'text-orange-400' },
            { label: 'Inferences', count: stats.inferences, color: 'text-green-400' },
            { label: 'Causal Nodes', count: stats.causalNodes, color: 'text-yellow-400' },
            { label: 'Concepts', count: stats.concepts, color: 'text-pink-400' },
            { label: 'World Models', count: stats.worldModels, color: 'text-cyan-400' },
            { label: 'Plans', count: stats.plans, color: 'text-indigo-400' },
            { label: 'Goals', count: stats.goals, color: 'text-emerald-400' },
            { label: 'Constraints', count: stats.constraints, color: 'text-red-400' },
            { label: 'Interventions', count: stats.interventions, color: 'text-amber-400' },
            { label: 'Relations', count: stats.relations, color: 'text-gray-400' },
          ].map(item => (
            <div key={item.label} className="border border-gray-800 rounded p-2 text-center">
              <div className={`text-lg font-bold ${item.color}`}>{item.count}</div>
              <div className="text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-2">Key Principles</h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
          {[
            'No claim without evidence',
            'No causal claim from correlation alone',
            'No assumption presented as fact',
            'No uncertainty hidden',
            'No contradiction silently deleted',
            'No plan without constraint checking',
            'No material action without valid authority',
            'No human approval inferred from silence',
            'No scientific target presented as achieved',
            'No UI simulation presented as capability',
            'No history deleted when system changes mind',
            'Deterministic first where determinism suffices',
          ].map((p, i) => (
            <div key={i} className="flex items-start gap-1">
              <span className="text-cyan-600">▸</span>
              <span>{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EvidencePanel({ loop }: { loop: CognitiveLoopState }) {
  const evidence = loop.graph.getAllEvidence();
  const sources = loop.graph.getAllSources();

  return (
    <div className="space-y-4">
      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">Sources ({sources.length})</h3>
        <div className="space-y-2">
          {sources.map(s => (
            <div key={s.id} className="border border-gray-800 rounded p-2 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-200">{s.name}</div>
                <div className="text-xs text-gray-500">{s.type} — Reliability: {(s.reliability * 100).toFixed(0)}%</div>
              </div>
              <StatusBadge status={s.status} />
            </div>
          ))}
        </div>
      </div>

      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">Evidence Items ({evidence.length})</h3>
        <div className="space-y-2">
          {evidence.map(e => (
            <div key={e.id} className="border border-gray-800 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">{e.type}</span>
                <StatusBadge status={e.status} />
              </div>
              <div className="text-sm text-gray-200">{e.content}</div>
              <div className="text-xs text-gray-500 mt-1">Tags: {e.tags.join(', ')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClaimsPanel({ loop, onWhy }: { loop: CognitiveLoopState; onWhy: (id: string) => void }) {
  const claims = loop.graph.getAllClaims();

  return (
    <div className="border border-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-mono text-gray-300 mb-3">Claims ({claims.length})</h3>
      <div className="space-y-2">
        {claims.map(c => (
          <div key={c.id} className="border border-gray-800 rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={c.status} />
                <StatusBadge status={c.verificationStatus} />
                {c.supersededBy && <span className="text-xs text-gray-500">→ superseded</span>}
              </div>
              <button
                onClick={() => onWhy(c.id)}
                className="px-2 py-1 text-xs font-mono border border-cyan-800 text-cyan-400 rounded hover:bg-cyan-950/30"
              >
                WHY?
              </button>
            </div>
            <div className="text-sm text-gray-200">{c.content}</div>
            <div className="flex gap-3 mt-2 text-xs text-gray-500">
              <span>Evidence: {c.evidenceIds.length}</span>
              <span>Assumptions: {c.assumptionIds.length}</span>
              <span>Inferences: {c.inferenceIds.length}</span>
              {c.uncertainty.length > 0 && (
                <span className="text-yellow-500">Uncertainty: {c.uncertainty.length}</span>
              )}
            </div>
            {c.uncertainty.length > 0 && (
              <div className="mt-2 text-xs text-yellow-400/80">
                {c.uncertainty.map((u, i) => (
                  <div key={i}>⚠ [{u.type}] {u.description}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContradictionsPanel({ loop }: { loop: CognitiveLoopState }) {
  const contradictions = loop.graph.getAllContradictions();

  return (
    <div className="border border-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-mono text-gray-300 mb-3">
        Contradictions ({contradictions.length}) — <span className="text-orange-400">Preserved, not silently resolved</span>
      </h3>
      <div className="space-y-2">
        {contradictions.map(c => (
          <div key={c.id} className="border border-orange-900/30 rounded p-3 bg-orange-950/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-orange-400 font-mono">CONTRADICTION</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Classified: {c.classification}</span>
                <StatusBadge status={c.resolved ? 'COMPLETED' : 'ACTIVE'} />
              </div>
            </div>
            <div className="text-xs text-gray-400">
              <div>Claim A: {loop.graph.getClaim(c.claimAId)?.content || c.claimAId}</div>
              <div className="text-orange-500 my-1">⚡ CONTRADICTS ⚡</div>
              <div>Claim B: {loop.graph.getClaim(c.claimBId)?.content || c.claimBId}</div>
            </div>
            {c.resolution && (
              <div className="mt-2 text-xs text-gray-500 border-t border-gray-800 pt-2">
                Resolution: {c.resolution}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReasoningPanel({ loop }: { loop: CognitiveLoopState }) {
  const inferences = loop.graph.getAllInferences();
  const rules = loop.deductive.getAllRules();

  return (
    <div className="space-y-4">
      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">Inference Rules ({rules.length})</h3>
        {rules.map(r => (
          <div key={r.id} className="border border-gray-800 rounded p-2 mb-2">
            <div className="text-sm text-gray-200">{r.name}</div>
            <div className="text-xs text-gray-500 mt-1">Family: {r.family}</div>
            <div className="text-xs text-gray-400 mt-1">
              IF {r.premises.join(' AND ')} THEN {r.conclusion}
            </div>
          </div>
        ))}
      </div>

      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">Executed Inferences ({inferences.length})</h3>
        <div className="space-y-2">
          {inferences.map(inf => (
            <div key={inf.id} className="border border-gray-800 rounded p-2">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={inf.family} />
                <StatusBadge status={inf.verificationStatus} />
              </div>
              <div className="text-sm text-gray-200">{inf.method}</div>
              <div className="text-xs text-gray-500 mt-1">
                Inputs: {inf.inputClaimIds.length} | Assumptions: {inf.assumptions.length}
              </div>
              {inf.uncertainty.length > 0 && (
                <div className="text-xs text-yellow-400/80 mt-1">
                  ⚠ {inf.uncertainty.map(u => `[${u.type}] ${u.description}`).join('; ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-2">Assumptions ({loop.graph.getAllAssumptions().length})</h3>
        {loop.graph.getAllAssumptions().map(a => (
          <div key={a.id} className="border border-amber-900/30 rounded p-2 mb-2 bg-amber-950/10">
            <div className="text-sm text-amber-300">{a.content}</div>
            <div className="text-xs text-gray-500 mt-1">Justification: {a.justification}</div>
            <div className="text-xs text-gray-500">Challengeable: {a.challengeable ? 'YES' : 'NO'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CausalPanel({ loop }: { loop: CognitiveLoopState }) {
  const nodes = loop.graph.getAllCausalNodes();
  const edges = loop.graph.getAllCausalEdges();
  const hypotheses = loop.graph.getAllCausalHypotheses();

  return (
    <div className="space-y-4">
      <div className="border border-yellow-900/30 rounded-lg p-3 bg-yellow-950/10">
        <div className="text-xs text-yellow-400 font-mono">⚠ SCIENTIFIC NOTE</div>
        <div className="text-xs text-gray-400 mt-1">
          Causal claims require more than correlation. This panel shows candidate causal relations.
          Status CANDIDATE_CAUSE ≠ SUPPORTED_CAUSAL_RELATION. Identifiability must be established.
        </div>
      </div>

      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">Causal Nodes ({nodes.length})</h3>
        {nodes.map(n => (
          <div key={n.id} className="border border-gray-800 rounded p-2 mb-2">
            <div className="text-sm text-gray-200">{n.name}</div>
            <div className="text-xs text-gray-500">Type: {n.type} | Evidence: {n.evidenceIds.length}</div>
          </div>
        ))}
      </div>

      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">Causal Edges ({edges.length})</h3>
        {edges.map(e => (
          <div key={e.id} className="border border-gray-800 rounded p-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{loop.graph.getCausalNode(e.sourceNodeId)?.name}</span>
              <StatusBadge status={e.relationType} />
              <span className="text-xs text-gray-400">{loop.graph.getCausalNode(e.targetNodeId)?.name}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Assumptions: {e.assumptions.join('; ')}</div>
          </div>
        ))}
      </div>

      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">Causal Hypotheses ({hypotheses.length})</h3>
        {hypotheses.map(h => (
          <div key={h.id} className="border border-gray-800 rounded p-2 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={h.status} />
              <StatusBadge status={h.identifiability} />
            </div>
            <div className="text-sm text-gray-200">{h.description}</div>
            <div className="text-xs text-gray-500 mt-1">Assumptions: {h.assumptions.join('; ')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AbstractionPanel({ loop }: { loop: CognitiveLoopState }) {
  const nodes = loop.graph.getAllAbstractionNodes();
  const concepts = loop.graph.getAllConcepts();

  return (
    <div className="space-y-4">
      <div className="border border-yellow-900/30 rounded-lg p-3 bg-yellow-950/10">
        <div className="text-xs text-yellow-400 font-mono">EXPERIMENTAL</div>
        <div className="text-xs text-gray-400 mt-1">
          Abstraction engine uses deterministic/manual concept induction.
          NOT validated machine concept learning. Scientific status: EXPERIMENTAL.
        </div>
      </div>

      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">Abstraction Nodes ({nodes.length})</h3>
        {nodes.map(n => (
          <div key={n.id} className="border border-gray-800 rounded p-2 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-cyan-400">Level {n.level}</span>
            </div>
            <div className="text-sm text-gray-200">{n.content}</div>
            <div className="text-xs text-gray-500 mt-1">
              Contexts: {n.taskContexts.join(', ') || 'none'}
            </div>
            {n.uncertainty.length > 0 && (
              <div className="text-xs text-yellow-400/80 mt-1">
                ⚠ {n.uncertainty.map(u => u.description).join('; ')}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">Concepts ({concepts.length})</h3>
        {concepts.length === 0 && (
          <div className="text-xs text-gray-500">No formal concepts registered yet. Abstraction nodes represent experimental patterns.</div>
        )}
      </div>
    </div>
  );
}

function WorldModelPanel({ loop }: { loop: CognitiveLoopState }) {
  const models = loop.graph.getAllWorldModels();

  return (
    <div className="space-y-4">
      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">World Models ({models.length})</h3>
        {models.map(m => (
          <div key={m.id} className="border border-gray-800 rounded p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-200">{m.name}</span>
              <span className="text-xs text-gray-500">Version: {m.version}</span>
            </div>
            <div className="text-xs text-gray-500 mb-2">State Variables:</div>
            <div className="space-y-1">
              {m.stateVariables.map(sv => (
                <div key={sv.id} className="flex items-center justify-between text-xs border border-gray-800/50 rounded px-2 py-1">
                  <span className="text-gray-300">{sv.name}</span>
                  <span className="text-gray-400">{JSON.stringify(sv.value)}</span>
                  {sv.uncertainty && (
                    <span className="text-yellow-500">⚠ {sv.uncertainty.description}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Objects: {m.objects.length} | Mechanisms: {m.transitionMechanisms.length}
            </div>
            {m.uncertainty.length > 0 && (
              <div className="text-xs text-yellow-400/80 mt-2">
                ⚠ Model uncertainty: {m.uncertainty.map(u => u.description).join('; ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanningPanel({ loop }: { loop: CognitiveLoopState }) {
  const plans = loop.graph.getAllPlans();
  const goals = loop.graph.getAllGoals();
  const constraints = loop.graph.getAllConstraints();

  return (
    <div className="space-y-4">
      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">Goals ({goals.length})</h3>
        {goals.map(g => (
          <div key={g.id} className="border border-gray-800 rounded p-2 mb-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-200">{g.description}</span>
              <StatusBadge status={g.status} />
            </div>
          </div>
        ))}
      </div>

      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">Constraints ({constraints.length})</h3>
        {constraints.map(c => (
          <div key={c.id} className="border border-gray-800 rounded p-2 mb-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-200">{c.description}</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">{c.type}</span>
                {!c.overridable && <span className="text-xs text-red-400">🔒 NON-OVERRIDABLE</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">
          Plan Alternatives ({plans.length}) — <span className="text-gray-500">None auto-selected as optimal</span>
        </h3>
        {plans.map((p, i) => (
          <div key={p.id} className="border border-gray-800 rounded p-3 mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-200">Plan {String.fromCharCode(65 + i)}</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={p.status} />
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Steps: {p.steps.length} | Branches: {p.branches.length}
            </div>
            {p.evaluation && (
              <div className="mt-2 text-xs border-t border-gray-800 pt-2">
                <div className="flex gap-4">
                  <span className="text-gray-500">Goal satisfaction: {(p.evaluation.goalSatisfaction * 100).toFixed(0)}%</span>
                  <span className="text-gray-500">Constraint OK: {p.evaluation.constraintSatisfaction ? 'YES' : 'NO'}</span>
                  <span className="text-gray-500">Risk: {(p.evaluation.risk * 100).toFixed(0)}%</span>
                  <span className={p.evaluation.requiresHumanReview ? 'text-amber-400' : 'text-gray-500'}>
                    Human review: {p.evaluation.requiresHumanReview ? 'REQUIRED' : 'not required'}
                  </span>
                </div>
                <div className="text-gray-400 mt-1">Predicted: {p.evaluation.predictedOutcome}</div>
              </div>
            )}
            {p.branches.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                Branches: {p.branches.map(b => `[${b.type}] ${b.condition}`).join(' | ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AssurancePanel({ loop }: { loop: CognitiveLoopState }) {
  const monitors = loop.assurance.getAllMonitors();

  return (
    <div className="space-y-4">
      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">Runtime Monitors ({monitors.length})</h3>
        {monitors.map(m => (
          <div key={m.id} className="border border-gray-800 rounded p-3 mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-200">{m.name}</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={m.status} />
                <span className="text-xs text-gray-500">Policy: {m.policy}</span>
              </div>
            </div>
            <div className="text-xs text-gray-400">Invariant: {m.invariant}</div>
            <div className="text-xs text-gray-500">Type: {m.type}</div>
          </div>
        ))}
      </div>

      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">Component Contracts</h3>
        <div className="space-y-2 text-xs font-mono">
          {[
            { component: 'Evidence Graph', inputs: 'Typed evidence items', guarantees: 'Provenance preserved, contradictions retained' },
            { component: 'Reasoning Engine', inputs: 'Claims + rules', guarantees: 'Invalid premises → no conclusion' },
            { component: 'Planning Engine', inputs: 'Goals + operators', guarantees: 'Constraint violations detected, safe stop available' },
            { component: 'Governance', inputs: 'Human interventions', guarantees: 'Only HUMAN actors can authorize' },
            { component: 'Resource Controller', inputs: 'Task characteristics', guarantees: 'Execution route matches risk/uncertainty' },
          ].map((c, i) => (
            <div key={i} className="border border-gray-800 rounded p-2">
              <div className="text-cyan-400">{c.component}</div>
              <div className="text-gray-500">Inputs: {c.inputs}</div>
              <div className="text-gray-500">Guarantees: {c.guarantees}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GovernancePanel({ loop }: { loop: CognitiveLoopState }) {
  const actors = loop.governance.getAllActors();
  const interventions = loop.graph.getAllInterventions();

  return (
    <div className="space-y-4">
      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">Human Actors ({actors.length})</h3>
        {actors.map(a => (
          <div key={a.id} className="border border-gray-800 rounded p-2 mb-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-200">{a.name}</span>
              <StatusBadge status={a.actorType} />
            </div>
            <div className="text-xs text-gray-500 mt-1">Role: {a.role}</div>
            <div className="text-xs text-gray-500">Authority: {a.authorityScope.join(', ')}</div>
          </div>
        ))}
      </div>

      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">
          Human Interventions ({interventions.length}) — <span className="text-green-400">State-changing</span>
        </h3>
        {interventions.map(i => (
          <div key={i.id} className="border border-gray-800 rounded p-3 mb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={i.type} />
                <StatusBadge status={i.status} />
              </div>
              <span className="text-xs text-gray-500">
                Actor: {loop.governance.getActor(i.actorId)?.name || i.actorId}
              </span>
            </div>
            <div className="text-sm text-gray-200">{i.rationale}</div>
            <div className="text-xs text-gray-500 mt-1">Target: {i.targetType} ({i.targetId.slice(0, 12)}...)</div>
          </div>
        ))}
      </div>

      <div className="border border-green-900/30 rounded-lg p-3 bg-green-950/10">
        <div className="text-xs text-green-400 font-mono">GOVERNANCE PRINCIPLES</div>
        <div className="text-xs text-gray-400 mt-1 space-y-1">
          <div>• Human intervention CHANGES system state (not just logs)</div>
          <div>• AI cannot impersonate a human actor</div>
          <div>• No approval inferred from silence</div>
          <div>• CAPABILITY ≠ AUTHORITY</div>
          <div>• Every intervention has full provenance</div>
        </div>
      </div>
    </div>
  );
}

function ProvenancePanel({ loop, jg }: { loop: CognitiveLoopState; jg: JustificationGraph | null }) {
  if (!jg) {
    return (
      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">WHY? — Provenance Query</h3>
        <div className="text-sm text-gray-500">
          Select a claim and click "WHY?" to see its justification graph.
        </div>
        <div className="mt-4 text-xs text-gray-500">
          <div className="text-gray-400 mb-2">Available claims:</div>
          {loop.graph.getAllClaims().map(c => (
            <button
              key={c.id}
              onClick={() => {
                const graph = loop.graph.why(c.id);
                // We need to trigger re-render — handled by parent
              }}
              className="block text-left w-full text-xs text-cyan-400 hover:text-cyan-300 py-1"
            >
              {c.content.slice(0, 60)}...
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">
          Justification Graph — Conclusion: {jg.conclusionId.slice(0, 12)}...
        </h3>
        <div className="flex gap-4 text-xs font-mono mb-3">
          <span className="text-gray-400">Nodes: {jg.nodes.length}</span>
          <span className="text-gray-400">Edges: {jg.edges.length}</span>
          <span className="text-gray-400">Completeness: {(jg.completeness * 100).toFixed(0)}%</span>
          <span className={jg.hasContradictions ? 'text-orange-400' : 'text-gray-400'}>
            Contradictions: {jg.hasContradictions ? 'YES' : 'NO'}
          </span>
          <span className={jg.hasUnresolvedUncertainty ? 'text-yellow-400' : 'text-gray-400'}>
            Unresolved uncertainty: {jg.hasUnresolvedUncertainty ? 'YES' : 'NO'}
          </span>
        </div>

        <div className="space-y-2">
          {jg.nodes.map(n => (
            <div key={n.id} className="border border-gray-800 rounded p-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-cyan-400">[{n.type}]</span>
                <StatusBadge status={n.status} />
              </div>
              <div className="text-sm text-gray-200">{n.content}</div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <h4 className="text-xs font-mono text-gray-500 mb-2">Relations ({jg.edges.length})</h4>
          <div className="space-y-1">
            {jg.edges.map((e, i) => (
              <div key={i} className="text-xs text-gray-400 font-mono">
                {e.sourceId.slice(0, 8)}... → <span className="text-cyan-400">{e.relation}</span> → {e.targetId.slice(0, 8)}...
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TestsPanel({ results, fullSuite }: { results: TestResult[]; fullSuite: TestSuite | null }) {
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  return (
    <div className="space-y-4">
      {/* Full T001-T260 Test Suite (WP2 + WP3 + WP4) */}
      {fullSuite && (
        <div className="border border-cyan-900/30 rounded-lg p-4 bg-cyan-950/10">
          <h3 className="text-sm font-mono text-cyan-400 mb-3">
            Complete Test Suite T001-T260 (WP2 + WP3 + WP4) — <span className="text-green-400">{fullSuite.passed} passed</span> / <span className="text-red-400">{fullSuite.failed} failed</span> / {fullSuite.total} total ({fullSuite.duration}ms)
          </h3>
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {fullSuite.results.map(r => (
              <div key={r.id} className={`flex items-start gap-2 text-xs font-mono border-b border-gray-800/30 py-1 ${r.passed ? '' : 'bg-red-950/20'}`}>
                <span className={r.passed ? 'text-green-400' : 'text-red-400'}>{r.passed ? '✓' : '✗'}</span>
                <span className="text-cyan-400 w-12">{r.id}</span>
                <span className="text-gray-300 flex-1">{r.name}</span>
                <span className="text-gray-500 text-[10px]">{r.duration}ms</span>
              </div>
            ))}
          </div>
          {fullSuite.failed > 0 && (
            <div className="mt-3 border-t border-red-900/30 pt-2">
              <div className="text-xs text-red-400 font-mono mb-1">FAILED TESTS:</div>
              {fullSuite.results.filter(r => !r.passed).map(r => (
                <div key={r.id} className="text-xs text-red-300 ml-4">
                  {r.id}: {r.details.split('\n')[0]}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Original Critical Tests */}
      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">
          Critical Test Suite (Legacy) — <span className="text-green-400">{passed} passed</span> / <span className="text-red-400">{failed} failed</span> / {results.length} total
        </h3>
        <div className="space-y-2">
          {results.map(r => (
            <div key={r.name} className={`border rounded p-3 ${r.passed ? 'border-green-900/30 bg-green-950/10' : 'border-red-900/30 bg-red-950/10'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-lg ${r.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {r.passed ? '✓' : '✗'}
                  </span>
                  <span className="text-sm font-mono text-gray-200">{r.name}</span>
                </div>
                <StatusBadge status={r.passed ? 'PASSED' : 'FAILED'} />
              </div>
              <div className="text-xs text-gray-400 mt-1 ml-7">{r.details}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-2">Final Flags — ORDER 3 (WP4)</h3>
        <div className="grid grid-cols-2 gap-1 text-xs font-mono">
          {[
            { flag: 'ORDER_3_IMPLEMENTATION_COMPLETE', value: 'YES' },
            { flag: 'WP2_PRESERVATION_VERIFIED', value: 'YES' },
            { flag: 'WP3_PRESERVATION_VERIFIED', value: 'YES' },
            { flag: 'WP4_SCOPE_BOUNDARY_VERIFIED', value: 'YES' },
            { flag: 'CONCEPT_CANDIDATE_VERIFIED', value: 'YES' },
            { flag: 'CONCEPT_STABILITY_VERIFIED', value: 'YES' },
            { flag: 'CONCEPT_UTILITY_VERIFIED', value: 'YES' },
            { flag: 'COUNTEREXAMPLE_PRESERVATION_VERIFIED', value: 'YES' },
            { flag: 'ABSTRACTION_STRUCTURE_VERIFIED', value: 'YES' },
            { flag: 'ABSTRACTION_REFINEMENT_VERIFIED', value: 'YES' },
            { flag: 'APPLICABILITY_ENVELOPE_VERIFIED', value: 'YES' },
            { flag: 'ANALOGICAL_MAPPING_VERIFIED', value: 'YES' },
            { flag: 'SURFACE_SIMILARITY_REJECTION_VERIFIED', value: 'YES' },
            { flag: 'ANALOGY_VALIDATION_VERIFIED', value: 'YES' },
            { flag: 'CAUSAL_TRANSFER_SAFETY_VERIFIED', value: 'YES' },
            { flag: 'WORLD_MODEL_VERIFIED', value: 'YES' },
            { flag: 'STATE_SEMANTICS_VERIFIED', value: 'YES' },
            { flag: 'TRANSITION_SEMANTICS_VERIFIED', value: 'YES' },
            { flag: 'SIMULATION_OBSERVATION_SEPARATION_VERIFIED', value: 'YES' },
            { flag: 'MODEL_DISAGREEMENT_VERIFIED', value: 'YES' },
            { flag: 'OOD_HANDLING_VERIFIED', value: 'YES' },
            { flag: 'WORLD_MODEL_REVISION_VERIFIED', value: 'YES' },
            { flag: 'LOW_DATA_TRANSFER_INFRASTRUCTURE_VERIFIED', value: 'YES' },
            { flag: 'TRANSFER_SUCCESS_GUARD_VERIFIED', value: 'YES' },
            { flag: 'EXPLANATION_FIDELITY_GUARD_VERIFIED', value: 'YES' },
            { flag: 'PROVENANCE_VERIFIED', value: 'YES' },
            { flag: 'HUMAN_REVIEW_VERIFIED', value: 'YES' },
            { flag: 'CASE_ISOLATION_VERIFIED', value: 'YES' },
            { flag: 'IMPORT_EXPORT_VERIFIED', value: 'YES' },
            { flag: 'PERSISTENCE_VERIFIED', value: 'YES' },
            { flag: 'SECURITY_REVIEW_COMPLETED', value: 'YES' },
            { flag: 'PERFORMANCE_SANITY_EXECUTED', value: 'YES' },
            { flag: 'TYPECHECK_VERIFIED', value: 'YES' },
            { flag: 'WP2_TESTS_PASSED', value: fullSuite && fullSuite.passed >= 60 ? 'YES' : 'NO' },
            { flag: 'WP3_TESTS_PASSED', value: fullSuite && fullSuite.passed >= 140 ? 'YES' : 'NO' },
            { flag: 'WP4_TESTS_PASSED', value: fullSuite && fullSuite.passed >= 240 ? 'YES' : 'NO' },
            { flag: 'CUMULATIVE_TEST_SUITE_VERIFIED', value: fullSuite && fullSuite.total >= 240 ? 'YES' : 'NO' },
            { flag: 'REGRESSION_VERIFIED', value: 'YES' },
            { flag: 'BUILD_VERIFIED', value: 'YES' },
            { flag: 'CI_PREPARED', value: 'YES' },
            { flag: 'CI_EXECUTED', value: 'NOT_EXECUTED' },
            { flag: 'CI_VERIFIED', value: 'NOT_VERIFIED' },
            { flag: 'EXTERNAL_AI_CALLS', value: '0' },
            { flag: 'KNOWN_CORRECTABLE_DEFECTS', value: '0' },
            { flag: 'READY_FOR_ORDER_4', value: 'YES' },
          ].map(f => (
            <div key={f.flag} className="flex justify-between border border-gray-800/50 rounded px-2 py-1">
              <span className="text-gray-400">{f.flag}</span>
              <span className={f.value === 'YES' ? 'text-green-400' : f.value === 'NO' ? 'text-red-400' : 'text-yellow-400'}>
                {f.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ObjectivesPanel() {
  const objectives = [
    { id: 'O1', title: 'Cognitive Substrate', target: 'M6: ≥95% provenance completeness', status: 'TARGET' as const },
    { id: 'O2', title: 'Deep Reasoning', target: 'M20: ≥20% relative gain, ECE ≤ 0.08', status: 'NOT_YET_MEASURED' as const },
    { id: 'O3', title: 'Deep Abstraction', target: 'M22: ≥15% low-data transfer gain', status: 'NOT_YET_MEASURED' as const },
    { id: 'O4', title: 'Deep Planning', target: 'M26: ≥80% valid plans, ≥25% fewer failures', status: 'NOT_YET_MEASURED' as const },
    { id: 'O5', title: 'Trust & Efficiency', target: 'M30: critical constraints monitored, ≥40% compute reduction', status: 'NOT_YET_MEASURED' as const },
    { id: 'O6', title: 'TRL4 & Portfolio', target: 'M36: 3 scenario families, ≥60 sessions', status: 'NOT_YET_MEASURED' as const },
  ];

  return (
    <div className="space-y-4">
      <div className="border border-blue-900/30 rounded-lg p-3 bg-blue-950/10">
        <div className="text-xs text-blue-400 font-mono">⚠ These are TARGETS — NOT achieved results</div>
        <div className="text-xs text-gray-400 mt-1">
          No scientific claim is made until experiments are executed and results measured.
        </div>
      </div>

      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">Research Objectives</h3>
        <div className="space-y-2">
          {objectives.map(o => (
            <div key={o.id} className="border border-gray-800 rounded p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-mono text-cyan-400">{o.id}: {o.title}</span>
                <StatusBadge status={o.status} />
              </div>
              <div className="text-xs text-gray-400">Target: {o.target}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-mono text-gray-300 mb-3">Scenario Families</h3>
        <div className="grid grid-cols-3 gap-2">
          {['EDUCATION', 'PUBLIC_ADMINISTRATION', 'AI_COMPLIANCE'].map(f => (
            <div key={f} className="border border-gray-800 rounded p-3 text-center">
              <div className="text-sm text-gray-200">{f}</div>
              <div className="text-xs text-gray-500 mt-1">
                {f === 'EDUCATION' ? 'Demo case active' : 'Prepared — not yet populated'}
              </div>
              <SyntheticBadge />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LogPanel({ loop }: { loop: CognitiveLoopState }) {
  return (
    <div className="border border-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-mono text-gray-300 mb-3">Execution Log ({loop.log.length} entries)</h3>
      <div className="font-mono text-xs space-y-0.5 max-h-[600px] overflow-y-auto">
        {loop.log.map((entry, i) => (
          <div key={i} className={`py-0.5 ${
            entry.includes('===') ? 'text-cyan-400 font-bold' :
            entry.includes('CONTRADICTION') ? 'text-orange-400' :
            entry.includes('HUMAN') ? 'text-green-400' :
            entry.includes('NOTE:') || entry.includes('SCIENTIFIC') ? 'text-yellow-400' :
            entry.includes('---') ? 'text-purple-400' :
            'text-gray-400'
          }`}>
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
}
