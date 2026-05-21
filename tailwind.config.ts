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
        cream: '#FAF5F0',
        charcoal: '#2D2A28',
        gold: '#C9A870',
        dark: '#1A1A18',
      },
      fontFamily: {
        display: ['var(--font-barlow-condensed)', 'Barlow Condensed', 'sans-serif'],
        body: ['var(--font-barlow)', 'Barlow', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.25em',
      },
      accentColor: {
        gold: '#C9A870',
      },
    },
  },
  plugins: [],
}
export default config
