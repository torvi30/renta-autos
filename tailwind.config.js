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
        sans: ['Outfit', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
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
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      }
    },
  },
  plugins: [],
}
