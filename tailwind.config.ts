import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        obsidia: {
          // Background layers
          bg: '#08080d',
          surface: '#0f0f18',
          card: '#151521',
          elevated: '#1c1c2e',
          border: '#2a2a3d',

          // Accent palette
          accent: '#7c3aed',
          'accent-light': '#8b5cf6',
          'accent-dark': '#6d28d9',
          'accent-glow': 'rgba(139, 92, 246, 0.3)',

          // Status colors
          success: '#10b981',
          'success-glow': 'rgba(16, 185, 129, 0.2)',
          danger: '#ef4444',
          'danger-glow': 'rgba(239, 68, 68, 0.2)',
          warning: '#f59e0b',
          'warning-glow': 'rgba(245, 158, 11, 0.2)',
          info: '#3b82f6',

          // Text
          text: '#f1f5f9',
          'text-secondary': '#94a3b8',
          'text-muted': '#64748b',
        },
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(139, 92, 246, 0.15), 0 0 60px rgba(139, 92, 246, 0.05)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.15)',
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.15)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, transparent 50%, rgba(139, 92, 246, 0.05) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'count-up': 'countUp 1s ease-out',
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
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.1)' },
          '50%': { boxShadow: '0 0 30px rgba(139, 92, 246, 0.25)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
