import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        'av-cream':  '#f2e7df',
        'av-white':  '#ffffff',
        'av-taupe':  '#c8bfb9',
        'av-gray':   '#737373',
        'av-ink':    '#343133',
        'av-black':  '#1a1815',
        // Legacy aliases kept for existing admin pages
        cream:    '#f2e7df',
        charcoal: '#343133',
        gold:     '#c8bfb9',
        dark:     '#1a1815',
      },
      fontFamily: {
        display: ['var(--f-display)', 'Anton', 'Impact', 'sans-serif'],
        sans:    ['var(--f-sans)', 'DM Sans', 'Helvetica Neue', 'system-ui', 'sans-serif'],
        mono:    ['var(--f-mono)', 'Fira Code', 'ui-monospace', 'monospace'],
        script:  ['var(--f-script)', 'Caveat', 'cursive'],
        body:    ['var(--f-sans)', 'DM Sans', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.25em',
        'ultra': '0.45em',
      },
    },
  },
  plugins: [],
}
export default config
