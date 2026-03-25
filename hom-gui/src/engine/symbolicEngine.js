// Unified symbolic engine — re-exports all modules

export { MASTER_TABLE, getLetterByChar, getAllLetters } from './masterTable';
export { checkAllGuards, allGuardsPass } from './guards';
export { computeVektronometry } from './vektronometry';
export { computeNormivektor } from './normivektor';
export { aggregateString } from './aggregametric';
export { computeIntrametric, computeDiameter } from './intrametric';
export { buildExomatrix, computePhi, auditR1R5 } from './exometric';

export function parseSymbol(char) {
  const { getLetterByChar: get } = require('./masterTable');
  return get(char);
}

export function mapToVector(entry) {
  return entry ? entry.v18 : null;
}
