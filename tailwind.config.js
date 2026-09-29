/** @type {import('tailwindcss').Config} */

function colorVar(name) {
  return `rgb(var(--poet-color-${name}) / <alpha-value>)`;
}

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bodoni Moda"', 'Didot', '"Bodoni MT"', 'serif'],
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        canvas: colorVar('canvas'),
        ink: colorVar('ink'),
        'ink-muted': colorVar('ink-muted'),
        'ink-subtle': colorVar('ink-subtle'),
        line: colorVar('line'),
        'line-strong': colorVar('line-strong'),
        surface: colorVar('surface'),
        'surface-alt': colorVar('surface-alt'),
        accent: colorVar('accent'),
        'accent-ink': colorVar('accent-ink'),
        shock: colorVar('shock'),
        'shock-ink': colorVar('shock-ink'),
        danger: colorVar('danger'),
        warning: colorVar('warning'),
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
        line: '0 0 0 1px rgb(var(--poet-color-line))',
        'focus-ring': '0 0 0 2px rgb(var(--poet-color-canvas)), 0 0 0 4px rgb(var(--poet-color-accent))',
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
