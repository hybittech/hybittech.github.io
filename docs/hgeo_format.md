# .hgeo — Hybit Geometry File Specification

## Overview

| Property | Value |
|---|---|
| Extension | `.hgeo` |
| Encoding | JSON (UTF-8, NFC) |
| Purpose | Store geometry extraction results per glyph |
| Producer | Ψ-Compiler |
| Consumer | HAR assembly pipeline |

## Structure

A .hgeo file contains the complete provenance chain from
canonical font to v₁₈ codex vector:

| Section | Content | Bab I Reference |
|---|---|---|
| `canonical_lock` | Font + SHA-256 + resolution | §1.6.1 |
| `extraction_params` | Algorithm, adjacency, thresholds | §1.20.4 |
| `skeleton` | Nodes + edges + polylines | §1.19–1.20 |
| `dots` | Nuqṭah centroids + zones | §1.14 |
| `mainpath` | Node/edge sequence + status | §1.21 |
| `measurement` | Θ̂, N, K, Q, U, ρ, A_N, A_K, A_Q, H* | §1.3 |
| `v18` | Final 18D codex vector | §1.28 |
| `guard_status` | G1–G4, T1–T2 results | §3.3 |
| `digest` | SHA-256 of measurement | §1.7 |

## Audit

Every value in v₁₈ can be traced back through the .hgeo
to its geometric origin in the skeleton.

© 2026 HMCL
