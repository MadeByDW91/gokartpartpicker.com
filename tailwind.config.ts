import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'garage-orange': '#FF6B35',
        'garage-cream': '#F5F1E8',
        'garage-dark': '#1A1A1A',
        'garage-gray': '#4A4A4A',
        'success-green': '#10B981',
      },
      fontFamily: {
        'heading': ['var(--font-oswald)', 'sans-serif'],
        'body': ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config

