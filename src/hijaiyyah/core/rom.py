"""
ROM generator and loader for the 252-byte Master Table.
Format: 28 letters × 18 nibbles = 28 × 9 bytes = 252 bytes.
"""

from __future__ import annotations

import hashlib
from typing import List


def pack_nibbles(v18: List[int]) -> bytes:
    """Pack 18 uint4 values into 9 bytes (high nibble first)."""
    if len(v18) != 18:
        raise ValueError(f"Expected 18 values, got {len(v18)}")
    for x in v18:
        if not (0 <= x <= 15):
            raise ValueError(f"Value {x} does not fit in 4 bits")
    out = bytearray(9)
    for i in range(9):
        hi = v18[2 * i]
        lo = v18[2 * i + 1]
        out[i] = (hi << 4) | lo
    return bytes(out)


def unpack_nibbles(data: bytes) -> List[int]:
    """Unpack 9 bytes into 18 uint4 values."""
    if len(data) != 9:
        raise ValueError(f"Expected 9 bytes, got {len(data)}")
    result: List[int] = []
    for b in data:
        result.append((b >> 4) & 0x0F)
        result.append(b & 0x0F)
    return result


def pack_rom(vectors: List[List[int]]) -> bytes:
    """Pack 28 vectors into 252-byte ROM image."""
    if len(vectors) != 28:
        raise ValueError(f"Expected 28 vectors, got {len(vectors)}")
    parts: List[bytes] = []
    for v in vectors:
        parts.append(pack_nibbles(v))
    rom = b"".join(parts)
    if len(rom) != 252:
        raise ValueError(f"ROM size {len(rom)}, expected 252")
    return rom


def unpack_rom(data: bytes) -> List[List[int]]:
    """Unpack 252-byte ROM into 28 vectors."""
    if len(data) != 252:
        raise ValueError(f"Expected 252 bytes, got {len(data)}")
    vectors: List[List[int]] = []
    for i in range(28):
        start = i * 9
        end = start + 9
        chunk = data[start:end]
        vectors.append(unpack_nibbles(chunk))
    return vectors


def rom_sha256(data: bytes) -> str:
    """Compute SHA-256 of ROM image."""
    return hashlib.sha256(data).hexdigest()
