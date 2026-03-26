import Navbar from './Navbar';
import { useLocale } from '../store/useLocale';

export default function Layout({ children }) {
  const { t } = useLocale();
  return (
    <div className="min-h-screen bg-hom-bg flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 md:px-8 py-6 max-w-[1400px] mx-auto w-full">
        {children}
      </main>
      <footer className="border-t border-hom-border/30 py-4 text-center text-xs text-hom-muted">
        <span className="neon-text">HOM</span> — {t('layout.footer')}
      </footer>
    </div>
  );
}
