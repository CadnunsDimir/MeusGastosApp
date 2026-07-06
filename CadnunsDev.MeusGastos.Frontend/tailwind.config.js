/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        positive: '#22c55e',
        negative: '#ef4444',
        surface: '#f8fafc',
        surfaceDark: '#0f172a'
      }
    }
  },
  darkMode: 'class',
  plugins: []
};
