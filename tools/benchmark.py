#!/usr/bin/env python3
"""Performance benchmarking for theorem suite."""

from __future__ import annotations

import os
import sys
import time

# Runtime path setup
_src_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src")
if _src_path not in sys.path:
    sys.path.insert(0, _src_path)

from hijaiyyah.theorems.test_suite import TheoremTestSuite  # noqa: E402


def main() -> None:
    """Run all theorem tests and report timing."""
    print("Running 13 theorem tests...")

    start = time.perf_counter()
    suite = TheoremTestSuite()
    results = suite.run_all()
    elapsed = time.perf_counter() - start

    passed = sum(1 for r in results if r.passed)
    failed = len(results) - passed

    print(f"\nResults: {passed}/{len(results)} passed in {elapsed * 1000:.1f} ms")

    if failed > 0:
        print("\nFailed tests:")
        for r in results:
            if not r.passed:
                print(f"  [{r.ref}] {r.name}: {r.message}")


if __name__ == "__main__":
    main()
