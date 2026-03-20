# Architecture — Hijaiyyah Mathematics

## Layer Stack

| Layer | Component | Description |
|-------|-----------|-------------|
| L0 | Master Table + CSGI | Formal domain and dataset |
| L1 | HL-18E / HC | Language specification |
| L2 | H-ISA | Instruction set architecture |
| L3 | CMM-18C | Computation machine model |
| L4 | HCPU | Processor architecture |
| L5 | HCVM | Virtual machine / runtime |
| L6 | HGSS | Guard + signature system |
| L7 | HC18DC | Data exchange format |

## Data Flow

```
Source (.hc) → Lexer → Parser → AST → Evaluator → Result
                                  ↓
                            H-ISA Bytecode → HCVM
```

See HC_LANGUAGE_SPEC.md for language details.
