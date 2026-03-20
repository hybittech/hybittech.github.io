#!/usr/bin/env python3
"""Generate hm28.rom from Master Table."""

from __future__ import annotations

import os
import sys

# Runtime path setup
_src_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src")
if _src_path not in sys.path:
    sys.path.insert(0, _src_path)

from hijaiyyah.core.master_table import MASTER_TABLE  # noqa: E402
from hijaiyyah.core.rom import pack_rom, rom_sha256  # noqa: E402


def main() -> None:
    """Generate the 252-byte ROM image."""
    vectors = [list(e.vector) for e in MASTER_TABLE.all_entries()]
    rom = pack_rom(vectors)

    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "hm28.rom")
    with open(output_path, "wb") as f:
        f.write(rom)

    print(f"Written: {output_path}")
    print(f"Size:    {len(rom)} bytes")
    print(f"SHA-256: {rom_sha256(rom)}")


if __name__ == "__main__":
    main()
