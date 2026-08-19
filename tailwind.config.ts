import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Premium Islamic Design System Colors
        'on-tertiary-container': '#b8f2d8',
        'secondary-container': '#5a4a2c',
        'outline-variant': '#4a4335',
        'on-error-container': '#ffdad6',
        background: '#0b1326',
        'tertiary-fixed': '#b8f2d8',
        'on-secondary-fixed': '#241a05',
        'on-primary-fixed': '#241a00',
        'secondary-fixed': '#f6e6c4',
        'on-background': '#dae2fd',
        'on-secondary-fixed-variant': '#5a4a2c',
        'surface-variant': '#2d3449',
        'on-secondary': '#3a2f16',
        'on-tertiary-fixed': '#00251c',
        'inverse-on-surface': '#283044',
        'on-surface-variant': '#cabfa8',
        'error-container': '#93000a',
        'surface-bright': '#31394d',
        'on-tertiary-fixed-variant': '#005141',
        'surface-container-highest': '#2d3449',
        'primary-container': '#8a6b1c',
        'primary-fixed-dim': '#f0cd6d',
        'on-error': '#690005',
        'surface-dim': '#0b1326',
        error: '#ffb4ab',
        'surface-container-lowest': '#060e20',
        'tertiary-fixed-dim': '#7fd4b0',
        'on-primary-container': '#ffe9ad',
        'inverse-primary': '#6b5300',
        'on-primary': '#3a2c00',
        outline: '#9a8f79',
        primary: '#f0cd6d',
        'on-tertiary': '#00382a',
        'surface-container-low': '#131b2e',
        'on-surface': '#dae2fd',
        'on-secondary-container': '#f6e6c4',
        'surface-container': '#171f33',
        'surface-tint': '#f0cd6d',
        'surface-container-high': '#222a3d',
        'tertiary-container': '#1f5a44',
        secondary: '#dcc9a4',
        tertiary: '#7fd4b0',
        surface: '#0b1326',
        'secondary-fixed-dim': '#dcc9a4',
        'primary-fixed': '#ffe9ad',
        'on-primary-fixed-variant': '#5c4700',
        'inverse-surface': '#dae2fd',
        // Legacy shadcn colors mapped to new system
        card: {
          DEFAULT: '#171f33',
          foreground: '#dae2fd',
        },
        popover: {
          DEFAULT: '#171f33',
          foreground: '#dae2fd',
        },
        muted: {
          DEFAULT: '#222a3d',
          foreground: '#bbcabf',
        },
        accent: {
          DEFAULT: '#2d3449',
          foreground: '#dae2fd',
        },
        destructive: {
          DEFAULT: '#93000a',
          foreground: '#ffdad6',
        },
        border: '#2d3449',
        input: '#2d3449',
        ring: '#f0cd6d',
        // `text-primary-foreground` and `text-secondary-foreground` are used by
        // the shadcn button and badge variants but were never defined here, so
        // they emitted no colour at all. Named as flat keys because `primary`
        // and `secondary` above are flat strings, and Tailwind will not merge a
        // string and an object under the same key.
        'primary-foreground': '#3a2c00',
        'secondary-foreground': '#3a2f16',
        'foreground': '#dae2fd',
        // Referenced by the unused sidebar primitive; defined so the classes
        // resolve rather than silently producing nothing.
        'sidebar-foreground': '#dae2fd',
        'sidebar-accent-foreground': '#f0cd6d',
      },
      fontFamily: {
        'display-lg-mobile': ['"Source Serif 4"'],
        'label-caps': ['Inter'],
        'quote-italic': ['"Source Serif 4"'],
        'headline-md': ['Inter'],
        'display-lg': ['"Source Serif 4"'],
        'body-md': ['Inter'],
        body: ['Inter', 'sans-serif'],
        headline: ['"Source Serif 4"', 'serif'],
        amiri: ['"Source Serif 4"', 'serif'],
      },
      fontSize: {
        'display-lg-mobile': ['36px', {lineHeight: '44px', letterSpacing: '-0.02em', fontWeight: '600'}],
        'label-caps': ['12px', {lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '700'}],
        'quote-italic': ['20px', {lineHeight: '30px', fontWeight: '400'}],
        'headline-md': ['24px', {lineHeight: '32px', fontWeight: '600'}],
        'display-lg': ['48px', {lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '600'}],
        'body-md': ['16px', {lineHeight: '24px', fontWeight: '400'}],
      },
      spacing: {
        'lg': '24px',
        'container-padding': '20px',
        'unit': '4px',
        'sm': '8px',
        'xs': '4px',
        'md': '16px',
        'xl': '32px',
        'gutter': '16px',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      keyframes: {
        'accordion-down': {
          from: {height: '0'},
          to: {height: 'var(--radix-accordion-content-height)'},
        },
        'accordion-up': {
          from: {height: 'var(--radix-accordion-content-height)'},
          to: {height: '0'},
        },
        'pulse-ring': {
          '0%': {transform: 'scale(0.95)', opacity: '0.1'},
          '50%': {transform: 'scale(1.05)', opacity: '0.4'},
          '100%': {transform: 'scale(0.95)', opacity: '0.1'},
        },
        'loading': {
          '0%': {left: '-30%', width: '30%'},
          '50%': {left: '40%', width: '50%'},
          '100%': {left: '100%', width: '30%'},
        },
        'float': {
          '0%, 100%': {transform: 'translateY(0)'},
          '50%': {transform: 'translateY(-10px)'},
        },
        'glow': {
          '0%, 100%': {boxShadow: '0 0 20px rgba(78, 222, 163, 0.3)'},
          '50%': {boxShadow: '0 0 40px rgba(78, 222, 163, 0.6)'},
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-ring': 'pulse-ring 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'loading': 'loading 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
