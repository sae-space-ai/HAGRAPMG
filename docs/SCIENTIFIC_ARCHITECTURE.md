# HAG-RAP LAB — Scientific Architecture

## Overview

HAG-RAP LAB implements a cognitive architecture where reasoning, abstraction, and planning form a coupled cycle rather than independent features.

## Core Hypothesis

Trustworthy cognitive performance does not emerge from scale alone. It requires structured coupling between:

1. Learned Representations
2. Typed Evidence  
3. Causal Structure
4. Symbolic Constraints
5. Abstraction
6. Explicit World Models
7. Hierarchical Planning
8. Runtime Assurance
9. Human Governance

## Fundamental Cognitive Loop

```
PROBLEM → EVIDENCE INGESTION → EVIDENCE GRAPH MEMORY →
FACTS/OBSERVATIONS → ASSUMPTIONS → UNCERTAINTIES →
CONTRADICTIONS → CAUSAL HYPOTHESES → MULTI-MODE REASONING →
JUSTIFICATION/PROOF TRACE → CONCEPT FORMATION → ABSTRACTION →
WORLD MODEL → GOALS → CONSTRAINTS → ALTERNATIVE PLANS →
COUNTERFACTUAL/SIMULATION → PLAN EVALUATION → HUMAN GOVERNANCE GATE →
CONTROLLED SIMULATION/ACTION → OBSERVED STATE → DEVIATION DETECTION →
REASON/REPLAN/STOP/ESCALATE → NEW EVIDENCE → UPDATED COGNITIVE STATE
```

The complete evolution remains inspectable. History is never overwritten merely because the system changes its conclusion.

## Component Architecture

### Evidence Graph Memory (WP2)
- Typed, version-aware shared cognitive substrate
- Relations: SOURCE→EVIDENCE→CLAIM→INFERENCE→CONCLUSION
- Contradictions preserved until explicitly resolved
- Never destroys conflicting evidence

### Deep Reasoning Engine (WP3)
- **Deductive**: Deterministic rule-based (modus ponens, chaining)
- **Abductive**: Candidate explanation generation (no auto-promotion)
- **Defeasible**: Default rules with exceptions and retraction
- **Causal**: Explicit causal representation (correlation ≠ causation)
- Each inference produces: inputs, method, rules, output, uncertainty, provenance

### Deep Abstraction Engine (WP4)
- Concept candidate generation (EXPERIMENTAL)
- Abstraction hierarchy/lattice
- Analogical transfer (relational structure, not lexical)
- Applicability envelopes with boundary conditions

### World Model (WP4-WP5 bridge)
- Versioned state representations
- State variables with uncertainty
- Transition mechanisms
- Predicted vs observed state comparison

### Deep Planning Engine (WP5)
- Hierarchical contingent planning
- Multiple plan alternatives (never auto-selects first)
- Constraint satisfaction checking
- Safe stop branches always generated
- Deviation detection and replanning

### Trust & Assurance (WP6)
- Runtime monitors for critical invariants
- Component contracts (inputs, assumptions, guarantees, failure states)
- Formal checks where feasible
- Non-overridable constraints enforced

### Human Governance
- Human intervention changes computational state
- Only HUMAN actors can authorize authority-requiring actions
- No approval inferred from silence
- Full provenance for every intervention
- CAPABILITY ≠ AUTHORITY

## Epistemic Types

The system distinguishes:
- ClaimStatus: OBSERVED, INFERRED, ASSUMED, CONTESTED, SUPERSEDED, UNKNOWN
- EvidenceStatus: AVAILABLE, MISSING, CONFLICTED, STALE, UNVERIFIED, VERIFIED
- UncertaintyType: ALEATORIC, EPISTEMIC, SOURCE_RELIABILITY, MODEL, NORMATIVE, UNKNOWN
- VerificationStatus: NOT_CHECKED, PASSED, FAILED, INCONCLUSIVE, NOT_APPLICABLE
- HumanDecisionStatus: PENDING, ACCEPTED, REJECTED, CORRECTED, OVERRIDDEN, STOPPED

UNKNOWN ≠ FALSE. UNKNOWN ≠ 0. UNKNOWN ≠ REJECTED.

## Scientific Status Labels

Every component is labeled:
- IMPLEMENTED: Functionally working and tested
- EXPERIMENTAL: Implemented but not validated as scientific result
- SIMULATED: Behavior simulated for demonstration
- PLACEHOLDER: Interface exists, implementation pending
- NOT_IMPLEMENTED: Not yet built
- NOT_TESTED: Built but not verified
- UNKNOWN: Status not yet determined
