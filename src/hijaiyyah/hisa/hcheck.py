"""
HCHECK — Runtime Integrity Monitor.

Bab III §3.31: Detects corruption in HVM state.

Guard vs HCHECK distinction:
  Guard System = per-operation check (like type checker per statement)
  HCHECK       = periodic full-state scan (like memory sanitizer)

Guard answers: "Is this HCADD result a valid hybit?"
HCHECK answers: "Is R3 that held a valid hybit yesterday still valid now?"
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional

from ..core.guards import guard_check


@dataclass
class CorruptionReport:
    """Report from an HCHECK scan."""
    scan_cycle: int = 0
    registers_scanned: int = 0
    corruptions_found: int = 0
    details: List[str] = field(default_factory=list)

    @property
    def clean(self) -> bool:
        return self.corruptions_found == 0


class HCHECK:
    """
    Runtime integrity monitor.

    Periodically scans all H-registers and validates:
      1. No negative components (bit flip detection)
      2. Guard G1–G4, T1–T2 on non-zero registers
      3. Stack consistency
    """

    def __init__(self, interval: int = 100) -> None:
        """
        Args:
            interval: Scan every N instructions. 0 = disabled.
        """
        self.interval = interval
        self.reports: List[CorruptionReport] = []

    def scan(
        self,
        hreg: List[List[int]],
        stack: Optional[List[int]] = None,
        cycle: int = 0,
    ) -> CorruptionReport:
        """
        Full integrity scan of register file and stack.

        Args:
            hreg: List of H-register contents (each is 18-int list).
            stack: Optional stack contents.
            cycle: Current execution cycle.

        Returns:
            CorruptionReport with details of any corruption found.
        """
        report = CorruptionReport(scan_cycle=cycle)

        for i, h in enumerate(hreg):
            report.registers_scanned += 1

            # Check 1: negative components (possible bit flip)
            if any(x < 0 for x in h):
                report.corruptions_found += 1
                neg_indices = [j for j, x in enumerate(h) if x < 0]
                report.details.append(
                    f"H{i}: negative components at indices {neg_indices}"
                )
                continue

            # Check 2: guard validation on non-zero registers
            if any(x != 0 for x in h):
                # Only validate registers that have aggregate fields set
                # (indicating they hold codex data, not projection/delta results)
                has_aggregates = h[14] != 0 or h[15] != 0 or h[16] != 0
                if has_aggregates and not guard_check(h):
                    report.corruptions_found += 1
                    report.details.append(
                        f"H{i}: guard check failed — possible memory corruption"
                    )

        # Check 3: stack consistency
        if stack is not None:
            for i, val in enumerate(stack):
                if not isinstance(val, int):
                    report.corruptions_found += 1
                    report.details.append(
                        f"Stack[{i}]: non-integer value {type(val).__name__}"
                    )

        self.reports.append(report)
        return report

    def should_scan(self, cycle: int) -> bool:
        """Check if a scan is due at this cycle."""
        if self.interval <= 0:
            return False
        return cycle > 0 and cycle % self.interval == 0

    @property
    def total_scans(self) -> int:
        return len(self.reports)

    @property
    def total_corruptions(self) -> int:
        return sum(r.corruptions_found for r in self.reports)
