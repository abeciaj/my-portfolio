// Colors are CSS variables (see src/index.css) so each token
// switches automatically between the light and dark themes.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        page: token('page'),
        surface: token('surface'),
        sunken: token('sunken'),
        line: token('line'),
        ink: {
          DEFAULT: token('ink'),
          muted: token('ink-muted'),
        },
        accent: {
          DEFAULT: token('accent'),
          hover: token('accent-hover'),
        },
        'on-accent': token('on-accent'),
        success: token('success'),
        danger: token('danger'),
      },
      // Blog post styling (@tailwindcss/typography) mapped to the theme tokens.
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'rgb(var(--ink-muted))',
            '--tw-prose-headings': 'rgb(var(--ink))',
            '--tw-prose-lead': 'rgb(var(--ink-muted))',
            '--tw-prose-links': 'rgb(var(--accent))',
            '--tw-prose-bold': 'rgb(var(--ink))',
            '--tw-prose-counters': 'rgb(var(--ink-muted))',
            '--tw-prose-bullets': 'rgb(var(--accent))',
            '--tw-prose-hr': 'rgb(var(--line))',
            '--tw-prose-quotes': 'rgb(var(--ink))',
            '--tw-prose-quote-borders': 'rgb(var(--accent))',
            '--tw-prose-captions': 'rgb(var(--ink-muted))',
            '--tw-prose-code': 'rgb(var(--ink))',
            '--tw-prose-pre-code': '#f4f4f5',
            '--tw-prose-pre-bg': '#141417',
            '--tw-prose-th-borders': 'rgb(var(--line))',
            '--tw-prose-td-borders': 'rgb(var(--line))',
            a: { textUnderlineOffset: '3px' },
            'a:hover': { color: 'rgb(var(--accent-hover))' },
            pre: { border: '1px solid rgb(var(--line))', borderRadius: '0.75rem' },
            ':not(pre) > code': {
              backgroundColor: 'rgb(var(--accent) / 0.1)',
              borderRadius: '0.375rem',
              padding: '0.15em 0.4em',
              fontWeight: '500',
            },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
          },
        },
      },
      fontFamily: {
        // Self-hosted via @fontsource-variable (imported in src/index.js).
        sans: ['"Geist Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono Variable"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
