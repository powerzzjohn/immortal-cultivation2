/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'immortal': {
          bg: '#0f172a',
          primary: '#fbbf24',
          secondary: '#64748b',
          text: '#f8fafc',
          accent: '#06b6d4',
          wood: '#22c55e',
          fire: '#ef4444',
          earth: '#d97706',
          metal: '#e5e7eb',
          water: '#3b82f6',
        }
      },
      fontFamily: {
        'title': ['STSong', 'SimSun', 'serif'],
        'body': ['system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(251, 191, 36, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
