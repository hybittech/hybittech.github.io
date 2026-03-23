# .hbc — Hybit Bytecode Format Specification

## Overview

| Property | Value |
|---|---|
| Extension | `.hbc` |
| Encoding | Binary (little-endian) |
| Magic | `"HBYT"` (0x48425954) |
| Header size | 32 bytes |
| Producer | HASM assembler / HCC compiler |
| Consumer | HVM (Hybit Virtual Machine) |

## Header Structure (32 bytes)

| Offset | Size | Field | Description |
|---|---|---|---|
| 0 | 4 | Magic | `0x48425954` ("HBYT") |
| 4 | 2 | Version | `(major << 8) \| minor` |
| 6 | 2 | HAR-ID | Primary alphabet (0x0001 = Hijaiyyah) |
| 8 | 2 | Flags | Operation mode flags |
| 10 | 4 | Entry point | Offset into code section |
| 14 | 4 | Const offset | Offset to constant pool |
| 18 | 4 | Code offset | Offset to code section |
| 22 | 4 | Code size | Code section size (bytes) |
| 26 | 4 | Data offset | Offset to data section |
| 30 | 2 | Data size | Data section size (bytes) |
| 28 | 4 | Checksum | CRC32 of bytes 0–27 |

## Flags

| Bit | Name | Description |
|---|---|---|
| 0 | `HAS_DEBUG` | Debug info present |
| 1 | `HAS_PSI` | Ψ-augmented source |
| 2 | `GUARD_STRICT` | Every HCADD requires guard check |
| 3 | `HAR_EMBEDDED` | HAR data embedded in .hbc |

## Instruction Encoding

```
[opcode: 1 byte][fmt: 1 byte][operands: 0–8 bytes]
```

See `docs/hisa_spec.md` for the complete opcode table.

## Verification

1. Check magic == `0x48425954`
2. Verify CRC32 of header bytes 0–27 matches byte 28–31
3. Verify HAR-ID corresponds to a loaded registry

© 2026 HMCL
