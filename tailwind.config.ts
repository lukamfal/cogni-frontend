import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Source Serif 4', 'serif'],
      },
      colors: {
        sage: {
          DEFAULT: '#2f5744',
          light: '#4a7a63',
          dark: '#1c3b2c',
          50: '#f2f5f2',
          100: '#dbe6de',
        },
        cream: {
          DEFAULT: '#f7f5f0',
          dark: '#efece3',
          border: '#e2ddd0',
        },
        gold: {
          DEFAULT: '#a9812f',
          light: '#c9a24f',
          dark: '#8a6a24',
        },
      },
      borderRadius: {
        '2xl': '12px',
        '3xl': '16px',
      },
    },
  },
  plugins: [],
}

export default config
