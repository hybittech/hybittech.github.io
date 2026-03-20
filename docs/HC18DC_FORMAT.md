# HC18DC — Hybit Codex 18D Canonical Data Format

## Binary Frame
```
[MAGIC:2][VERSION:1][TYPE:1][PAYLOAD:N×18][GUARD:1][CRC32:4]
```

## JSON Format
```json
{"format":"HC18DC","version":"1.0","v18":[...],"guard":"PASS","hash":"..."}
```

See `src/hijaiyyah/net/` for implementation.
