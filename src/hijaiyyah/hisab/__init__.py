"""
HISAB — Hijaiyyah Inter-System Standard for Auditable Bridging.

Public API for the HISAB protocol (Bab IV).
"""

from .protocol import (
    MAGIC,
    VERSION,
    FrameType,
    HisabFrame,
    ALL_GUARDS_PASS,
    HEADER_SIZE,
    GUARD_SIZE,
    DIGEST_SIZE,
    NIBBLE_PAIRS,
)
from .serialize import (
    serialize_letter,
    serialize_string,
    serialize_matrix,
    deserialize_letter_payload,
    deserialize_string_payload,
    deserialize_frame,
)
from .validate import (
    ValidationResult,
    ValidationReport,
    validate_frame,
)
from .digest import (
    compute_digest,
    verify_digest,
)

__all__ = [
    # Protocol
    "MAGIC",
    "VERSION",
    "FrameType",
    "HisabFrame",
    "ALL_GUARDS_PASS",
    "HEADER_SIZE",
    "GUARD_SIZE",
    "DIGEST_SIZE",
    "NIBBLE_PAIRS",
    # Serialization
    "serialize_letter",
    "serialize_string",
    "serialize_matrix",
    "deserialize_letter_payload",
    "deserialize_string_payload",
    "deserialize_frame",
    # Validation
    "ValidationResult",
    "ValidationReport",
    "validate_frame",
    # Digest
    "compute_digest",
    "verify_digest",
]
