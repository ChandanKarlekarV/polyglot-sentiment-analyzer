// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ledger-black': '#141210',
        'ledger-panel': '#1a1715',
        'ledger-border': '#3e3832',
        'ledger-text-main': '#ece8e1',
        'ledger-text-muted': '#8c8273',
        'ledger-accent': '#f9a826',
        'ledger-accent-muted': '#a66c0d',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
