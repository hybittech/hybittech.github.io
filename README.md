# Hijaiyyah Mathematics — HOM

**Hijaiyyah Operating Machine — Formal Computational Framework for Hijaiyyah Letterform Geometry**

Release: `HM-28-v1.0-HC18D` · © 2026 HMCL

---

## Overview

HOM maps 28 canonical Hijaiyyah letterforms to 18-dimensional integer vectors
through deterministic geometric decomposition. It provides a complete computational
stack from foundational data (L0) through GUI application, including:

- **Master Table** — 28×18 sealed dataset (252 bytes ROM)
- **Five Mathematical Fields** — Vectronometry, Differential, Integral, Geometry, Exomatrix
- **HC Language** — Hijaiyyah Codex programming language v1.0
- **H-ISA** — Hijaiyyah Instruction Set Architecture
- **HCVM** — Hijaiyyah Codex Virtual Machine
- **CSGi** — Canonical Skeleton Graph Interface
- **HGSS** — Guard + Signature System
- **HOM GUI** — 13-tab integrated development and analysis environment

---

## Quick Start

### Install

```bash
# Development mode (recommended)
pip install -e ".[dev]"

# Production mode
pip install .
```

### Launch GUI

```bash
python -m hijaiyyah
```

### Run Tests

```bash
pytest
```

### Lint & Type Check

```bash
ruff check src/
pyright
```

---

## Architecture

| Layer | Component | Description |
|-------|-----------|-------------|
| L0 | Master Table + CSGi | 28×18 sealed dataset + skeleton graph |
| L1 | HC / HL-18E | Programming language + formal grammar |
| L2 | H-ISA | Instruction set architecture |
| L3 | CMM-18C | Computation machine model |
| L4 | HCPU | 18D processor architecture |
| L5 | HCVM | Virtual machine runtime |
| L6 | HGSS | Guard + signature system |
| L7 | HC18DC | Data exchange format |
| GUI | HOM | Hijaiyyah Operating Machine |

---

## Project Structure

```text
src/hijaiyyah/
├── core/           L0: Master Table, CodexEntry, Guards, ROM
├── algebra/        Bab II: Five Mathematical Fields
├── language/       L1: HC Lexer, Parser, AST, Evaluator
├── hisa/           L2: Opcodes, Registers, Machine, Compiler
├── skeleton/       L0: CSGi Skeletonizer, Contractor
├── integrity/      Audit, Injectivity, Seal
├── theorems/       13 Theorem Tests
├── crypto/         L6: Hashing, Signing, Certificate
├── net/            L7: Codec, JSON Format, Server
├── release/        Release Synchronizer
└── gui/            HOM GUI (13 tabs)
    ├── app.py      Main application
    ├── theme.py    Theme & styling
    ├── widgets.py  Shared widgets
    └── tabs/       13 modular tab files
```

---

## Dataset Seal

| Field | Value |
|-------|-------|
| Release | HM-28-v1.0-HC18D |
| Letters | 28 |
| Dimensions | 18 (14 independent + 3 parity + 1 marker) |
| ROM Size | 252 bytes (nibble-packed) |
| Integrity | SHA-256 sealed |

---

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | System architecture (L0–L7) |
| [HC Language](docs/HC_LANGUAGE_SPEC.md) | HC syntax and semantics |
| [H-ISA Spec](docs/HISA_SPEC.md) | Instruction set specification |
| [CSGi Spec](docs/CSGI_SPEC.md) | Skeleton graph pipeline |
| [Engineering Standard](ENGINEERING_STANDARD.md) | Coding and project standards |
| [Contributing](CONTRIBUTING.md) | How to contribute |
| [Changelog](CHANGELOG.md) | Version history |

---

## License

**Proprietary — All Rights Reserved**

© 2026 Hijaiyyah Mathematics Computational Laboratory (HMCL)

Author: Firman Arief Hidayatullah
