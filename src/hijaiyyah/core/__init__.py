"""Core layer: Master Table, codex types, guards, and constants."""

from .constants import H28_ALPHABET, V18_SLOTS, V14_SLOTS
from .codex_entry import CodexEntry
from .master_table import MasterTable, MASTER_TABLE
from .guards import guard_check, guard_detail
from .exomatrix import build_exomatrix
from .rom import pack_rom, unpack_rom
from .exceptions import (
    HijaiyyahError,
    GuardViolation,
    SealMismatch,
    EBNFSemanticError,
)
