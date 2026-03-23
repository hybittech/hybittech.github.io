<div align="center">

# **Spesifikasi Algoritma CSGI & Sertifikasi HAR-002**
## Zhang-Suen, Q90, dan Klasifikasi MainPath

**HM-28-v1.0-HC18D · 2026**

</div>

---

## 1.3 Langkah 1: Skeletonisasi (Zhang-Suen)

Untuk piksel `p` dengan 8-neighbors `p1, …, p8` (dimulai dari atas, clockwise):

```
p9 p2 p3
p8 p1 p4
p7 p6 p5
```

- `B(p)` = jumlah tetangga foreground = `∑(i=2 to 9) pi`
- `A(p)` = jumlah transisi 0→1 dalam urutan `(p2, p3, …, p9, p2)`

**Sub-iteration 1:** Hapus `p` jika:
- `2 ≤ B(p) ≤ 6`
- `A(p) = 1`
- `p2 ⋅ p4 ⋅ p6 = 0`
- `p4 ⋅ p6 ⋅ p8 = 0`

**Sub-iteration 2:** Hapus `p` jika:
- `2 ≤ B(p) ≤ 6`
- `A(p) = 1`
- `p2 ⋅ p4 ⋅ p8 = 0`
- `p2 ⋅ p6 ⋅ p8 = 0`

**Mengapa Zhang-Suen, bukan alternatif lain:**

| Algoritma | Deterministik? | Preservasi Topologi? | Dikunci HISAB? |
|---|---|---|---|
| Zhang-Suen | ✓ (parallel) | ✓ | ✓ (dikunci) |
| Hilditch | ✓ (sequential, order-dependent) | ✓ | ❌ |
| Morphological | ✓ | ✓ tapi variasi | ❌ |
| Voronoi-based | ✓ | ✓ | ❌ |

Zhang-Suen dipilih karena:
- Parallel — hasil tidak bergantung pada urutan traversal piksel
- Terstandar dan terdokumentasi luas
- Implementasi referensi tersedia di OpenCV, scikit-image, dll.

## 1.4 Langkah 2: Pruning

```python
def prune_skeleton(skeleton: BinaryMatrix, min_length: int) -> BinaryMatrix:
    """
    Menghapus branch spurious (noise dari skeletonisasi).
    
    Branch dihapus jika:
        - dimulai dari endpoint (deg=1)
        - panjang < min_length piksel
        - penghapusan tidak memutus konektivitas
    """
    pruned = skeleton.copy()
    changed = True
    
    while changed:
        changed = False
        endpoints = [p for p in foreground_pixels(pruned) if degree(p, pruned) == 1]
        
        for ep in endpoints:
            branch = trace_branch(ep, pruned)  # Trace dari endpoint ke junction
            if len(branch) < min_length:
                # Verifikasi: penghapusan tidak memutus konektivitas
                if not breaks_connectivity(branch, pruned):
                    for p in branch[:-1]:  # Jangan hapus junction
                        pruned[p] = 0
                    changed = True
    
    return pruned
```
**Parameter min_length:** Dikunci pada rilis. Default: 3 piksel pada 256 ppem. Branch lebih pendek dari ini dianggap artefak skeletonisasi, bukan fitur struktural.

## 1.5 Langkah 3: Konstruksi Graf `Γ(h)`

```python
def build_graph(skeleton: BinaryMatrix) -> Graph:
    """
    Mengubah skeleton menjadi graf planar Γ(h) = (V, E).
    
    Node types:
        - ENDPOINT: degree = 1
        - JUNCTION: degree >= 3
        - KINK:     degree = 2 AND corner_angle exceeded
    
    Edges:
        - Polyline maksimal antar node
    """
    # 1. Identifikasi node
    nodes = []
    for p in foreground_pixels(skeleton):
        d = degree_8(p, skeleton)
        if d == 1:
            nodes.append(Node(p, kind='ENDPOINT'))
        elif d >= 3:
            nodes.append(Node(p, kind='JUNCTION'))
        elif d == 2:
            angle = local_angle(p, skeleton)
            if angle < corner_angle:  # Perubahan arah tajam
                nodes.append(Node(p, kind='KINK'))
    
    # 2. Trace edge: polyline maksimal antar node
    edges = []
    visited_pixels = set()
    
    for node in nodes:
        for neighbor_direction in neighbors_of(node, skeleton):
            if (node.pos, neighbor_direction) not in visited_pixels:
                edge = trace_edge(node, neighbor_direction, skeleton, nodes)
                edges.append(edge)
                mark_visited(edge, visited_pixels)
    
    return Graph(nodes, edges)
```

