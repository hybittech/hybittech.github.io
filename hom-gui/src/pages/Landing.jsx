import { Link } from 'react-router-dom';
import HijaiyyahScene from '../components/HijaiyyahScene';
import FormulaBlock from '../components/FormulaBlock';
import GlassPanel from '../components/GlassPanel';

const stats = [
  { label: 'Letters', value: '28', sub: 'Canonical Hijaiyyah' },
  { label: 'Dimensions', value: '18', sub: 'Integer Vector Space' },
  { label: 'Tests', value: '1,611', sub: 'All PASS · 0 FAIL' },
  { label: 'ROM', value: '252', sub: 'Bytes (nibble-packed)' },
];

const operations = [
  { code: 'VTM', name: 'Vektronometry', desc: 'Composition metrics', color: 'text-hom-accent' },
  { code: 'NMV', name: 'Normivektor', desc: 'Norm-difference diagnostics', color: 'text-hom-gold' },
  { code: 'AGM', name: 'Aggregametric', desc: 'String accumulation', color: 'text-hom-green' },
  { code: 'ITM', name: 'Intrametric', desc: 'Distance geometry', color: 'text-hom-purple' },
  { code: 'EXM', name: 'Exometric', desc: 'Consistency audit', color: 'text-hom-red' },
];

export default function Landing() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex flex-col md:flex-row items-center justify-between pt-10 pb-20">
        <div className="absolute inset-0 -z-10">
          <HijaiyyahScene />
        </div>
        <div className="relative z-10 max-w-xl flex-1">
          <div className="mb-4">
            <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-hom-accent/10 text-hom-accent border border-hom-accent/20">
              HM-28-v1.2-HC18D
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
            <span className="neon-text">Hijaiyyah</span>
            <br />
            <span className="text-hom-text">Mathematics</span>
          </h1>
          <p className="text-hom-muted text-sm md:text-base leading-relaxed mb-6 max-w-lg">
            A formal mathematical system mapping 28 canonical Hijaiyyah letters to 18-dimensional integer vectors through four discrete geometric invariants — establishing <span className="text-hom-gold font-semibold">hybit</span> as the third computational paradigm.
          </p>
          <div className="text-left">
            <FormulaBlock
              tex="h \in \mathcal{H}_{28} \xrightarrow{\text{Measure}} \mathbf{H}(h) \xrightarrow{\text{Map}} v_{18}(h) \in \mathbb{N}_0^{18} \xrightarrow{\text{Name}} h^*"
            />
          </div>
          <div className="flex gap-3 mt-8">
            <Link to="/explorer" className="px-5 py-2.5 rounded-lg bg-hom-accent text-black font-semibold text-sm hover:shadow-glow transition-all">
              Explore Letters →
            </Link>
            <Link to="/lab" className="px-5 py-2.5 rounded-lg border border-hom-border text-hom-text text-sm hover:border-hom-accent/50 transition-all">
              Open Lab
            </Link>
          </div>
        </div>
        
        {/* Right Column: Logo */}
        <div className="relative z-10 w-full md:w-1/2 flex justify-center md:justify-end mt-12 md:mt-0">
          <img
            src={import.meta.env.BASE_URL + 'logo.png'}
            alt="الرياضيات الهجائية"
            className="w-[300px] md:w-[450px] lg:w-[550px] h-auto drop-shadow-[0_0_30px_rgba(212,175,55,0.4)] animate-[pulse_6s_ease-in-out_infinite]"
          />
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <GlassPanel key={s.label} glow>
            <div className="text-3xl font-bold neon-text font-mono">{s.value}</div>
            <div className="text-sm text-hom-text mt-1">{s.label}</div>
            <div className="text-[10px] text-hom-muted mt-0.5">{s.sub}</div>
          </GlassPanel>
        ))}
      </section>

      {/* Paradigm */}
      <section>
        <GlassPanel title="Three Computational Paradigms" badge="Proven VF" glow="gold">
          <FormulaBlock tex="\text{bit} \;\oplus\; \text{qubit} \;\oplus\; \text{hybit} \;=\; \text{three fundamental paradigms}" display />
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { name: 'Bit', struct: '\\mathbb{F}_2', desc: 'Field', color: 'text-hom-muted' },
              { name: 'Qubit', struct: '\\mathbb{C}^2', desc: 'Hilbert Space', color: 'text-hom-purple' },
              { name: 'Hybit', struct: '\\mathcal{V} \\subset \\mathbb{N}_0^{18}', desc: 'Constrained Monoid', color: 'text-hom-gold' },
            ].map((p) => (
              <div key={p.name} className="text-center p-4 rounded-lg bg-hom-bg/50 border border-hom-border/30">
                <div className={`text-lg font-bold ${p.color}`}>{p.name}</div>
                <FormulaBlock tex={p.struct} />
                <div className="text-[10px] text-hom-muted mt-1">{p.desc}</div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </section>

      {/* Five Operations */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Metrik-Vektorial Operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {operations.map((op) => (
            <GlassPanel key={op.code}>
              <div className={`text-xs font-mono font-bold ${op.color}`}>{op.code}</div>
              <div className="text-sm font-semibold mt-1">{op.name}</div>
              <div className="text-[10px] text-hom-muted mt-1">{op.desc}</div>
            </GlassPanel>
          ))}
        </div>
      </section>

      {/* Verification */}
      <section>
        <GlassPanel title="1,380-Check Verification Framework" badge="ALL PASS" glow="green">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { bab: 'Bab I', checks: 658, label: 'Foundation' },
              { bab: 'Bab II', checks: 683, label: 'Metrik-Vektorial' },
              { bab: 'Bab III', checks: 39, label: 'Hybit Pipeline' },
            ].map((b) => (
              <div key={b.bab} className="p-4 rounded-lg bg-hom-bg/50 border border-hom-green/10">
                <div className="text-2xl font-bold text-hom-green font-mono">{b.checks}</div>
                <div className="text-xs text-hom-text">{b.bab}</div>
                <div className="text-[10px] text-hom-muted">{b.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <span className="font-mono text-sm text-hom-green">1,380 PASS · 0 FAIL · 0 SKIP</span>
          </div>
        </GlassPanel>
      </section>
    </div>
  );
}
