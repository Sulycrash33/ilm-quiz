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
      /**
       * A breakpoint inside the phone range.
       *
       * Tailwind's smallest default, `sm`, is 640px WIDE. No phone reaches it
       * in portrait — an iPhone 16 Pro Max is 440px — so every `sm:` class in
       * this app is desktop-only, and anything hidden behind one is invisible
       * to almost every player. That is exactly how the home page greeting came
       * to be absent on phones.
       *
       * `xs` at 380px sits between the small phones (320-375) and the common
       * ones (390-440), which is the only place a phone-first layout actually
       * has a decision to make.
       */
      screens: {
        xs: '380px',
      },
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
        /**
         * Semantic state colours.
         *
         * These exist because the app had been saying the same thing in two
         * vocabularies at once: 163 raw Tailwind palette classes sat beside
         * the design tokens, which gave the interface three golds
         * (`primary`, `amber-*`, `yellow-*`), two greens (`tertiary`,
         * `emerald-*`/`green-*`) and two reds (`error`, `red-*`). Which one a
         * component reached for was down to who wrote it.
         *
         * `success` is deliberately an alias of `tertiary` rather than a new
         * green. The palette already had a green that means "good"; adding a
         * second one a few degrees away would have re-created the very problem
         * this is closing. Likewise `danger` aliases `error`.
         *
         * `warning` is the one genuinely new hue, and it is pushed orange
         * (#f0a94d) rather than gold on purpose: the brand `primary` is
         * #f0cd6d, and a warning a few percent from the brand colour is a
         * warning nobody sees.
         */
        success: '#7fd4b0',
        'success-bright': '#b8f2d8',
        'on-success': '#00382a',
        'success-container': '#1f5a44',
        'on-success-container': '#b8f2d8',

        warning: '#f0a94d',
        'warning-bright': '#ffd9a8',
        'on-warning': '#452200',
        'warning-container': '#7a4a10',
        'on-warning-container': '#ffd9a8',

        danger: '#ffb4ab',
        'on-danger': '#690005',
        'danger-container': '#93000a',
        'on-danger-container': '#ffdad6',

        info: '#8fb8dc',
        'info-bright': '#c5dcf0',
        'on-info': '#0a2337',
        'info-container': '#1f4460',
        'on-info-container': '#c5dcf0',

        // Rarity and premium ownership. The store, the bundles and the
        // legendary avatar frames all reached for `purple-400`; this gives
        // that meaning a name.
        special: '#b9a2e3',
        'special-bright': '#ddd0f5',
        'on-special': '#2b1a4d',
        'special-container': '#463070',
        'on-special-container': '#ddd0f5',

        /**
         * The podium.
         *
         * Rank one, two and three were being drawn in `yellow-400`,
         * `gray-300` and `amber-700`, which meant a medal was borrowing the
         * warning ramp and the neutral ramp to say something neither of them
         * means. Worse, gold and bronze are both warm ambers: folding them
         * into one semantic `warning` token made first and third place
         * identical, which is the sort of thing a token migration does
         * quietly if the axis is never named.
         *
         * A medal is its own axis, so it gets its own three values. They are
         * shifted cooler than the raw palette equivalents to sit on the navy
         * surface without turning muddy.
         */
        'medal-gold': '#f2c94c',
        'on-medal-gold': '#3d2c00',
        'medal-silver': '#cdd5e0',
        'on-medal-silver': '#232a36',
        'medal-bronze': '#c07f3e',
        'on-medal-bronze': '#2b1705',

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
        // A slow gold breath for the one call to action on an empty home
        // screen. Deliberately slower than `animate-pulse`, which flickers too
        // fast to read as an invitation.
        //
        // This is the only decorative keyframe left here. `pulse-ring`,
        // `loading`, `float` and `glow` used to sit alongside it and were all
        // dead: nothing ever wrote `animate-glow`, so Tailwind never emitted
        // them, while globals.css declared its own copies under the same names
        // and those are the ones that have always rendered. They now live once,
        // in globals.css, next to the classes that use them.
        'pulse-slow': {
          '0%, 100%': {boxShadow: '0 0 22px -8px rgba(240, 205, 109, 0.35)'},
          '50%': {boxShadow: '0 0 34px -4px rgba(240, 205, 109, 0.6)'},
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-slow': 'pulse-slow 2.8s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
