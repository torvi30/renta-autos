import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        carbon: {
          950: '#08090C',
          900: '#0E1016',
          850: '#141720',
          800: '#1A1E29',
          750: '#212634',
          700: '#2A3042',
          600: '#3E465E',
        },
        gold: {
          300: '#F2DF9D',
          400: '#E5CD78',
          500: '#D4AF37', // Acento primario oro champán showroom
          600: '#B89324',
          700: '#8C6F19',
        },
        silver: {
          100: '#F8F9FB',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
        },
        status: {
          available: '#10B981',
          rented: '#3B82F6',
          maintenance: '#F59E0B',
          inactive: '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'showroom': '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(212, 175, 55, 0.05)',
        'showroom-glow': '0 0 35px rgba(212, 175, 55, 0.2)',
        'car-card': '0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.06)',
      },
      letterSpacing: {
        widest: '.2em',
        luxury: '.25em',
      },
      animation: {
        'fade-in': 'fadeIn 0.7s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 3s infinite',
        'alert-pop': 'alertPop 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        alertPop: {
          '0%': { opacity: '0', transform: 'scale(0.92) translateY(12px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'none' },
        },
      }
    },
  },
  plugins: [
    plugin(function({ addBase, addUtilities }) {
      addBase({
        ':root': {
          colorScheme: 'dark',
        },
        'body': {
          backgroundColor: '#08090C',
          color: '#F8F9FB',
          fontFamily: "'Outfit', 'Inter', sans-serif",
          overflowX: 'hidden',
        },
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          background: '#08090C',
        },
        '::-webkit-scrollbar-thumb': {
          background: '#212634',
          borderRadius: '4px',
          border: '1px solid #141720',
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: '#D4AF37',
        },
      });

      addUtilities({
        '.text-glow': {
          textShadow: '0 0 20px rgba(212, 175, 55, 0.35)',
        },
        '.bg-grid-pattern': {
          backgroundSize: '40px 40px',
          backgroundImage: 
            'linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
        },
        '.showroom-radial-spotlight': {
          background: 'radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.08) 0%, rgba(14, 16, 22, 0) 70%)',
        },
        '.border-luxury': {
          borderColor: 'rgba(255, 255, 255, 0.08)',
        },
        '.border-luxury-hover:hover': {
          borderColor: 'rgba(212, 175, 55, 0.4)',
        },
        '.scrollbar-none, .no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    }),
  ],
};
