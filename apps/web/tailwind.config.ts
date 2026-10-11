import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2F5BFF',
          dark: '#1E3FCC',
          indigo: '#5B4BEA',
          violet: '#7C5CFF'
        },
        ink: '#0F1B3D',
        slate: '#64748B',
        canvas: '#F6F8FC',
        tint: '#EAF0FF',
        'tint-2': '#F3F6FF',
        line: '#E2E8F3',
        ok: '#12AE85',
        warn: '#F59E0B',
        fail: '#E5484D',
        streak: '#FEC723'
      },
      borderRadius: {
        card: '16px',
        pill: '999px'
      },
      boxShadow: {
        card: '0 4px 16px rgba(15,27,61,.06)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
