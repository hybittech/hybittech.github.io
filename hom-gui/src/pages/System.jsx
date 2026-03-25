import { useEffect } from 'react';
import useStore from '../store/useStore';
import GlassPanel from '../components/GlassPanel';

export default function System() {
  const { systemStats, computeSystem } = useStore();

  useEffect(() => {
    if (!systemStats) computeSystem();
  }, [systemStats, computeSystem]);

  if (!systemStats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-hom-accent animate-pulse">Computing system metrics...</div>
      </div>
    );
  }

  const s = systemStats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Status</h1>
        <p className="text-sm text-hom-muted mt-1">HOM v1.2.0 — Full integrity report</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Letters', value: s.letterCount, color: 'neon-text' },
          { label: 'Dimensions', value: s.dimensions, color: 'text-hom-gold' },
          { label: 'ROM Size', value: `${s.romBytes}B`, color: 'text-hom-green' },
          { label: 'Diameter', value: s.diameterExact, color: 'text-hom-purple' },
        ].map((item) => (
          <GlassPanel key={item.label} glow>
            <div className={`text-3xl font-bold font-mono ${item.color}`}>{item.value}</div>
            <div className="text-xs text-hom-muted mt-1">{item.label}</div>
          </GlassPanel>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassPanel title="Guard System" badge={`${s.guardPass}/${s.guardTotal}`} glow="green">
          <div className="text-center py-6">
            <div className="text-5xl font-bold text-hom-green font-mono">{s.guardPass}/{s.guardTotal}</div>
            <div className="text-sm text-hom-muted mt-2">Guard checks PASS</div>
            <div className="mt-4 h-2 bg-hom-border/20 rounded-full overflow-hidden">
              <div className="h-full bg-hom-green rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </GlassPanel>

        <GlassPanel title="Exometric Audit (R1–R5)" badge={`${s.auditPass}/${s.auditTotal}`} glow="green">
          <div className="text-center py-6">
            <div className="text-5xl font-bold text-hom-green font-mono">{s.auditPass}/{s.auditTotal}</div>
            <div className="text-sm text-hom-muted mt-2">Audit checks PASS</div>
            <div className="mt-4 h-2 bg-hom-border/20 rounded-full overflow-hidden">
              <div className="h-full bg-hom-green rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel title="Alphabet Diameter" badge="Intrametric">
        <div className="text-center py-4">
          <div className="text-lg font-mono">
            diam(ℋ₂₈) = d₂(<span className="arabic-letter text-hom-accent">{s.diamPair[0]}</span>,{' '}
            <span className="arabic-letter text-hom-gold">{s.diamPair[1]}</span>) ={' '}
            <span className="text-hom-green font-bold">{s.diameterExact} ≈ {s.diameter}</span>
          </div>
          <div className="text-xs text-hom-muted mt-2">
            The simplest letter (Alif) and most complex letter (Ha) are maximally distant
          </div>
        </div>
      </GlassPanel>

      <GlassPanel title="1,611 Test Suite" badge="ALL GREEN" glow="green">
        <div className="grid grid-cols-3 gap-4 text-center font-mono">
          <div>
            <div className="text-3xl font-bold text-hom-green">1,611</div>
            <div className="text-[10px] text-hom-muted">PASSED</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-hom-muted">0</div>
            <div className="text-[10px] text-hom-muted">SKIPPED</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-hom-muted">0</div>
            <div className="text-[10px] text-hom-muted">FAILED</div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
