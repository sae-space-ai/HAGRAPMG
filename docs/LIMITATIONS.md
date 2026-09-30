# HAG-RAP LAB — Limitations & Scientific Honesty

## What This System IS

A research instrument capable of representing and demonstrating the cognitive architecture proposed by the HAG-RAP research program.

## What This System IS NOT

- Not a validated scientific system
- Not an operational decision system
- Not a commercial product
- Not evidence of achieved HAG-RAP targets

## Scientific Status of Claims

| Claim | Status | Evidence |
|-------|--------|----------|
| ≥95% provenance completeness | TARGET | NOT_YET_MEASURED |
| ≥20% reasoning gain | TARGET | NOT_YET_MEASURED |
| ≥15% transfer gain | TARGET | NOT_YET_MEASURED |
| ≥80% valid plans | TARGET | NOT_YET_MEASURED |
| ≥40% compute reduction | TARGET | NOT_YET_MEASURED |
| TRL4 demonstrator | TARGET | NOT_YET_MEASURED |

## Implemented vs Validated

The system IMPLEMENTS the architecture. It does NOT VALIDATE the scientific hypothesis.

Validation requires:
- Controlled experiments with ground truth
- Statistical measurement against baselines
- Human participant studies (ethically approved)
- Independent replication

None of these have been performed.

## Component Limitations

### Reasoning Engine
- Deductive: Limited to explicitly encoded rules
- Abductive: Background knowledge must be manually provided
- Defeasible: Exception detection is structural, not learned
- Causal: Representational only — no causal discovery algorithm

### Abstraction Engine
- Uses deterministic pattern matching, not learned concepts
- No automatic concept formation from raw data
- Analogical transfer requires manual correspondence specification

### Planning Engine
- Plan generation is structural, not optimized
- No cost minimization or utility maximization
- Contingency branches are predefined, not discovered

### World Model
- State transitions are rule-based, not learned
- No predictive model training
- Error measurement requires ground truth (not always available)

### Assurance
- Formal verification limited to structural checks
- No SMT solver or model checker integrated
- Runtime monitors check graph invariants, not temporal properties

## Data Limitations

- All demonstration data is SYNTHETIC
- No real operational data is processed
- No real human participants are involved
- No real decisions affecting rights or welfare are made

## What Would Be Needed for Scientific Validation

1. Formal requirements authored by domain experts
2. Benchmark datasets with ground truth
3. Controlled experiments with statistical analysis
4. Human participant studies with ethical approval
5. Independent replication by third parties
6. Peer review of methodology and results

## Honest Reporting

This document exists to prevent:
- Overclaiming of system capabilities
- Confusion between architecture and validated science
- Use of the demonstrator as evidence of achieved results
- Deployment in operational contexts without validation

## Future Work

The architecture is designed to SUPPORT future scientific validation. The infrastructure for:
- Benchmark execution
- Experiment tracking
- Ablation studies
- Human study protocols

exists but has not been exercised with real scientific data.