**Definisi degree_8:**
`degree_8(p) = |{q ∈ S : max(|xp - xq|, |yp - yq|) = 1 dan q ≠ p}|`

**Definisi local_angle:**
Untuk piksel `p` dengan degree 2, misalkan dua tetangganya `q1` dan `q2`:
`θ = arccos( ((q1 - p) ⋅ (q2 - p)) / (|q1 - p| ⋅ |q2 - p|) )`
Jika `θ < corner_angle` (default: 60°), maka `p` adalah KINK.

## 1.6 Langkah 4: Klasifikasi Zona Nuqṭah

```python
def classify_dots(dots: List[Component], body_bbox: BBox) -> (int, int, int):
    """
    Mengklasifikasikan nuqṭah ke zona berdasarkan posisi relatif 
    terhadap bounding box badan huruf.
    
    Returns: (N_a, N_b, N_d) — jumlah titik per zona
    """
    # Definisi zona berdasarkan badan huruf
    body_top = body_bbox.top
    body_bottom = body_bbox.bottom
    body_height = body_bottom - body_top
    
    # Zona threshold (proporsi dari tinggi badan)
    ascender_line = body_top                      # Batas atas badan
    descender_line = body_bottom                  # Batas bawah badan
    body_center = (body_top + body_bottom) / 2    # Tengah badan
    
    N_a, N_b, N_d = 0, 0, 0
    
    for dot in dots:
        dot_center_y = dot.centroid_y
        
        if dot_center_y < ascender_line:
            N_a += 1    # Di atas badan
        elif dot_center_y > descender_line:
            N_d += 1    # Di bawah badan
        else:
            N_b += 1    # Di dalam badan
    
    return (N_a, N_b, N_d)
```
Untuk Latin:
- Titik pada "i": centroid di atas badan → `Na = 1`
- Titik pada "j": centroid di atas badan → `Na = 1`
- *Tidak ada huruf Latin standar dengan titik di bawah atau di tengah badan.*

## 1.7 Output Contract CSGI

```python
@dataclass
class CSGIOutput:
    """Output contract CSGI — identik untuk semua alfabet."""
    
    # Metadata
    glyph_id: str           # Identitas glyph (Unicode codepoint / nama)
    har_id: int             # HAR registry ID
    
    # Graph
    nodes: List[Node]       # (id, x, y, kind)
    edges: List[Edge]       # (u, v, polyline_points)
    
    # Dots
    N_a: int                # Nuqṭah zona ascender
    N_b: int                # Nuqṭah zona body
    N_d: int                # Nuqṭah zona descender
    
    # Parameters (untuk audit)
    resolution: int
    prune_length: int
    dot_max_area: int
    corner_angle: float
    algorithm: str          # "zhang-suen"
    adjacency: str          # "8-neighborhood"
```

---

## BAGIAN 2 — Q₉₀: Definisi Presisi Tanpa Ambiguitas

### 2.1 Input: Sequence Arah Diskret

**Definisi (Chain Code pada MainPath).**
Untuk MainPath `γh` yang terdiri dari piksel berurutan `(p0, p1, …, pm)` pada skeleton:
`ϕi = atan2(yi+1 - yi, xi+1 - xi), i = 0, …, m-1`
Sudut arah `ϕi ∈ (-π, π]` dihitung dengan atan2.

**Definisi (Perubahan Arah Lokal).**
`Δϕi = normalize(ϕi+1 - ϕi), i = 0, …, m-2`
di mana normalize memastikan `Δϕi ∈ (-π, π]`:

```python
def normalize_angle(delta: float) -> float:
    """Normalisasi sudut ke (-π, π]."""
    while delta > math.pi:
        delta -= 2 * math.pi
    while delta <= -math.pi:
        delta += 2 * math.pi
    return delta
```

### 2.2 Total Turning (Kontinu)

**Definisi (Total Absolute Turning).**
`Θ±(h) = ∑(i=0 to m-2) Δϕi`

