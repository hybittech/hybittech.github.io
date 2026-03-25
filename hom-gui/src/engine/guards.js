// Guard System G1–G4 + Topological T1–T2

export function guardG1(v18) {
  // AN = Na + Nb + Nd
  const [, Na, Nb, Nd] = v18;
  const AN = v18[15]; // stored at index 15
  return { id: 'G1', pass: AN === Na + Nb + Nd, formula: `A_N=${AN} = ${Na}+${Nb}+${Nd}` };
}

export function guardG2(v18) {
  // AK = Kp + Kx + Ks + Ka + Kc
  const Kp = v18[4], Kx = v18[5], Ks = v18[6], Ka = v18[7], Kc = v18[8];
  const AK = v18[16];
  const sum = Kp + Kx + Ks + Ka + Kc;
  return { id: 'G2', pass: AK === sum, formula: `A_K=${AK} = ${Kp}+${Kx}+${Ks}+${Ka}+${Kc}` };
}

export function guardG3(v18) {
  // AQ = Qp + Qx + Qs + Qa + Qc
  const Qp = v18[9], Qx = v18[10], Qs = v18[11], Qa = v18[12], Qc = v18[13];
  const AQ = v18[17];
  const sum = Qp + Qx + Qs + Qa + Qc;
  return { id: 'G3', pass: AQ === sum, formula: `A_Q=${AQ} = ${Qp}+${Qx}+${Qs}+${Qa}+${Qc}` };
}

export function guardG4(v18) {
  // ρ = Θ̂ − U ≥ 0
  const theta = v18[0];
  const Qx = v18[10], Qs = v18[11], Qa = v18[12], Qc = v18[13];
  const U = Qx + Qs + Qa + 4 * Qc;
  const rho = theta - U;
  return { id: 'G4', pass: rho >= 0, formula: `ρ=${rho} = ${theta}−${U} ≥ 0` };
}

export function checkAllGuards(v18) {
  return [guardG1(v18), guardG2(v18), guardG3(v18), guardG4(v18)];
}

export function allGuardsPass(v18) {
  return checkAllGuards(v18).every((g) => g.pass);
}
