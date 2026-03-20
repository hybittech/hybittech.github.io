# HC Language Specification v1.0

See `src/hijaiyyah/language/grammar.py` for the formal EBNF grammar.

## Types
- `int`, `float64`, `bool`, `char`, `string`
- `hybit` (primitive — 18D integer vector)
- `Delta` (14D signed difference vector)
- `Exomatrix` (5×5 structured matrix)

## Standard Library Modules
- `hm::vectronometry` — Field 1 (Ch 17-21)
- `hm::differential` — Field 2 (Ch 22-24)
- `hm::integral` — Field 3 (Ch 25-28)
- `hm::geometry` — Field 4 (Ch 29-31)
- `hm::exomatrix` — Field 5 (Ch 32-36)