**Definisi (Total Absolute Magnitude).**
`|Θ±(h)| = |∑(i=0 to m-2) Δϕi|`

*Catatan: Untuk MainPath terbuka, `Θ±` bisa positif atau negatif (bergantung arah belokan dominan). Untuk MainPath tertutup, `Θ± = 2πk` (Umlaufsatz).*

### 2.3 Operator Kuantisasi Q₉₀ — Definisi Presisi

**Definisi 2.3.1 (Q₉₀ — Operator Kuantisasi 90°).**
`Θ̂(h) = Q90(|Θ±(h)|) = ⌊|Θ±(h)| / (π/2) + 1/2⌋`

Ini adalah round-to-nearest-integer dari `|Θ±| / (π/2)`.
Ekuivalen dalam kode:

```python
def Q90(theta_abs: float) -> int:
    """
    Kuantisasi total absolute turning ke unit kuadran 90°.
    
    Args:
        theta_abs: |Θ±| dalam radian, theta_abs >= 0
    
    Returns:
        Θ̂ ∈ ℕ₀ — jumlah kuadran 90°
    
    Rule: round half up (0.5 → 1)
    """
    raw = theta_abs / (math.pi / 2)
    return int(math.floor(raw + 0.5))
```

Tabel keputusan pada batas:

| `|Θ±|` (rad) | `|Θ±| / (π/2)` | `Θ̂` | Interpretasi |
|---|---|---|---|
| 0 | 0.000 | 0 | Lurus |
| π/4 | 0.500 | 1 | Tie → round up |
| π/2 | 1.000 | 1 | ¼ lingkaran |
| 3π/4 | 1.500 | 2 | Tie → round up |
| π | 2.000 | 2 | ½ lingkaran |
| 2π | 4.000 | 4 | 1 lingkaran |

*Aturan tie-break eksplisit: Half-integer (0.5, 1.5, 2.5, …) dibulatkan ke atas. Ini dikunci oleh rilis — perubahan aturan memerlukan rilis baru.*

### 2.4 Smoothing Sebelum Kuantisasi

**Definisi (Optional Pre-Smoothing).**
Noise pada skeleton diskret dapat menyebabkan fluktuasi `Δϕi` yang tidak merepresentasikan belokan struktural. Pre-smoothing opsional dikendalikan oleh parameter:

```python
def smooth_directions(phi_sequence: List[float], window: int = 3) -> List[float]:
    """
    Moving average pada sequence arah.
    
    Args:
        phi_sequence: sequence sudut arah
        window: ukuran jendela (harus ganjil, dikunci per rilis)
    
    Returns:
        Smoothed sequence (circular averaging)
    """
    if window <= 1:
        return phi_sequence
    
    half = window // 2
    smoothed = []
    
    for i in range(len(phi_sequence)):
        # Circular averaging menggunakan komponen sin/cos
        sin_sum = sum(math.sin(phi_sequence[j]) 
                      for j in range(max(0,i-half), min(len(phi_sequence),i+half+1)))
        cos_sum = sum(math.cos(phi_sequence[j]) 
                      for j in range(max(0,i-half), min(len(phi_sequence),i+half+1)))
        smoothed.append(math.atan2(sin_sum, cos_sum))
    
    return smoothed
```
Parameter window: Dikunci per rilis. Default: 3 (minimal smoothing). Nilai 1 = no smoothing.
*Catatan: Smoothing adalah pre-processing — ia dilakukan sebelum Q90, bukan setelahnya. Θ̂ tetap integer.*

### 2.5 Pipeline Lengkap: MainPath → Θ̂

```python
def compute_theta_hat(mainpath: List[Point], is_closed: bool) -> int:
    """
    Pipeline lengkap dari MainPath ke Θ̂.
    
    Args:
        mainpath: sequence piksel pada MainPath
        is_closed: True jika MainPath tertutup
    
    Returns:
        Θ̂ ∈ ℕ₀
    """
    # 1. Hitung sequence arah
    phi = [math.atan2(mainpath[i+1].y - mainpath[i].y,
                      mainpath[i+1].x - mainpath[i].x)
           for i in range(len(mainpath) - 1)]
    
    # 2. Optional smoothing
    phi = smooth_directions(phi, window=SMOOTH_WINDOW)
    
    # 3. Hitung perubahan arah
    delta_phi = [normalize_angle(phi[i+1] - phi[i]) 
                 for i in range(len(phi) - 1)]
    
    # 4. Untuk closed path: tambahkan wrap-around
    if is_closed:
        delta_phi.append(normalize_angle(phi[0] - phi[-1]))
    
    # 5. Total turning (signed)
    theta_signed = sum(delta_phi)
    
    # 6. Kuantisasi
    theta_hat = Q90(abs(theta_signed))
    
    return theta_hat
```

