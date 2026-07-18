/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        positive: '#22c55e',
        negative: '#ef4444',
        surface: '#f8fafc',
        surfaceDark: '#0f172a',
        paper: '#F1EFE4',
        'paper-dark': '#E6E1CE',
        ink: '#1b202e',
        'ink-soft': '#3f4b57',
        brass: '#C08A3E',
        'brass-dark': '#9C6C29',
        sage: '#4f6b78',
        rule: '#D3CDB8',
        stamp: '#2f496b',
        night: '#1C1A15',
        'night-soft': '#242119',
        panel: '#2A2620',
        'rule-dark': '#4A4636',
        stone: '#B5AF9C',
        'sage-light': '#9BB6BE',
        'brass-light': '#D9A94F',
        'stamp-light': '#7FA8D9',
        brick: '#9C3B2E',
        'brick-light': '#E08A73',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    }
  },
  darkMode: 'class',
  plugins: []
};
