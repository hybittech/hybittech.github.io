export default function VectorDisplay({ label, vector, highlights = {} }) {
  return (
    <div className="font-mono text-xs">
      {label && <div className="text-hom-muted mb-1 text-[10px]">{label}</div>}
      <div className="flex flex-wrap gap-0.5">
        {vector.map((val, i) => (
          <span
            key={i}
            className={`w-7 h-7 flex items-center justify-center rounded text-[10px] border ${
              highlights[i]
                ? 'bg-hom-accent/20 border-hom-accent/40 text-hom-accent'
                : val > 0
                ? 'bg-hom-panel border-hom-border text-hom-text'
                : 'bg-transparent border-hom-border/30 text-hom-muted/50'
            }`}
          >
            {val}
          </span>
        ))}
      </div>
    </div>
  );
}