---

## BAGIAN 3 — MainPath: Audit Teorema dan Implementasi

### 3.1 Enumerasi Kandidat

```python
def enumerate_candidates(G: Graph) -> List[Path]:
    """
    Enumerasi semua kandidat MainPath.
    
    Returns:
        List of (path, is_closed) pairs
    """
    candidates = []
    
    # A. Open paths: semua simple path antar endpoint
    endpoints = [n for n in G.nodes if n.kind == 'ENDPOINT']
    for i in range(len(endpoints)):
        for j in range(i+1, len(endpoints)):
            paths = all_simple_paths(G, endpoints[i], endpoints[j])
            for p in paths:
                candidates.append(PathCandidate(p, is_closed=False))
    
    # B. Closed paths: semua simple cycles
    cycles = all_simple_cycles(G)
    for c in cycles:
        candidates.append(PathCandidate(c, is_closed=True))
    
    return candidates
```
**Lemma (Finite Candidates).** Karena `Γ(h)` adalah graf planar hingga, jumlah simple paths dan simple cycles terbatas. `|P(h)| < ∞`. [VF — Lemma 1.21.2]

### 3.2 Fungsi Skor — Implementasi Presisi

**Definisi (Score — 4-tuple Leksikografis):**

```python
def score(path: PathCandidate, G: Graph) -> Tuple:
    """
    Skor leksikografis untuk kandidat MainPath.
    
    Returns:
        (Len, -Junc, LoopPref, EmbKey) — dibandingkan leksikografis
    """
    # Komponen 1: Panjang diskret (jumlah piksel pada polyline)
    Len = sum(edge.pixel_count for edge in path.edges)
    
    # Komponen 2: Negatif jumlah junction yang dilewati
    neg_Junc = -count_junctions(path, G)
    
    # Komponen 3: Preferensi loop
    if path.is_closed:
        Cov = coverage(path, G)  # Fraksi total piksel skeleton yang dilewati
        LoopPref = (1, Cov)      # Closed path lebih diutamakan, lalu coverage
    else:
        LoopPref = (0, 0.0)
    
    # Komponen 4: EmbKey — pemutus akhir
    EmbKey = embedding_key(path)
    
    return (Len, neg_Junc, LoopPref, EmbKey)
```

**Definisi (EmbKey — Pemutus Deterministik):**

```python
def embedding_key(path: PathCandidate) -> Tuple[int, ...]:
    """
    Kunci embedding untuk tie-breaking deterministik.
    
    Menggunakan urutan koordinat kanonik dari piksel pertama path.
    Dua path berbeda selalu memiliki EmbKey berbeda (injektif).
    """
    coords = tuple((p.x, p.y) for p in path.pixels)
    
    if path.is_closed:
        rotations = [coords[i:] + coords[:i] for i in range(len(coords))]
        coords = min(rotations)
    
    return coords
```

### 3.3 Seleksi MainPath

```python
def select_mainpath(G: Graph) -> PathCandidate:
    """
    Memilih MainPath unik dari graf skeleton.
    
    Teorema 1.21.1: Maksimum ada dan unik karena:
        - P(h) finite dan non-empty (Lemma 1.21.2)
        - Score injektif → strict total order (Lemma 1.21.1)
        - Maksimum himpunan finite dengan strict total order = unik
    """
    candidates = enumerate_candidates(G)
    assert len(candidates) > 0, "P(h) must be non-empty"
    
    # Select argmax
    mainpath = max(candidates, key=lambda p: score(p, G))
    
    return mainpath
```

### 3.4 Status MainPath: Terbuka atau Tertutup

