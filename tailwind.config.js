/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,jsx,ts,tsx}",
    "./**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'bg-gray-900',
    'text-white',
    'bg-cyan-500',
    'text-cyan-400',
    'bg-gray-800',
    'text-gray-200',
    'bg-red-500',
    'hover:bg-red-600',
    'focus:ring-red-400',
    'hover:bg-cyan-600',
    'focus:ring-cyan-400',
    'text-gray-500',
    'hover:text-cyan-400',
    'bg-cyan-900/50',
    'bg-gray-600',
    'hover:bg-gray-700',
    'hover:text-red-400',
    'animate-pulse',
    'bg-gray-700',
  ]
}