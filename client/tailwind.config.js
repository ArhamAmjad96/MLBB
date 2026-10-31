/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
          dark: '#0a0d14',
          card: '#121722',
          border: '#1e293b',
          blue: '#0284c7',
          red: '#dc2626'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Teko', 'Impact', 'sans-serif']
      }
    },
  },
  plugins: [],
}
