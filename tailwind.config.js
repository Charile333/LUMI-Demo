/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          light: '#a78bfa',
          DEFAULT: '#8b5cf6',
          dark: '#7c3aed'
        },
        purple: {
          light: '#a78bfa',
          DEFAULT: '#8b5cf6',
          dark: '#7c3aed',
          darker: '#6d28d9'
        },
        dark: {
          light: '#f8f9fa',
          DEFAULT: '#ffffff',
          darker: '#f1f3f5'
        },
        primary: {
          DEFAULT: '#ffffff',
          800: '#f8f9fa'
        },
        secondary: {
          DEFAULT: '#8b5cf6',
          20: 'rgba(139, 92, 246, 0.2)',
          30: 'rgba(139, 92, 246, 0.3)',
          40: 'rgba(139, 92, 246, 0.4)'
        },
        accent: {
          DEFAULT: '#1f2937',
          50: 'rgba(31, 41, 55, 0.5)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif']
      },
    },
  },
  plugins: [],
}

