import { useState } from 'react';
import useStore from '../store/useStore';
import GlassPanel from '../components/GlassPanel';
import VectorDisplay from '../components/VectorDisplay';
import FormulaBlock from '../components/FormulaBlock';
import GuardBadge from '../components/GuardBadge';

export default function Lab() {
  const [input, setInput] = useState('بسم');
  const { runLab, labResult } = useStore();

  const handleRun = () => runLab(input);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Aggregametric Lab</h1>
        <p className="text-sm text-hom-muted mt-1">
          Enter Arabic text to compute string codex · Aggregametric (AGM) operation
        </p>
      </div>

      <GlassPanel>
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter Hijaiyyah text..."
            className="flex-1 bg-hom-bg border border-hom-border rounded-lg px-4 py-2.5 text-lg arabic-letter text-hom-text focus:border-hom-accent/50 focus:outline-none transition-colors"
            dir="rtl"
          />
          <button
            onClick={handleRun}
            className="px-6 py-2.5 rounded-lg bg-hom-accent text-black font-semibold text-sm hover:shadow-glow transition-all"
          >
            Compute Σ
          </button>
        </div>
      </GlassPanel>

      {labResult && (
        <div className="space-y-4">
          <GlassPanel title="Aggregametric Result" badge={`${labResult.letterCount} letters`} glow>
            <div className="arabic-letter text-3xl text-center mb-4 neon-text" dir="rtl">
              {labResult.text}
            </div>
            <VectorDisplay label="Σ_w v₁₈" vector={labResult.codex} />
          </GlassPanel>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassPanel title="Turning Decomposition" badge="AGM">
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-hom-muted">Σ_w Θ̂</span>
                  <span className="text-hom-accent font-bold">{labResult.theta}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-hom-muted">Σ_w U</span>
                  <span className="text-hom-gold">{labResult.U}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-hom-muted">Σ_w ρ</span>
                  <span className="text-hom-green">{labResult.rho}</span>
                </div>
                <div className="glow-line" />
                <FormulaBlock
                  tex={`\\Sigma_w \\hat{\\Theta} = \\Sigma_w U + \\Sigma_w \\rho \\;\\Rightarrow\\; ${labResult.theta} = ${labResult.U} + ${labResult.rho}`}
                  display
                />
              </div>
            </GlassPanel>

            <GlassPanel title="Identity Preservation" badge={labResult.allPreserved ? 'ALL PASS' : 'FAIL'} glow={labResult.allPreserved ? 'green' : undefined}>
              <div className="space-y-2">
                <GuardBadge guard={{ id: 'Θ̂=U+ρ', pass: labResult.identityPreserved, formula: `${labResult.theta}=${labResult.U}+${labResult.rho}` }} />
                <GuardBadge guard={{ id: 'ρ≥0', pass: labResult.rho >= 0, formula: `ρ=${labResult.rho}` }} />
                <GuardBadge guard={{ id: 'G1', pass: labResult.g1, formula: 'A_N = Σ N_j' }} />
                <GuardBadge guard={{ id: 'G2', pass: labResult.g2, formula: 'A_K = Σ K_j' }} />
                <GuardBadge guard={{ id: 'G3', pass: labResult.g3, formula: 'A_Q = Σ Q_j' }} />
              </div>
            </GlassPanel>
          </div>

          {labResult.unknownChars.length > 0 && (
            <GlassPanel>
              <div className="text-xs text-hom-muted">
                Unknown characters (not in ℋ₂₈): {labResult.unknownChars.join(', ')}
              </div>
            </GlassPanel>
          )}
        </div>
      )}
    </div>
  );
}
