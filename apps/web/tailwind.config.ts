import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#F4A024',
          50: '#FEF6E7',
          100: '#FDECCF',
          500: '#F4A024',
          600: '#D88810',
        },
        ink: {
          DEFAULT: '#1A1A1A',
          muted: '#6B7280',
          subtle: '#9CA3AF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          page: '#F9FAFB',
          subtle: '#F5F5F5',
        },
        line: '#E5E7EB',
        difficulty: {
          easyBg: '#DCFCE7',
          easyText: '#15803D',
          modBg: '#FEF3C7',
          modText: '#92400E',
          hardBg: '#FEE2E2',
          hardText: '#B91C1C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '14px' }],
      },
      borderRadius: {
        card: '10px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(0,0,0,0.04)',
        paper: '0 4px 20px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