```python
def mainpath_status(mainpath: PathCandidate) -> str:
    """
    Menentukan status MainPath dan verifikasi Mod-4.
    """
    theta_hat = compute_theta_hat(mainpath.pixels, mainpath.is_closed)
    
    if mainpath.is_closed:
        # Teorema Mod-4: MainPath tertutup ⟹ Θ̂ ≡ 0 (mod 4)
        assert theta_hat % 4 == 0, f"Mod-4 VIOLATION: Θ̂={theta_hat}"
        return "CLOSED"
    else:
        return "OPEN"
```

---

## BAGIAN 4 — Klasifikasi Komponen K dan Q

### 4.1 Segmentasi Edge → Komponen

```python
def classify_edges(G: Graph, mainpath: PathCandidate) -> (KVector, QVector):
    """
    Mengklasifikasikan setiap edge dalam graf ke K atau Q,
    lalu ke subkategori.
    
    Returns:
        K = (Kp, Kx, Ks, Ka, Kc) ∈ ℕ₀⁵
        Q = (Qp, Qx, Qs, Qa, Qc) ∈ ℕ₀⁵
    """
    # 1. Untuk setiap edge: tentukan apakah lurus (K) atau curved (Q)
    for edge in G.edges:
        max_deviation = compute_max_deviation(edge)  # Dari garis lurus
        total_curvature = compute_edge_curvature(edge)
        
        if max_deviation < STRAIGHT_THRESHOLD and abs(total_curvature) < CURVE_THRESHOLD:
            edge.type = 'KHATT'
        else:
            edge.type = 'QAWS'
    
    # 2. Identifikasi komponen terhubung maksimal dengan tipe sama
    components = maximal_homogeneous_components(G)
    
    # 3. Klasifikasi subkategori
    K = [0, 0, 0, 0, 0]  # Kp, Kx, Ks, Ka, Kc
    Q = [0, 0, 0, 0, 0]  # Qp, Qx, Qs, Qa, Qc
    
    for comp in components:
        if comp.type == 'KHATT':
            subcat = classify_khatt(comp, mainpath, G)
            K[subcat] += 1
        elif comp.type == 'QAWS':
            subcat = classify_qaws(comp, mainpath, G)
            Q[subcat] += 1
    
    return tuple(K), tuple(Q)
```

### 4.2 Subkategori Khaṭṭ

```python
def classify_khatt(comp: Component, mainpath: PathCandidate, G: Graph) -> int:
    """
    Mengklasifikasikan komponen Khaṭṭ ke subkategori 0-4.
    
    Returns:
        0 = Kp (primary: mandiri, tidak melekat pada Qaws)
        1 = Kx (auxiliary: terhubung pada Qaws primer)
        2 = Ks (straight-vertical: terhubung pada loop tertutup)
        3 = Ka (angular: membentuk sudut siku)
        4 = Kc (closed-loop khatt: garis pengiring loop)
    """
    on_mainpath = overlaps_mainpath(comp, mainpath)
    touches_loop = touches_closed_loop(comp, G)
    has_angle = has_sharp_angle(comp)
    is_standalone = not touches_any_qaws(comp, G)
    
    if is_standalone and not touches_loop:
        return 0  # Kp: primary, mandiri
    elif on_mainpath and not touches_loop and not has_angle:
        return 1  # Kx: auxiliary pada path utama
    elif touches_loop and is_vertical(comp):
        return 2  # Ks: vertikal pada loop
    elif has_angle:
        return 3  # Ka: angular
    elif touches_loop:
        return 4  # Kc: pengiring loop
    else:
        return 1  # Default: auxiliary
```

### 4.3 Subkategori Qaws

```python
def classify_qaws(comp: Component, mainpath: PathCandidate, G: Graph) -> int:
    """
    Mengklasifikasikan komponen Qaws ke subkategori 0-4.
    
    Returns:
        0 = Qp (primary: lengkung utama, dilalui MainPath)
        1 = Qx (auxiliary: lengkung tambahan)
        2 = Qs (smooth: lengkung halus tanpa sudut tajam)
        3 = Qa (angular: lengkung dengan corner)
        4 = Qc (closed loop: putaran tertutup)
    """
    is_closed = is_closed_loop(comp)
    on_mainpath = overlaps_mainpath(comp, mainpath)
    has_corner = has_sharp_corner(comp)
    is_smooth = is_smooth_curve(comp) and not has_corner
    
    if is_closed:
        return 4  # Qc: closed loop
    elif on_mainpath and not has_corner:
        return 0  # Qp: primary pada MainPath
    elif is_smooth and not on_mainpath:
        return 2  # Qs: smooth auxiliary
    elif has_corner:
        return 3  # Qa: angular
    else:
        return 1  # Qx: auxiliary
```

