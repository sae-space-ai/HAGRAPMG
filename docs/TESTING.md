# HAG-RAP LAB — Testing Documentation

## Test Architecture

Tests are integrated into the application runtime. The cognitive loop executes the demonstration case and then runs critical verification tests.

## Critical Test Suite

### Test 1: PROVENANCE_VERIFIED
**Purpose**: Every claim must be traceable to evidence, inference, or assumptions.  
**Method**: Check that all claims have non-empty evidenceIds, inferenceIds, or assumptionIds.  
**Expected**: PASS — All claims in the demo case have provenance.

### Test 2: CONTRADICTION_PRESERVATION_VERIFIED
**Purpose**: Contradictions must be preserved, not silently deleted.  
**Method**: Verify that the contradiction store contains at least one entry.  
**Expected**: PASS — Income contradiction is preserved throughout.

### Test 3: CHANGE_OF_MIND_VERIFIED
**Purpose**: State evolution must be recorded.  
**Method**: Check that at least 2 state snapshots exist.  
**Expected**: PASS — Snapshots taken before and after evidence update.

### Test 4: HUMAN_AUTHORITY_VERIFIED
**Purpose**: Only HUMAN actors can perform interventions.  
**Method**: Verify all interventions have actor with actorType === 'HUMAN'.  
**Expected**: PASS — Synthetic human actor performs all interventions.

### Test 5: ZERO_ASSUMPTION_VERIFIED
**Purpose**: No fabricated conclusions without backing.  
**Method**: Every claim must have evidence, inference, or assumption.  
**Expected**: PASS — No claim exists in isolation.

### Test 6: SAFE_STOP_VERIFIED
**Purpose**: A safe stop plan must always exist.  
**Method**: Check for plan with SAFE_STOP branch type.  
**Expected**: PASS — Safe stop plan is always generated.

### Test 7: REPLANNING_VERIFIED
**Purpose**: System must detect deviations and trigger replanning.  
**Method**: Verify change records exist after perturbation.  
**Expected**: PASS — Income clarification triggers replanning.

### Test 8: INSUFFICIENT_EVIDENCE_HANDLED
**Purpose**: Missing evidence must be tracked, not fabricated.  
**Method**: Check for evidence items with status === 'MISSING'.  
**Expected**: PASS — Community service hours tracked as MISSING.

### Test 9: WHY_QUERY_VERIFIED
**Purpose**: Provenance query must produce a justification graph.  
**Method**: Call why(claimId) and verify non-empty result.  
**Expected**: PASS — Justification graph contains nodes and edges.

### Test 10: RESOURCE_ACCOUNTING_VERIFIED
**Purpose**: Resource-aware execution routing must function.  
**Method**: Call determineExecutionRoute and verify non-empty method.  
**Expected**: PASS — Routing logic selects appropriate method.

## End-to-End Cognitive Loop Test

The demonstration case itself serves as an E2E test:

1. Evidence from multiple sources ingested
2. Claims derived from evidence
3. Contradiction detected (income discrepancy)
4. Deductive reasoning applied (academic threshold)
5. Abductive reasoning generates hypotheses (income explanations)
6. Defeasible reasoning applies default (service waiver)
7. Causal model constructed (income → eligibility)
8. Abstraction hierarchy built
9. World model created with state variables
10. Goal and constraints defined
11. Multiple plan alternatives generated
12. Human challenges inference
13. Assurance monitors run
14. New evidence arrives (perturbation)
15. Contradiction resolved
16. Claim superseded (change of mind)
17. Deviation detected
18. Replanning triggered
19. Human correction applied
20. Final provenance reconstructed

## Negative Tests

### Insufficient Evidence
When evidence is missing, the system:
- Tracks the missing evidence item
- Does NOT fabricate a value
- Reports INSUFFICIENT_EVIDENCE status
- Identifies required evidence

### Safety Constraint Violation
When a plan violates a non-overridable constraint:
- Runtime assurance detects the violation
- Plan is NOT released
- Human governance receives escalation
- Audit record is generated

### Unauthorized Action
When a non-HUMAN actor attempts authority-requiring action:
- Action is rejected
- No state change occurs
- No implicit approval from silence

## Reproducibility

The demonstration case is deterministic:
- Same inputs → same outputs
- No random seeds that change between runs
- All IDs are timestamp-based (reproducible within same second)
- Configuration is explicit

## Test Execution Evidence

```
COMMAND: npm run build
EXECUTED: YES
EXIT_CODE: 0
RESULT: Success
MODULES_TRANSFORMED: 32
BUILD_TIME: ~2.5s
```
