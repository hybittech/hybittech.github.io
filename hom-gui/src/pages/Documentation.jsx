import GlassPanel from '../components/GlassPanel';
import FormulaBlock from '../components/FormulaBlock';

const sections = [
  {
    title: 'Four Geometric Invariants',
    formulas: [
      { label: 'Inḥinā\' (Turning)', tex: '\\hat{\\Theta}(h) \\in \\mathbb{N}_0' },
      { label: 'Nuqṭah (Dots)', tex: '\\mathbf{N}(h) = (N_a, N_b, N_d) \\in \\mathbb{N}_0^3' },
      { label: 'Khaṭṭ (Lines)', tex: '\\mathbf{K}(h) = (K_p, K_x, K_s, K_a, K_c) \\in \\mathbb{N}_0^5' },
      { label: 'Qaws (Curves)', tex: '\\mathbf{Q}(h) = (Q_p, Q_x, Q_s, Q_a, Q_c) \\in \\mathbb{N}_0^5' },
    ],
  },
  {
    title: 'Key Identities',
    formulas: [
      { label: 'Turning Decomposition', tex: '\\hat{\\Theta}(h) = U(h) + \\rho(h), \\quad \\rho \\geq 0' },
      { label: 'Vektronometry Identity', tex: 'r_N + r_K + r_Q = 1' },
      { label: 'Pythagoras Decomposition', tex: '\\|h\\|^2 = \\|\\Pi_\\Theta\\|^2 + \\|\\Pi_N\\|^2 + \\|\\Pi_K\\|^2 + \\|\\Pi_Q\\|^2' },
      { label: 'Normivektor Decomposition', tex: '\\|\\Delta\\|^2 = \\Delta_\\Theta^2 + \\|\\Delta_N\\|^2 + \\|\\Delta_K\\|^2 + \\|\\Delta_Q\\|^2' },
      { label: 'Aggregametric Additivity', tex: '\\Sigma_{uv}\\,\\vec{h} = \\Sigma_u\\,\\vec{h} + \\Sigma_v\\,\\vec{h}' },
      { label: 'Polarization Identity', tex: 'd^2 = \\|h_1\\|^2 + \\|h_2\\|^2 - 2\\langle h_1, h_2 \\rangle' },
      { label: 'Energy-Norm Inequality', tex: '\\Phi(h) > \\|v_{14}(h)\\|^2 \\quad \\forall h \\in \\mathcal{H}_{28}' },
    ],
  },
  {
    title: 'Mod-4 Theorem',
    formulas: [
      { label: 'Closed MainPath', tex: '\\text{MainPath closed} \\;\\Rightarrow\\; \\hat{\\Theta} \\equiv 0 \\pmod{4}' },
    ],
  },
  {
    title: 'Guard System',
    formulas: [
      { label: 'G1', tex: 'A_N = N_a + N_b + N_d' },
      { label: 'G2', tex: 'A_K = K_p + K_x + K_s + K_a + K_c' },
      { label: 'G3', tex: 'A_Q = Q_p + Q_x + Q_s + Q_a + Q_c' },
      { label: 'G4', tex: '\\rho = \\hat{\\Theta} - U \\geq 0' },
    ],
  },
  {
    title: 'Irreducibility',
    formulas: [
      { label: 'Three Paradigms', tex: '\\mathbb{F}_2 \\neq \\mathcal{V} \\neq \\mathbb{C}^2' },
      { label: 'Mutual Irreducibility', tex: '\\text{Hybit} \\not\\hookrightarrow \\text{Bit}, \\quad \\text{Hybit} \\not\\hookrightarrow \\text{Qubit}' },
    ],
  },
];

export default function Documentation() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Documentation</h1>
        <p className="text-sm text-hom-muted mt-1">
          Axioms, theorems, and identities of Hijaiyyah Mathematics
        </p>
      </div>

      {sections.map((section) => (
        <GlassPanel key={section.title} title={section.title}>
          <div className="space-y-4">
            {section.formulas.map((f) => (
              <div key={f.label} className="flex flex-col sm:flex-row sm:items-center gap-2 py-2 border-b border-hom-border/20 last:border-0">
                <span className="text-xs text-hom-muted w-48 shrink-0">{f.label}</span>
                <FormulaBlock tex={f.tex} display className="flex-1" />
              </div>
            ))}
          </div>
        </GlassPanel>
      ))}

      <GlassPanel title="References">
        <div className="text-xs text-hom-muted space-y-1">
          <p>Firman Arief Hidayatullah, <em>Matematika Hijaiyyah</em>, Ed. 1, PT. AMRA COSMICTERA TECHNOLOGY, 2026.</p>
          <p>Release: HM-28-v1.2-HC18D · Verification: 1,380/1,380 PASS · Tests: 1,611/1,611 PASS</p>
        </div>
      </GlassPanel>
    </div>
  );
}
