/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        futora: {
          primary: '#2F5BFF',
          accent: '#5B4BEA',
          purple: '#7C5CFF',
          dark: '#0F1B3D',
          muted: '#5B6785',
          bg: '#F6F8FC',
          card: '#FFFFFF',
          border: '#E3E8F3',
          ok: '#12AE85',
          warn: '#F59E0B',
          fail: '#E5484D'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
