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
        // 🎨 LUMI 颜色系统优化
        primary: {
          DEFAULT: '#facc15',  // 金色
          50: 'rgba(250, 204, 21, 0.05)',
          100: 'rgba(250, 204, 21, 0.1)',
          200: 'rgba(250, 204, 21, 0.2)',
          300: 'rgba(250, 204, 21, 0.3)',
          400: 'rgba(250, 204, 21, 0.4)',
          500: 'rgba(250, 204, 21, 0.5)',
          600: 'rgba(250, 204, 21, 0.6)',
          700: 'rgba(250, 204, 21, 0.7)',
          800: 'rgba(250, 204, 21, 0.8)',
          900: 'rgba(250, 204, 21, 0.9)',
        },
        success: {
          DEFAULT: '#22c55e',  // 绿色
          50: 'rgba(34, 197, 94, 0.05)',
          100: 'rgba(34, 197, 94, 0.1)',
          200: 'rgba(34, 197, 94, 0.2)',
          300: 'rgba(34, 197, 94, 0.3)',
          400: 'rgba(34, 197, 94, 0.4)',
          500: 'rgba(34, 197, 94, 0.5)',
        },
        danger: {
          DEFAULT: '#ef4444',  // 红色
          50: 'rgba(239, 68, 68, 0.05)',
          100: 'rgba(239, 68, 68, 0.1)',
          200: 'rgba(239, 68, 68, 0.2)',
          300: 'rgba(239, 68, 68, 0.3)',
          400: 'rgba(239, 68, 68, 0.4)',
          500: 'rgba(239, 68, 68, 0.5)',
        },
        info: {
          DEFAULT: '#3b82f6',  // 蓝色
          50: 'rgba(59, 130, 246, 0.05)',
          100: 'rgba(59, 130, 246, 0.1)',
          200: 'rgba(59, 130, 246, 0.2)',
          300: 'rgba(59, 130, 246, 0.3)',
          400: 'rgba(59, 130, 246, 0.4)',
          500: 'rgba(59, 130, 246, 0.5)',
        },
        // 保留原有颜色以兼容
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
        secondary: {
          DEFAULT: '#8b5cf6',
          20: 'rgba(139, 92, 246, 0.2)',
          30: 'rgba(139, 92, 246, 0.3)',
          40: 'rgba(139, 92, 246, 0.4)'
        },
        accent: {
          DEFAULT: '#1f2937',
          50: 'rgba(31, 41, 55, 0.5)'
        },
        background: {
          darkest: '#080808',
          darker: '#0a0a0a',
          dark: '#0d0d0d',
          elevated: '#111111',
          card: '#151515'
        },
        // 卡片背景颜色
        card: {
          bg: 'rgba(26, 26, 26, 0.8)',
          border: 'rgba(250, 204, 21, 0.2)',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
        display: ['Playfair Display', 'serif']
      },
      // 📏 间距系统优化
      spacing: {
        'xs': 'var(--spacing-xs)',
        'sm': 'var(--spacing-sm)',
        'md': 'var(--spacing-md)',
        'lg': 'var(--spacing-lg)',
        'xl': 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        '3xl': 'var(--spacing-3xl)',
      },
      // 背景渐变
      backgroundImage: {
        'gradient-lumi': 'var(--bg-gradient)',
      },
    },
  },
  plugins: [],
}

