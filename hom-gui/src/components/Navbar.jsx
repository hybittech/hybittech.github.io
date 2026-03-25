import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/explorer', label: 'Explorer' },
  { to: '/lab', label: 'Lab' },
  { to: '/system', label: 'System' },
  { to: '/docs', label: 'Docs' },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="glass sticky top-0 z-50 border-b border-hom-border/50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="font-semibold text-base tracking-wider">
            <span className="neon-text">Hijaiyyah Operating Machine</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                pathname === link.to
                  ? 'bg-hom-accent/10 text-hom-accent border border-hom-accent/30'
                  : 'text-hom-muted hover:text-hom-text hover:bg-hom-panel'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
