# Hybit Pipeline Specification

## Complete Architecture

```
.hc → HCC (6-stage) → .hasm → HASM (4-pass) → .hbc → HVM (5-component) → OUTPUT
                                                  ↑
Font (sealed) → Ψ-Compiler → .hgeo → HAR ────────┘
```

## Components

| Component | Function | Status |
|---|---|---|
| .hc | HC source code | OPERATIONAL |
| HCC | Compiler (Lex→Parse→Sem→Ψ→Gen→Asm) | PARTIAL |
| .hasm | H-ISA assembly text | SPECIFIED |
| HASM | Assembler (4-pass) | SPECIFIED |
| .hbc | Bytecode binary (magic "HBYT") | SPECIFIED |
| .hgeo | Geometry extraction per glyph | SPECIFIED |
| HAR | Alphabet registry (multi-alphabet) | PARTIAL |
| HVM | Virtual machine (5 components) | OPERATIONAL |
| Guard | Per-operation validation G1–G4 | OPERATIONAL |
| HCHECK | Periodic integrity monitor | SPECIFIED |
| HOS | Operating system | DESIGNED |
| HFS | File system (guard-on-write) | DESIGNED |
| H-Kernel | Kernel (18-wide alignment) | DESIGNED |

## Principle: No Overlap

Every component has exactly ONE function.
See README for the full non-overlap table.

© 2026 HMCL
