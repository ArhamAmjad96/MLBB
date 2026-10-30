/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0F14',
          surface1: '#121922',
          surface2: '#182231',
          border: '#273244',
          text: '#F3F6FA',
          muted: '#9FB0C5',
        },
        theme: {
          teal: '#00D1C7',
          blue: '#2D8CFF',
          red: '#FF4D67',
          gold: '#F5B942',
          green: '#22C55E',
          amber: '#F59E0B',
          danger: '#EF4444',
        },
        hok: {
          primary: '#e6a23c',
          secondary: '#b88230',
          dark: '#1a140a',
          accent: '#ffd04b'
        },
        mlbb: {
          primary: '#3b82f6',
          secondary: '#1d4ed8',
          dark: '#0b132b',
          accent: '#60a5fa'
        },
        esports: {
          dark: '#0B0F14',
          card: '#121922',
          surface2: '#182231',
          border: '#273244',
          blue: '#2D8CFF',
          red: '#FF4D67',
          gold: '#F5B942',
          teal: '#00D1C7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Teko', 'Impact', 'sans-serif']
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '60%': { transform: 'scale(1.03)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'slide-down': {
          '0%': { transform: 'translateY(-30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        'pop-in': 'pop-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer': 'shimmer 2.5s infinite linear'
      }
    },
  },
  plugins: [],
}
