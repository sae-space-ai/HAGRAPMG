# HAG-RAP LAB

## Human-Governed Deep Reasoning, Abstraction and Planning for Trustworthy Cognitive AI

### GREENFIELD SCIENTIFIC RESEARCH DEMONSTRATOR

**STATUS**: Research instrument — NOT a commercial product.  
**DATA**: All demonstration data is SYNTHETIC. No operational decisions are made.  
**MODE**: Deterministic laboratory mode — no external AI credentials required.

---

## Purpose

HAG-RAP LAB is an executable laboratory architecture capable of representing and experimentally testing the cognitive architecture defined by the HAG-RAP research proposal.

It implements the hypothesis that trustworthy cognitive performance requires structured coupling between:

- Learned Representations
- Typed Evidence
- Causal Structure
- Symbolic Constraints
- Abstraction
- Explicit World Models
- Hierarchical Planning
- Runtime Assurance
- Human Governance

## Architecture

```
src/
├── domain/
│   ├── types.ts           — Complete epistemic type system
│   ├── evidence-graph.ts  — Evidence Graph Memory (shared cognitive substrate)
│   └── engines.ts         — All reasoning/abstraction/planning/assurance engines
├── services/
│   └── cognitive-loop.ts  — Cognitive loop service + demonstration case + tests
├── App.tsx                — Research instrument UI
├── main.tsx               — Entry point
└── index.css              — Styles
```

## Implemented Capabilities

### IMPLEMENTED
- Evidence Graph Memory with typed relations and versioning
- Deductive reasoning (modus ponens, rule chaining)
- Abductive reasoning (hypothesis generation without auto-promotion)
- Defeasible reasoning (with exception handling and retraction)
- Contradiction detection and classification (preserved, not silently resolved)
- Causal model representation (distinguishing correlation from causation)
- Abstraction hierarchy (experimental, deterministic)
- World model with state variables and versioning
- Planning with alternatives, constraints, and safe stop
- Runtime monitors for critical invariants
- Human governance that changes computational state
- Resource-aware execution routing
- Provenance tracking (WHY? query)
- Change-of-mind tracking (WHAT_CHANGED? query)
- State snapshots and history preservation
- Complete demonstration case exercising the cognitive cycle

### EXPERIMENTAL
- Concept induction (deterministic/manual)
- Analogical transfer
- Applicability envelopes
- Emergent outcome module

### NOT_IMPLEMENTED
- Probabilistic inference
- SMT solver integration
- Model checker integration
- External LLM integration (by design — deterministic first)
- Multi-agent execution

## Scientific Honesty

This system adheres to the following principles:

1. No claim without evidence
2. No causal claim from correlation alone
3. No assumption presented as fact
4. No uncertainty hidden
5. No contradiction silently deleted
6. No plan without constraint checking
7. No material action without valid authority
8. No human approval inferred from silence
9. No scientific target presented as achieved result
10. No UI simulation presented as scientific capability
11. No history deleted when the system changes its mind
12. Deterministic first where determinism suffices

## Demonstration Case

The system includes a complete synthetic case (Education scenario) that exercises:
- Multiple evidence sources with different reliability
- One missing evidence item
- One assumption (challengeable)
- One contradiction (preserved and classified)
- Deductive, abductive, and defeasible reasoning
- Causal hypothesis (not promoted from correlation)
- Abstraction hierarchy
- World model
- Goal with constraints (including non-overridable)
- Multiple plan alternatives
- Perturbation and replanning
- Human challenge and correction
- Full provenance reconstruction

## Running

```bash
npm install
npm run dev      # Development server
npm run build    # Production build
npm run typecheck # TypeScript verification
```

## Test Results

The system includes 10 critical tests verifying:
- Provenance completeness
- Contradiction preservation
- Change-of-mind history
- Human authority
- Zero assumption (no fabricated conclusions)
- Safe stop availability
- Replanning capability
- Insufficient evidence handling
- WHY query functionality
- Resource accounting

## Limitations

- This is a demonstration architecture, not a validated scientific system
- No experiments have been run to measure HAG-RAP target metrics
- Causal reasoning is representational, not validated causal discovery
- Abstraction uses deterministic patterns, not learned concepts
- Planning is structural, not optimized
- No external data sources are connected
- Human study functionality is protocol preparation only

## License

Research software — HAG-RAP project.
