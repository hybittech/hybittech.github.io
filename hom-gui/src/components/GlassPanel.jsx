export default function GlassPanel({ children, className = '', title, badge, glow }) {
  const glowClass = glow === 'gold' ? 'shadow-glow-gold' : glow === 'green' ? 'shadow-glow-green' : glow ? 'shadow-glow' : '';

  return (
    <div className={`glass p-5 ${glowClass} ${className}`}>
      {(title || badge) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-sm font-semibold text-hom-text tracking-wide">{title}</h3>}
          {badge && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-hom-accent/10 text-hom-accent border border-hom-accent/20">
              {badge}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
