# Security Policy

## HOM — Hijaiyyah Operating Machine

### Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅ Active |

### Reporting a Vulnerability

If you discover a security vulnerability in HOM, please report it responsibly:

1. **Do NOT** create a public GitHub issue.
2. Contact the maintainers directly via the repository's security advisories.
3. Provide a detailed description of the vulnerability, including:
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if applicable)

### Response Timeline

- **Acknowledgment**: within 48 hours
- **Initial assessment**: within 7 days
- **Fix or mitigation**: as soon as possible, depending on severity

### Security Scope

| Component | Security Level | Notes |
|-----------|---------------|-------|
| Master Table (L0) | Integrity sealed | SHA-256 checksum verification |
| Guards (G1–G4) | Structural validation | Not cryptographic authentication |
| HGSS (L6) | Crypto layer | Hash + signature system |
| HC Language (L1) | Sandboxed evaluation | No file system access from HC |

### Important Clarification

> **Guards ≠ Full Cryptography**
>
> - Guards (G1–G4) provide **structural validation** of hybit vectors.
> - HGSS provides a **cryptographic layer** for hashing and signing.
> - Neither replaces PKI/TLS/SSL for network communication.

### What Must Never Be Committed

| Data | Reason |
|------|--------|
| API keys | Sensitive |
| Private keys | Sensitive |
| Passwords | Sensitive |
| `.env` files | Contains secrets |

---

© 2026 Hijaiyyah Mathematics Computational Laboratory (HMCL)
