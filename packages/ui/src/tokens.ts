export const tokens = {
  colors: {
    brandBlue: '#2F5BFF',
    brandBlueDark: '#1E3FCC',
    brandIndigo: '#5B4BEA',
    brandViolet: '#7C5CFF',
    ink: '#0F1B3D',
    text: '#1B2438',
    slate: '#64748B',
    canvas: '#F6F8FC',
    card: '#FFFFFF',
    tint: '#EAF0FF',
    tint2: '#F3F6FF',
    line: '#E2E8F3',
    ok: '#12AE85',
    warn: '#F59E0B',
    fail: '#E5484D',
    streak: '#FEC723'
  },
  radius: {
    card: '16px',
    pill: '999px',
    tag: '10px'
  },
  shadow: {
    card: '0 4px 16px rgba(15,27,61,0.06)'
  },
  font: {
    sans: "'Inter', system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"
  }
} as const;

export type DesignTokens = typeof tokens;
