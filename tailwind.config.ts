/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D4192C', // 大红
          dark: '#A01220',
        },
        gold: {
          DEFAULT: '#FFD700', // 金色
          light: '#FFE44D',
          dark: '#C5A700',
        },
        'bg-dark': '#1A0000', // 深红背景
      },
      animation: {
        'pulse-fast': 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 1s infinite',
      },
    },
  },
  plugins: [],
}
