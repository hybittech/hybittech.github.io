# CSGi — Canonical Skeleton Graph Interface

## Purpose
Converts glyph images to skeleton graphs for geometric analysis.

## Pipeline
1. Binarization (Otsu threshold)
2. Nuqtah separation (connected component analysis)
3. Skeletonization (Zhang-Suen thinning)
4. Graph construction (8-neighborhood adjacency)
5. Pruning and simplification

See `src/hijaiyyah/skeleton/` for implementation.
