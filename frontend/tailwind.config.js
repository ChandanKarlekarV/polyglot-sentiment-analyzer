/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Human-Crafted Vintage Diary Palette (STRICT: No default blues/indigos/purples)
        diary: {
          bg: '#141210',          // Deepest warm black background
          surface: '#1a1715',     // Card / container surface
          surfaceAlt: '#23201d',  // Hover / elevated panel state
          border: '#3e3832',      // Hard 1px component border
          borderLight: '#8c8273', // Active/hover 1px border
          text: '#d4cdbd',        // Primary readable warm cream text
          heading: '#ece8e1',     // High-contrast serif title text
          muted: '#8c8273',       // Secondary telemetry / metadata grey
          accent: '#f9a826',      // Golden-orange direct-flash accent
          accentHover: '#e29017', // Darker golden-orange
          accentMuted: '#593e10', // Deep amber highlight container
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        // Enforce Zero Drop Shadows rule across all components
        none: 'none',
        sm: 'none',
        DEFAULT: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
      },
    },
  },
  plugins: [],
};
