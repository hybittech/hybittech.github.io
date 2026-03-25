import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useStore from '../store/useStore';
import GlassPanel from '../components/GlassPanel';
import VectorDisplay from '../components/VectorDisplay';
import GuardBadge from '../components/GuardBadge';
import MetricBar from '../components/MetricBar';
import FormulaBlock from '../components/FormulaBlock';

const COMPONENT_NAMES = [
  'Θ̂', 'Nₐ', 'Nᵦ', 'Nᵈ', 'Kₚ', 'Kₓ', 'Kₛ', 'Kₐ', 'Kc',
  'Qₚ', 'Qₓ', 'Qₛ', 'Qₐ', 'Qc', 'H*', 'A_N', 'A_K', 'A_Q',
];

export default function LetterDetail() {
  const { letter } = useParams();
  const char = decodeURIComponent(letter);
  const { selectedLetter, selectLetter } = useStore();

  useEffect(() => {
    selectLetter(char);
  }, [char, selectLetter]);

  if (!selectedLetter) {
    return (
      <div className="text-center py-20">
        <p className="text-hom-muted">Letter not found</p>
        <Link to="/explorer" className="text-hom-accent text-sm mt-2 inline-block">← Back to Explorer</Link>
      </div>
    );
  }

  const { vtm, guards, audit, phi, exomatrix } = selectedLetter;

  return (
    <div className="space-y-6">
      <Link to="/explorer" className="text-hom-accent text-xs hover:underline">← Explorer</Link>

      {/* Header */}
      <div className="flex items-center gap-6">
        <div className="arabic-letter text-7xl neon-text">{selectedLetter.char}</div>
        <div>
          <h1 className="text-2xl font-bold">{selectedLetter.name}</h1>
          <div className="text-sm text-hom-muted">Letter #{selectedLetter.id} · HC18D</div>
          <div className="mt-2 flex gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-hom-accent/10 text-hom-accent">
              Θ̂ = {vtm.theta}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-hom-gold/10 text-hom-gold">
              ‖v₁₄‖² = {vtm.norm2}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-hom-green/10 text-hom-green">
              {vtm.type}
            </span>
          </div>
        </div>
      </div>

      <div className="glow-line" />

      {/* Vector */}
      <GlassPanel title="Codex Vector v₁₈(h)" badge="18D">
        <VectorDisplay label="v₁₈" vector={selectedLetter.v18} />
        <div className="flex flex-wrap gap-1 mt-3">
          {COMPONENT_NAMES.map((name, i) => (
            <span key={i} className="text-[9px] font-mono text-hom-muted">
              {name}={selectedLetter.v18[i]}
            </span>
          ))}
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* VTM */}
        <GlassPanel title="Vektronometry (VTM)" badge="Composition" glow>
          <div className="space-y-2">
            <MetricBar label="r_N (dots)" value={vtm.rN} color="gold" />
            <MetricBar label="r_K (lines)" value={vtm.rK} color="green" />
            <MetricBar label="r_Q (curves)" value={vtm.rQ} color="purple" />
          </div>
          <div className="mt-3 text-center">
            <FormulaBlock tex={`r_N + r_K + r_Q = ${vtm.rN.toFixed(3)} + ${vtm.rK.toFixed(3)} + ${vtm.rQ.toFixed(3)} = 1`} />
          </div>
          <div className="mt-3 space-y-2">
            <MetricBar label="r_U (non-primer)" value={vtm.rU} color="accent" />
            <MetricBar label="r_ρ (primer)" value={vtm.rRho} color="red" />
            <MetricBar label="r_loop" value={vtm.rLoop} color="purple" />
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-hom-muted">
            <span>α = {vtm.alpha.toFixed(1)}°</span>
            <span>·</span>
            <span>Pythagoras: {vtm.pythagoras ? '✅' : '❌'}</span>
          </div>
        </GlassPanel>

        {/* Guards + Audit */}
        <div className="space-y-4">
          <GlassPanel title="Guard System" badge="G1–G4">
            <div className="space-y-2">
              {guards.map((g) => (
                <GuardBadge key={g.id} guard={g} />
              ))}
            </div>
          </GlassPanel>

          <GlassPanel title="Exometric Audit" badge="R1–R5">
            <div className="space-y-2">
              {audit.map((a) => (
                <GuardBadge key={a.id} guard={a} />
              ))}
            </div>
            <div className="mt-3 flex justify-between text-[10px] font-mono">
              <span className="text-hom-muted">Φ (Frobenius Energy)</span>
              <span className="text-hom-gold">{phi}</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-hom-muted">‖v₁₄‖²</span>
              <span className="text-hom-accent">{vtm.norm2}</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-hom-muted">Φ {'>'} ‖v₁₄‖² ?</span>
              <span className={phi > vtm.norm2 ? 'text-hom-green' : 'text-hom-red'}>
                {phi > vtm.norm2 ? '✅ Yes (strict)' : '❌ No'}
              </span>
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* Exomatrix */}
      <GlassPanel title="Letter Exomatrix ℰ(h)" badge="5×5">
        <div className="overflow-x-auto">
          <table className="font-mono text-xs w-full">
            <tbody>
              {exomatrix.map((row, r) => (
                <tr key={r}>
                  {row.map((val, c) => (
                    <td
                      key={c}
                      className={`w-12 h-10 text-center border border-hom-border/20 ${
                        val > 0 ? 'bg-hom-accent/5 text-hom-text' : 'text-hom-muted/30'
                      }`}
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}
