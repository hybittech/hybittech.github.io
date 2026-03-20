# Contributing to HOM

## Hijaiyyah Operating Machine — Contribution Guidelines

Thank you for your interest in contributing to HOM.

---

## Code of Conduct

All contributors must adhere to the [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Getting Started

### Prerequisites

- Python 3.11+
- Git

### Setup

```bash
git clone https://github.com/hijaiyyahtech/HOM.git
cd HOM
pip install -e ".[dev]"
```

### Run the Application

```bash
python -m hijaiyyah
```

### Run Tests

```bash
pytest
```

---

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable release |
| `dev` | Active development |
| `feature/*` | New features |
| `fix/*` | Bug fixes |
| `release/*` | Release preparation |

---

## Commit Message Format

```text
[module] short description

- detail 1
- detail 2
```

### Examples

```text
[core] fix master table guard validation

- added checksum verification on load
- added topology guard for Ks/Kc
```

```text
[gui] add CSGi skeleton viewer

- integrated PIL image display
- added Zhang-Suen thinning pipeline
```

---

## Coding Standards

Please follow the [Engineering Standard](ENGINEERING_STANDARD.md) for:

- **Naming conventions** (§7.2)
- **Import ordering** (§7.3)
- **Docstring requirements** (§7.4)
- **Architecture layer rules** (§8)
- **Type hints** — mandatory for all function signatures

---

## Pull Request Checklist

Before submitting a PR:

- [ ] All tests pass (`pytest`)
- [ ] Code passes lint (`ruff check src/`)
- [ ] Type checking passes (`pyright`)
- [ ] New code has docstrings
- [ ] New functions have type hints
- [ ] Commit messages follow the standard format
- [ ] No `__pycache__/`, `.env`, or secrets committed

---

## Architecture Rules

| Rule | Description |
|------|-------------|
| GUI ≠ Logic | GUI tabs only render; domain logic lives in `core/`, `algebra/`, etc. |
| Core ≠ GUI | `core/` must never import `gui/` |
| Testable | Every module must be testable without GUI |
| Modular | One tab = one file in `gui/tabs/` |

---

## Reporting Issues

Please use GitHub Issues with clear:
- **Title**: `[module] short description`
- **Description**: what happened, what was expected, steps to reproduce
- **Environment**: Python version, OS, HOM version

---

## License

This project is **Proprietary — All Rights Reserved** (© 2026 HMCL).
Contributions are accepted under the same license terms.
