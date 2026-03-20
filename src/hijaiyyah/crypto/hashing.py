"""SHA-256 and canonical digest for hybit vectors."""

from __future__ import annotations

import hashlib
import json
from typing import Any, Dict, List


def sha256_bytes(data: bytes) -> str:
    """SHA-256 hex digest of raw bytes."""
    return hashlib.sha256(data).hexdigest()


def sha256_vector(v: List[int]) -> str:
    """SHA-256 of hybit vector (first 18 components as bytes)."""
    raw = bytes(v[0:18])  # type: ignore[misc]
    return hashlib.sha256(raw).hexdigest()


def canonical_digest(obj: Dict[str, Any]) -> str:
    """SHA-256 of canonicalized JSON object (sorted keys, no whitespace)."""
    encoded = json.dumps(obj, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()
