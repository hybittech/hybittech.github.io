export default function MetricBar({ label, value, max = 1, color = 'accent', suffix = '' }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const colorMap = {
    accent: 'bg-hom-accent',
    gold: 'bg-hom-gold',
    green: 'bg-hom-green',
    purple: 'bg-hom-purple',
    red: 'bg-hom-red',
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-mono">
        <span className="text-hom-muted">{label}</span>
        <span className="text-hom-text">
          {typeof value === 'number' ? value.toFixed(3) : value}
          {suffix}
        </span>
      </div>
      <div className="h-1.5 bg-hom-border/30 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colorMap[color] || colorMap.accent} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
