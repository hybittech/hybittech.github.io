"""HC18DC binary encode/decode."""

from __future__ import annotations

import struct
import zlib
from typing import List

MAGIC = b"HC"
VERSION = 1


def encode_single(v: List[int]) -> bytes:
    """Encode a single hybit vector into HC18DC binary frame."""
    payload = bytes(v[0:18])  # type: ignore[index]
    crc = zlib.crc32(payload) & 0xFFFFFFFF
    return MAGIC + bytes([VERSION, 0x01]) + payload + bytes([1]) + struct.pack("<I", crc)


def decode(data: bytes) -> List[int]:
    """Decode an HC18DC binary frame into a hybit vector."""
    if len(data) < 27:
        raise ValueError(f"Frame too short: {len(data)} bytes")
    magic = data[0:2]  # type: ignore[index]
    ver = data[2]
    if magic != MAGIC:
        raise ValueError(f"Invalid magic: {magic!r}")
    if ver != VERSION:
        raise ValueError(f"Unknown version: {ver}")
    payload = data[4:22]  # type: ignore[index]
    crc_bytes = data[23:27]  # type: ignore[index]
    crc_expected = struct.unpack("<I", crc_bytes)[0]
    crc_actual = zlib.crc32(payload) & 0xFFFFFFFF
    if crc_actual != crc_expected:
        raise ValueError(f"CRC mismatch: {crc_actual:#x} != {crc_expected:#x}")
    return list(payload)
