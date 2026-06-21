import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        museum: {
          bg: '#1a1814',
          'bg-elevated': '#242019',
          'bg-glass': 'rgba(36, 32, 25, 0.7)',
          text: '#e8e6e1',
          'text-muted': '#a8a49c',
          accent: '#c9a227',
          'accent-hover': '#d4b03a',
          secondary: '#8b9d83',
          'secondary-hover': '#9bae92',
          danger: '#c45b4a',
          'danger-hover': '#d06b5a',
          border: 'rgba(201, 162, 39, 0.15)',
          'border-hover': 'rgba(201, 162, 39, 0.3)',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(201, 162, 39, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(201, 162, 39, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        museum: '0 4px 30px rgba(0, 0, 0, 0.3)',
        'museum-lg': '0 8px 60px rgba(0, 0, 0, 0.5)',
        'accent-glow': '0 0 20px rgba(201, 162, 39, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
