# Release Policy — Matematika Hijaiyyah / HOM

## Version Scheme

```
HM-{letters}-v{major}.{minor}-HC{dim}D
```

Example: `HM-28-v1.0-HC18D`

- 28 = number of letters
- v1.0 = version
- HC18D = 18-dimensional Hijaiyyah Codex

## Integrity

Every release is sealed with:

1. **SHA-256** hash of dataset-seal
2. **CRC32** in .hbc headers
3. **Guard verification** (G1–G4: 112/112)
4. **Audit verification** (R1–R5: 140/140)
5. **Injectivity check** (378/378 unique)

## Determinism (Proposition 1.7.1)

Same dataset-seal + same protocol = same result.
If results differ, at least one of:
(a) dataset not identical, (b) protocol different, or
(c) implementation error.

## Release Artifacts

- `master_table.json` — sealed dataset
- `master_table.rom` — 252-byte nibble-packed ROM
- `certificate.json` — release certificate with SHA-256
- `MANIFEST.json` — all artifact hashes

© 2026 HMCL
