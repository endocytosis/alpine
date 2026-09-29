/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bodoni Moda"', 'Didot', '"Bodoni MT"', 'serif'],
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        canvas: '#F9F8F4',
        ink: '#0A0A0A',
        'ink-muted': '#3D3D3D',
        'ink-subtle': '#6B6B6B',
        line: '#D6D3CD',
        'line-strong': '#0A0A0A',
        surface: '#FFFFFF',
        'surface-alt': '#EBE8E2',
        accent: '#00E870',
        'accent-ink': '#042012',
        shock: '#FF2BD6',
        'shock-ink': '#1A0014',
        danger: '#E8123E',
        warning: '#FFB200',
      },
      spacing: {
        section: 'clamp(4rem, 12vw, 10rem)',
        'section-tight': 'clamp(3rem, 8vw, 6rem)',
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        md: '4px',
        lg: '6px',
      },
      fontSize: {
        'display-xl': ['clamp(3.5rem, 12vw, 10rem)', { lineHeight: '0.92', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.75rem, 8vw, 6rem)', { lineHeight: '0.92', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(2rem, 5vw, 3.5rem)', { lineHeight: '0.92', letterSpacing: '-0.02em' }],
        'heading-1': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.1' }],
        'heading-2': ['clamp(1.5rem, 2.5vw, 2.25rem)', { lineHeight: '1.1' }],
        'heading-3': ['1.25rem', { lineHeight: '1.1' }],
        'body-lg': ['1.125rem', { lineHeight: '1.55' }],
        body: ['1rem', { lineHeight: '1.55' }],
        'body-sm': ['0.875rem', { lineHeight: '1.55' }],
        overline: ['0.6875rem', { lineHeight: '1.55', letterSpacing: '0.08em', fontWeight: '600' }],
      },
      maxWidth: {
        measure: '38rem',
        'measure-wide': '48rem',
      },
      boxShadow: {
        line: '0 0 0 1px var(--poet-color-line)',
        'focus-ring': '0 0 0 2px var(--poet-color-canvas), 0 0 0 4px var(--poet-color-accent)',
      },
      transitionDuration: {
        fast: '80ms',
        sharp: '120ms',
      },
      transitionTimingFunction: {
        poet: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
