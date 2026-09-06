/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        divine: {
          50: '#FFF8F0',
          100: '#FFEED9',
          200: '#FFD9A3',
          300: '#FFC06B',
          400: '#FFA833',
          500: '#FF9000',
          600: '#E87800',
          700: '#C05A00',
        },
        maroon: {
          50: '#FDF0F0',
          100: '#FBE0E0',
          200: '#F5C0C0',
          300: '#E89090',
          400: '#D06060',
          500: '#8B1A2B',
          600: '#6E1525',
          700: '#52101C',
          800: '#3A0C17',
          900: '#1F070C',
        },
        gold: {
          300: '#F2D9A4',
          400: '#E8C57E',
          500: '#D9AC5C',
          600: '#C09041',
          700: '#9C722F',
        },
        purple: {
          500: '#4A1A6B',
          600: '#3A1255',
          700: '#2A0C3F',
          800: '#1A0629',
          900: '#0D0314',
        },
        deepred: {
          500: '#7A1B2B',
          600: '#5E1421',
          700: '#430D18',
        },
        cream: {
          50: '#FFFDF8',
          100: '#FDF8EF',
          200: '#FAF0DE',
          300: '#F4E3C6',
          400: '#ECD1A6',
          500: '#E2BB82',
        },
        blush: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
        },
        ink: '#2B1D24',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
        sans: ['"Poppins"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 12px 40px -12px rgba(139, 26, 43, 0.25)',
        lift: '0 24px 60px -18px rgba(139, 26, 43, 0.35)',
        gold: '0 10px 30px -8px rgba(217, 172, 92, 0.6)',
        'gold-lg': '0 20px 50px -12px rgba(217, 172, 92, 0.5)',
        'divine-glow': '0 0 40px rgba(217, 172, 92, 0.4), 0 0 80px rgba(139, 26, 43, 0.2)',
        'gold-ring': '0 0 0 3px rgba(217, 172, 92, 0.5), 0 0 20px rgba(217, 172, 92, 0.3)',
      },
      backgroundImage: {
        'hero-pattern':
          'radial-gradient(circle at 20% 20%, rgba(139,26,43,0.3) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(217,172,92,0.3) 0%, transparent 45%), linear-gradient(160deg, #1F070C 0%, #3A0C17 50%, #2A0C3F 100%)',
        'gold-sheen':
          'linear-gradient(120deg, #E8C57E 0%, #D9AC5C 45%, #F2D9A4 70%, #C09041 100%)',
        'divine-radial':
          'radial-gradient(ellipse at center, rgba(217,172,92,0.15) 0%, transparent 70%)',
        'glass':
          'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite reverse',
        'float-delay': 'float 8s ease-in-out infinite 2s',
        shimmer: 'shimmer 2.5s linear infinite',
        'pop-in': 'popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'spin-slow': 'spin 8s linear infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'ripple': 'ripple 0.6s ease-out both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        popIn: {
          '0%': { opacity: 0, transform: 'scale(0.85)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(217, 172, 92, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(217, 172, 92, 0.6), 0 0 60px rgba(217, 172, 92, 0.2)' },
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(30px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: 1 },
          '100%': { transform: 'scale(4)', opacity: 0 },
        },
      },
    },
  },
  plugins: [],
}
