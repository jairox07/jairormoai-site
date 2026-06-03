/**
 * NOTE: This project uses Tailwind CSS v4 which reads configuration from
 * the @theme block in app/globals.css, NOT from this file.
 * This file is retained for reference and tooling compatibility only.
 */
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
        bg:    '#080B14',
        bg2:   '#0C1120',
        bg3:   '#0F1628',
        cyan:  '#4FC3F7',
        purp:  '#8B5CF6',
        mid:   '#6B8EF5',
        gray:  '#94A3B8',
        gray2: '#3D4F63',
      },
      fontFamily: {
        sora:  ['Sora', 'sans-serif'],
        mono:  ['Space Mono', 'monospace'],
      },
      backgroundImage: {
        'brand-grad': 'linear-gradient(135deg, #4FC3F7 0%, #6B8EF5 50%, #8B5CF6 100%)',
        'brand-grad-r': 'linear-gradient(135deg, #8B5CF6 0%, #6B8EF5 50%, #4FC3F7 100%)',
      },
      animation: {
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scroll-hint': 'scroll-hint 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-12px) scale(1.15)' },
        },
        'scroll-hint': {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'top' },
          '50%': { transform: 'scaleY(1)' },
          '100%': { transform: 'scaleY(0)', transformOrigin: 'bottom' },
        },
      },
    },
  },
  plugins: [],
}
export default config
