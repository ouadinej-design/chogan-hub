/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdf9ed',
          100: '#f9f0cc',
          200: '#f3df95',
          300: '#ecc953',
          400: '#e4b22a',
          500: '#C9A84C',
          600: '#a8821c',
          700: '#865f18',
          800: '#6e4b1a',
          900: '#5c3f1a',
        },
        dark: {
          900: '#07070f',
          800: '#0d0d1a',
          700: '#12121f',
          600: '#1a1a2e',
          500: '#22223b',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseGold: { '0%,100%': { boxShadow: '0 0 0 0 rgba(201,168,76,0.4)' }, '50%': { boxShadow: '0 0 0 10px rgba(201,168,76,0)' } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #C9A84C, #e8c97a, #C9A84C)',
        'gradient-dark': 'linear-gradient(135deg, #07070f, #12121f)',
      }
    },
  },
  plugins: [],
};
