# HISAB — Hijaiyyah Inter-System Standard for Auditable Bridging

## Overview

HISAB defines the serialization, validation, and exchange
protocol for hybit data across systems.

## Frame Types

| Frame | Size | Content |
|---|---|---|
| LETTER | 9 bytes (nibble-packed) | Single hybit v₁₈ |
| STRING | 36 bytes (word-packed) | Aggregated string codex |
| MATRIX | 25 bytes | Exomatrix 5×5 |
| DELTA | Variable | Differential vector |
| TABLE | Variable | Full master table |

## Validation Pipeline (3-level)

1. **Structural** — magic bytes, CRC32, length
2. **Guard** — G1–G4, T1–T2 on decoded vector
3. **Semantic** — cross-reference with Master Table

## Key Properties

- Round-trip fidelity: D(S(h*)) = h* for all 28 letters
- Injectivity: 28 unique frames
- Guard preservation: all guards pass after deserialization
- Dual detection: CRC32 + guard (~2.3× redundancy)

## Magic

All HISAB frames start with `0x4842` ("HB").

© 2026 HMCL
