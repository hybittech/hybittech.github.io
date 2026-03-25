import { create } from 'zustand';
import { MASTER_TABLE } from '../engine/masterTable';
import { checkAllGuards } from '../engine/guards';
import { computeVektronometry } from '../engine/vektronometry';
import { computeNormivektor } from '../engine/normivektor';
import { aggregateString } from '../engine/aggregametric';
import { computeIntrametric } from '../engine/intrametric';
import { buildExomatrix, computePhi, auditR1R5 } from '../engine/exometric';

const useStore = create((set, get) => ({
  letters: MASTER_TABLE,
  selectedLetter: null,
  labInput: '',
  labResult: null,
  systemStats: null,

  selectLetter: (char) => {
    const entry = MASTER_TABLE.find((l) => l.char === char);
    if (!entry) return;

    const guards = checkAllGuards(entry.v18);
    const vtm = computeVektronometry(entry.v18);
    const exo = buildExomatrix(entry.v18);
    const phi = computePhi(exo);
    const audit = auditR1R5(entry.v18);

    set({
      selectedLetter: {
        ...entry,
        guards,
        vtm,
        exomatrix: exo,
        phi,
        audit,
      },
    });
  },

  runLab: (input) => {
    const text = input.trim();
    if (!text) return;

    const result = aggregateString(text, MASTER_TABLE);
    set({ labInput: text, labResult: result });
  },

  computeSystem: () => {
    const letters = MASTER_TABLE;
    const n = letters.length;

    let totalGuards = 0;
    let passGuards = 0;
    letters.forEach((l) => {
      const g = checkAllGuards(l.v18);
      totalGuards += g.length;
      passGuards += g.filter((x) => x.pass).length;
    });

    const distMatrix = [];
    for (let i = 0; i < n; i++) {
      const row = [];
      for (let j = 0; j < n; j++) {
        row.push(computeIntrametric(letters[i].v18, letters[j].v18).d2);
      }
      distMatrix.push(row);
    }

    let diameter = 0;
    let diamPair = ['', ''];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (distMatrix[i][j] > diameter) {
          diameter = distMatrix[i][j];
          diamPair = [letters[i].char, letters[j].char];
        }
      }
    }

    let auditTotal = 0;
    let auditPass = 0;
    letters.forEach((l) => {
      const a = auditR1R5(l.v18);
      auditTotal += a.length;
      auditPass += a.filter((x) => x.pass).length;
    });

    set({
      systemStats: {
        letterCount: n,
        dimensions: 18,
        guardTotal: totalGuards,
        guardPass: passGuards,
        auditTotal,
        auditPass,
        diameter: diameter.toFixed(4),
        diameterExact: '√70',
        diamPair,
        romBytes: 252,
      },
    });
  },
}));

export default useStore;
