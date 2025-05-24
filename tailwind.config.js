/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gaming: {
          primary: '#06b6d4',
          secondary: '#8b5cf6',
          accent: '#ec4899',
          dark: '#0f0f23',
          darker: '#1a1a2e',
        }
      },
      fontFamily: {
        gaming: ['Orbitron', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          from: {
            'box-shadow': '0 0 5px #06b6d4, 0 0 10px #06b6d4, 0 0 15px #06b6d4',
          },
          to: {
            'box-shadow': '0 0 10px #8b5cf6, 0 0 20px #8b5cf6, 0 0 30px #8b5cf6',
          },
        },
      },
    },
  },
  plugins: [],
}