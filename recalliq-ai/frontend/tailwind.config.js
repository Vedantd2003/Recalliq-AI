/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        void: '#050508',
        surface: '#0d0d14',
        card: '#12121c',
        border: '#1e1e30',
        muted: '#2a2a40',
        accent: {
          DEFAULT: '#7c6aff',
          light: '#a597ff',
          glow: 'rgba(124, 106, 255, 0.15)',
        },
        neural: {
          cyan: '#00d4ff',
          violet: '#7c6aff',
          magenta: '#ff4ddb',
          amber: '#ffb800',
          red: '#ff4444',
          green: '#00e68a',
        },
        text: {
          primary: '#f0f0ff',
          secondary: '#8888aa',
          muted: '#555570',
        },
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(124,106,255,0.03) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(124,106,255,0.03) 1px, transparent 1px)`,
        'radial-glow': 'radial-gradient(ellipse at center, rgba(124,106,255,0.15) 0%, transparent 70%)',
        'card-gradient': 'linear-gradient(135deg, #12121c 0%, #0d0d14 100%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      boxShadow: {
        'glow': '0 0 30px rgba(124,106,255,0.3)',
        'glow-sm': '0 0 15px rgba(124,106,255,0.2)',
        'card': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
        'neural': '0 0 60px rgba(0,212,255,0.15)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-up': 'fadeUp 0.6s ease forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124,106,255,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(124,106,255,0.6)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