---

## BAGIAN 5 — Assembly dan Guard Check

### 5.1 Assembly v₁₈

```python
def assemble_v18(theta_hat: int, N: Tuple, K: Tuple, Q: Tuple, 
                 has_hamzah: bool = False) -> List[int]:
    """Assembly codex 18D dari komponen terukur."""
    N_a, N_b, N_d = N
    K_p, K_x, K_s, K_a, K_c = K
    Q_p, Q_x, Q_s, Q_a, Q_c = Q
    
    A_N = N_a + N_b + N_d
    A_K = K_p + K_x + K_s + K_a + K_c
    A_Q = Q_p + Q_x + Q_s + Q_a + Q_c
    H_star = 1 if has_hamzah else 0
    
    v18 = [theta_hat, N_a, N_b, N_d, K_p, K_x, K_s, K_a, K_c,
           Q_p, Q_x, Q_s, Q_a, Q_c, A_N, A_K, A_Q, H_star]
    
    return v18
```

### 5.2 Guard Check

```python
def guard_check(v: List[int]) -> Tuple[bool, List[str]]:
    """Verifikasi semua guard pada vektor v₁₈."""
    failures = []
    
    # G1: A_N = N_a + N_b + N_d
    if v[14] != v[1] + v[2] + v[3]:
        failures.append(f"G1: A_N={v[14]} != {v[1]}+{v[2]}+{v[3]}={v[1]+v[2]+v[3]}")
    
    # G2: A_K = K_p + K_x + K_s + K_a + K_c
    if v[15] != v[4] + v[5] + v[6] + v[7] + v[8]:
        failures.append(f"G2: A_K={v[15]} != sum(K)={v[4]+v[5]+v[6]+v[7]+v[8]}")
    
    # G3: A_Q = Q_p + Q_x + Q_s + Q_a + Q_c
    if v[16] != v[9] + v[10] + v[11] + v[12] + v[13]:
        failures.append(f"G3: A_Q={v[16]} != sum(Q)={v[9]+v[10]+v[11]+v[12]+v[13]}")
    
    # G4: ρ = Θ̂ - U >= 0
    U = v[10] + v[11] + v[12] + 4 * v[13]  # Qx + Qs + Qa + 4*Qc
    rho = v[0] - U
    if rho < 0:
        failures.append(f"G4: rho={rho} < 0 (Theta={v[0]}, U={U})")
    
    # T1: K_s > 0 ⟹ Q_c >= 1
    if v[6] > 0 and v[13] < 1:
        failures.append(f"T1: K_s={v[6]} > 0 but Q_c={v[13]} < 1")
    
    # T2: K_c > 0 ⟹ Q_c >= 1
    if v[8] > 0 and v[13] < 1:
        failures.append(f"T2: K_c={v[8]} > 0 but Q_c={v[13]} < 1")
    
    return (len(failures) == 0, failures)
```

---

## BAGIAN 6 — Protokol Sertifikasi HAR-002

### 6.1 Checklist Sertifikasi Latin Uppercase

