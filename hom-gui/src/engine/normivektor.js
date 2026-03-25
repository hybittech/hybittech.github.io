// NMV — Normivektor: norm-difference operations

export function computeNormivektor(v18a, v18b) {
  const delta = v18a.slice(0, 14).map((x, i) => x - v18b[i]);

  const deltaTheta2 = delta[0] ** 2;
  const deltaN2 = delta.slice(1, 4).reduce((s, x) => s + x * x, 0);
  const deltaK2 = delta.slice(4, 9).reduce((s, x) => s + x * x, 0);
  const deltaQ2 = delta.slice(9, 14).reduce((s, x) => s + x * x, 0);
  const totalNorm2 = deltaTheta2 + deltaN2 + deltaK2 + deltaQ2;

  const total = delta.reduce((s, x) => s + x * x, 0);
  const decompValid = Math.abs(totalNorm2 - total) < 1e-10;

  return {
    delta,
    deltaTheta2,
    deltaN2,
    deltaK2,
    deltaQ2,
    totalNorm2,
    d2: Math.sqrt(totalNorm2),
    decompValid,
    diagnosis: getDiagnosis(deltaTheta2, deltaN2, deltaK2, deltaQ2, totalNorm2),
  };
}

function getDiagnosis(dT, dN, dK, dQ, total) {
  if (total === 0) return 'Identical';
  const parts = [];
  if (dT > 0) parts.push(`Θ ${((dT / total) * 100).toFixed(0)}%`);
  if (dN > 0) parts.push(`N ${((dN / total) * 100).toFixed(0)}%`);
  if (dK > 0) parts.push(`K ${((dK / total) * 100).toFixed(0)}%`);
  if (dQ > 0) parts.push(`Q ${((dQ / total) * 100).toFixed(0)}%`);
  return parts.join(' · ');
}
