# HAR — HISAB Alphabet Registry Specification

## Overview

HAR is a directory-structured registry that stores master tables,
validation reports, and geometry data per alphabet.

## Directory Structure

```
har/
├── manifest.json
├── HAR-001/            ← Hijaiyyah (CERTIFIED)
│   ├── meta.json
│   ├── canonical_lock.json
│   ├── master_table.json   (28 × 18)
│   ├── master_table.rom    (252 bytes)
│   ├── validation/
│   │   ├── guard_report.json
│   │   ├── inject_report.json
│   │   ├── r1r5_report.json
│   │   └── rank_analysis.json
│   ├── glyphs/*.hgeo
│   └── certificate.json
```

## Status Levels

| Status | Meaning |
|---|---|
| **CERTIFIED** | All validation passed, sealed |
| **PENDING** | Defined but not fully validated |
| **DRAFT** | Under development |

## Certification Requirements

- G1–G4: 100% PASS
- Injectivity: 100% unique pairs
- R1–R5: 100% PASS
- rank(M₁₄) = number of core dimensions

© 2026 HMCL
