// ITM — Intrametric: distance metrics in letter vector space

export function computeIntrametric(v18a, v18b) {
  const v14a = v18a.slice(0, 14);
  const v14b = v18b.slice(0, 14);

  let d2sq = 0, d1 = 0, dH = 0;
  for (let i = 0; i < 14; i++) {
    const diff = v14a[i] - v14b[i];
    d2sq += diff * diff;
    d1 += Math.abs(diff);
    if (v14a[i] !== v14b[i]) dH++;
  }

  const norm2a = v14a.reduce((s, x) => s + x * x, 0);
  const norm2b = v14b.reduce((s, x) => s + x * x, 0);
  const inner = v14a.reduce((s, x, i) => s + x * v14b[i], 0);
  const cosine = norm2a > 0 && norm2b > 0
    ? inner / (Math.sqrt(norm2a) * Math.sqrt(norm2b))
    : 0;

  // Polarization identity check
  const polarization = Math.abs(d2sq - (norm2a + norm2b - 2 * inner)) < 1e-10;

  return {
    d2: Math.sqrt(d2sq),
    d2sq,
    d1,
    dH,
    inner,
    cosine,
    norm2a,
    norm2b,
    polarization,
  };
}

export function computeDiameter(masterTable) {
  let max = 0;
  let pair = [null, null];

  for (let i = 0; i < masterTable.length; i++) {
    for (let j = i + 1; j < masterTable.length; j++) {
      const d = computeIntrametric(masterTable[i].v18, masterTable[j].v18).d2;
      if (d > max) {
        max = d;
        pair = [masterTable[i].char, masterTable[j].char];
      }
    }
  }

  return { diameter: max, pair };
}