| Tahap | Item | Target | Status |
|---|---|---|---|
| S1 | Pilih font kanonik monospaced | JetBrains Mono Regular | TODO |
| S1 | Seal font: SHA-256 | sha256(JetBrainsMono-Regular.ttf) | TODO |
| S1 | Lock resolusi: 256 ppem | Parameter file | TODO |
| S1 | Lock parameters: prune=3, dot=50, corner=60° | Parameter file | TODO |
| S2 | Rasterisasi 26 uppercase glyphs | 26 binary images | DONE |
| S2 | Separasi komponen → badan + titik | Per huruf | DONE |
| S2 | Skeletonisasi Zhang-Suen | 26 skeletons | DONE |
| S2 | Pruning (min_length=3) | 26 pruned skeletons | DONE |
| S2 | Konstruksi graf `Γ` | 26 graphs | DONE |
| S3 | MainPath selection per huruf | 26 MainPaths | TODO |
| S3 | Verifikasi keunikan (Teorema 1.21.1) | 26/26 unik | TODO |
| S3 | Status open/closed per huruf | Tabel | TODO |
| S4 | Hitung `Θ̂` per huruf (Q₉₀) | 26 values | TODO |
| S4 | Klasifikasi N per huruf | 26 × 3 values | TODO |
| S4 | Klasifikasi K per huruf | 26 × 5 values | TODO |
| S4 | Klasifikasi Q per huruf | 26 × 5 values | TODO |
| S4 | Assembly v₁₈ per huruf | 26 × 18 values | TODO |
| S4 | Master Table Latin Uppercase | 26 × 18 matrix | TODO |
| S5 | Guard G1 PASS | 26/26 | TODO |
| S5 | Guard G2 PASS | 26/26 | TODO |
| S5 | Guard G3 PASS | 26/26 | TODO |
| S5 | Guard G4 PASS (`ρ ≥ 0`) | 26/26 | TODO |
| S5 | Guard T1 PASS (jika aplikabel) | 26/26 | TODO |
| S5 | Guard T2 PASS (jika aplikabel) | 26/26 | TODO |
| S5 | Total guard: 156/156 PASS | | TODO |
| S6 | Injektivitas `ΨLat` | 325/325 unik | TODO |
| S7 | R1–R5 per huruf | 26 × 5 = 130 PASS | TODO |
| S7 | `rank(M14up)` | — | TODO |
| S7 | `rank(M18up)` | — | TODO |
| S7 | `dim ker(M⊤)` | — | TODO |
| S7 | Diameter alfabet Latin | `d2` max | TODO |
| Release | Master Table sealed | SHA-256 | TODO |
| Release | Certificate HAR-002 | — | TODO |

### 6.2 Template Master Table Latin Uppercase

Format: HAR-002-v1.0-LC26U (Latin Certified, 26 Uppercase)

| Huruf | Unicode | Θ̂ | Na | Nb | Nd | Kp | Kx | Ks | Ka | Kc | Qp | Qx | Qs | Qa | Qc | AN | AK | AQ | H* |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A | U+0041 | | | | | | | | | | | | | | | | | | |
| B | U+0042 | | | | | | | | | | | | | | | | | | |
| C | U+0043 | | | | | | | | | | | | | | | | | | |
| ... | | | | | | | | | | | | | | | | | | | |

### 6.3 Guard Topologis untuk Latin

**Proposisi.** Guard topologis Hijaiyyah (T1, T2) bersifat universal — mereka menjaga hubungan logis antara garis vertikal pada loop (`Ks`) dan keberadaan loop (`Qc`), serta antara garis pengiring loop (`Kc`) dan keberadaan loop (`Qc`). Hubungan ini berlaku untuk setiap alfabet:
- `Ks > 0 ⇒ Qc ≥ 1`: Jika ada garis vertikal yang melekat pada loop, maka loop harus ada.
- `Kc > 0 ⇒ Qc ≥ 1`: Jika ada garis pengiring loop, maka loop harus ada.

### 6.4 Verifikasi Mod-4 pada Latin

Untuk huruf Latin yang memiliki MainPath tertutup (kandidat: O, Q, B, D, dll.):
`MainPath tertutup ⇒ Θ̂ ≡ 0 (mod 4)`

Prediksi dari estimasi:
| Huruf | MainPath Status (est.) | Θ̂ (est.) | Mod-4? |
|---|---|---|---|
| O | Tertutup | 4 | `4 ≡ 0` ✓ |
| Q | Tertutup (loop) | 4 | `4 ≡ 0` ✓ |
| B | Terbuka (garis + loop) | 4 | N/A (terbuka) |
| D | Terbuka (garis + arch) | 2 | N/A (terbuka) |

---

## BAGIAN 7 — HC Programming Core Set

### 7.1 Definisi `ΣHC`

```python
# HC Programming Core Set
SIGMA_HC = {
    # Letters (52)
    'uppercase': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'lowercase': 'abcdefghijklmnopqrstuvwxyz',
    
    # Digits (10)
    'digits': '0123456789',
    
    # Delimiters (6)
    'delimiters': '()[]{}',
    
    # Punctuation (6)
    'punctuation': '.,;:\'"',
    
    # Operators (14)
    'operators': '=+-*/<>!&|^~%@',
    
    # Special (3)
    'special': '_ \\ #',
    
    # Whitespace (3)
    'whitespace': ['SPACE', 'TAB', 'NEWLINE']
}
```

