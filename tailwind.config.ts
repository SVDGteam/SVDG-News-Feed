import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        svdg: {
          berkeley: '#0b3266',
          admiral: '#0a3c8a',
          sapphire: '#1254ac',
          crayola: '#2177e8',
          sky: '#67a2ef',
          'pea-coat': '#031020',
          'french-gray': '#a8a9ac',
          timberwolf: '#d7d7d7',
          platinum: '#eaeaea',
          white: '#ffffff',
          'sky-dancer': '#75fb9f',
          // Dark theme surfaces
          ink: '#020a14',
          surface: '#0a1c33',
          'surface-2': '#0f2747',
          // legacy aliases kept for any remaining old class references
          navy: '#0f1e2e',
          blue: '#1a3a5c',
          slate: '#2d4a6b',
          accent: '#2563eb',
          light: '#e8f0fb',
        },
        dv: {
          lime: '#cbe246',
          teal: '#00a6a6',
          periwinkle: '#8783d1',
          goldenrod: '#ffb400',
          tangerine: '#ff884d',
          coral: '#ff6b6b',
          rosewood: '#ad4d7c',
          'soft-plum': '#b29dd9',
          slate: '#4b4e6d',
          'sky-blue': '#56ccf2',
          'ocean-blue': '#005f99',
          'fern-green': '#4caf50',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        eyebrow: '0.14em',
        caps: '0.08em',
      },
      borderRadius: {
        bracket: '0px',
      },
    },
  },
  plugins: [],
}

export default config
