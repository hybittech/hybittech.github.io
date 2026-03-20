"""Zhang-Suen thinning algorithm for binary image skeletonization."""

from __future__ import annotations

from typing import List, Tuple

import numpy as np


def zhang_suen_thinness(image: np.ndarray) -> np.ndarray:
    """
    Zhang-Suen morphological thinning.

    Input:  binary image (1 = foreground, 0 = background), dtype uint8
    Output: skeleton image (1 = skeleton, 0 = background), dtype uint8
    """
    skel = image.copy().astype(np.uint8)
    rows, cols = skel.shape
    changed = True

    while changed:
        changed = False

        for step in (0, 1):
            marked: List[Tuple[int, int]] = []

            for i in range(1, rows - 1):
                for j in range(1, cols - 1):
                    if skel[i, j] == 0:
                        continue

                    # 8-neighborhood (clockwise from top)
                    p2 = int(skel[i - 1, j])
                    p3 = int(skel[i - 1, j + 1])
                    p4 = int(skel[i, j + 1])
                    p5 = int(skel[i + 1, j + 1])
                    p6 = int(skel[i + 1, j])
                    p7 = int(skel[i + 1, j - 1])
                    p8 = int(skel[i, j - 1])
                    p9 = int(skel[i - 1, j - 1])

                    neighbors = [p2, p3, p4, p5, p6, p7, p8, p9]

                    # B(P): number of nonzero neighbors
                    B = sum(neighbors)
                    if B < 2 or B > 6:
                        continue

                    # A(P): 0→1 transitions in clockwise order
                    A = 0
                    for k in range(8):
                        if neighbors[k] == 0 and neighbors[(k + 1) % 8] == 1:
                            A += 1
                    if A != 1:
                        continue

                    # Step conditions
                    if step == 0:
                        if p2 * p4 * p6 != 0:
                            continue
                        if p4 * p6 * p8 != 0:
                            continue
                    else:
                        if p2 * p4 * p8 != 0:
                            continue
                        if p2 * p6 * p8 != 0:
                            continue

                    marked.append((i, j))

            for mi, mj in marked:
                skel[mi, mj] = 0
                changed = True

    return skel