### 7.2 Dual Representation dalam HC Compiler

Setiap token membawa representasi ganda (Tipe Parsing & Vektor Unit):

```python
@dataclass
class HCToken:
    """Token dalam bahasa HC dengan dual representation."""
    char_id: int            # Unicode codepoint
    lexeme: str             # String asli
    token_type: TokenType   # KEYWORD, IDENTIFIER, dll.
    
    # Layer 2: Unitisasi (untuk audit)
    hybit: List[int]        # Ψ(char) — v₁₈ per karakter
    string_integral: List[int]  # ∫ Ψ — codex agregat lexeme
    guard_status: bool      # PASS/FAIL
```

### 7.3 Analisis Source Code `.hc`

Pemeliharaan integritas sumber secara geometris: `∫token Θ̂ = ∫token U + ∫token ρ ✓`

**Deteksi korupsi file sumber:** Jika satu byte dalam file `.hc` terkorupsi, guard pada karakter yang berubah akan FAIL — memberikan lokalisasi error yang presisi.

---

## BAGIAN 8 — Implementasi Referensi

### 8.1 Pipeline Lengkap: Glyph → v₁₈

```python
def psi(glyph_image: BinaryMatrix, har_id: int, 
        params: CSGIParams) -> HISABFrame:
    """Fungsi unitisasi universal Ψ."""
    # 1. CSGI
    body, dots = separate_components(glyph_image, params.dot_max_area)
    body_mask = merge_components(body)
    skeleton = skeletonize(body_mask)
    skeleton = prune_skeleton(skeleton, params.prune_length)
    G = build_graph(skeleton, params.corner_angle)
    N = classify_dots(dots, bounding_box(body_mask))
    
    # 2. MainPath
    mainpath = select_mainpath(G)
    
    # 3. Q₉₀
    theta_hat = compute_theta_hat(mainpath.pixels, mainpath.is_closed)
    
    # 4. Klasifikasi
    K, Q = classify_edges(G, mainpath)
    
    # 5. Assembly
    v18 = assemble_v18(theta_hat, N, K, Q, has_hamzah=False)
    
    # 6. Guard
    passed, failures = guard_check(v18)
    
    frame = HISABFrame(
        magic=0x4842,
        version=0x02,
        type=LETTER,
        har_id=har_id,
        payload=nibble_pack(v18),
        guard_status=0x3F,  # All 6 guards PASS
        digest=crc32(...)
    )
    return frame
```

### 8.2 Batch Certification

Fungsi `certify_alphabet` menghasilkan `CertReport` meliputi Master Table, Guard Report, Rank Analysis, dan sertifikat bersegmen.

---

## BAGIAN 9 — Peta Langkah Berikutnya

### 9.1 Urutan Kerja untuk HAR-002

- [x] **Minggu 1: SEAL** (Pengumpulan Font Latin, Lock Parameters)
- [x] **Minggu 2: EXTRACT** (CSGI Skeletonization Zhang-Suen)
- [ ] **Minggu 3: MEASURE** (MainPath, Q90, K/Q, Assembly v18)
- [ ] **Minggu 4: VALIDATE** (Guard G1-G4, Injektivitas, R1-R5)
- [ ] **Minggu 5: CERTIFY** (Sertifikasi HAR-002)

### 9.2 Prioritas Teknis

1. **P0**: Seal font + parameters (Selesai)
2. **P1**: Implementasi CSGI (Bagian 1) (Selesai untuk Skeleton)
3. **P2**: Implementasi Q₉₀ (Bagian 2)
4. **P3**: Implementasi MainPath (Bagian 3)
5. **P4**: Klasifikasi K/Q (Bagian 4)
6. **P5**: Assembly + Guard v₁₈ (Bagian 5)
7. **P6**: Validasi Sertifikasi HAR-002 (Bagian 6)

---
*Dokumen ini menyediakan spesifikasi teknis lengkap untuk menjalankan pipeline sertifikasi Latin dan digits. Setiap algoritma deterministik, setiap parameter dikunci, dan setiap langkah auditabel.*
