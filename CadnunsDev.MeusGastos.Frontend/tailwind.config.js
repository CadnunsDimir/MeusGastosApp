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
