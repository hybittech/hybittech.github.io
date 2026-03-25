/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        hom: {
          bg: '#0a0a0f',
          panel: '#111118',
          border: '#1e1e2e',
          accent: '#00e5ff',
          gold: '#ffd700',
          green: '#00ff88',
          red: '#ff4466',
          purple: '#a855f7',
          text: '#e0e0e8',
          muted: '#6b7280',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 229, 255, 0.15)',
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.15)',
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.15)',
      },
    },
  },
  plugins: [],
};
