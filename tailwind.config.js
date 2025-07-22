/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        playerCyan: '#67e8f9',      // Tailwind's cyan-300
        playerGreen: '#a7f3d0',     // Tailwind's emerald-200 (pale green-ish)
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 12px rgba(103, 232, 249, 0.8)',   // playerCyan glow
        'glow-green': '0 0 12px rgba(167, 243, 208, 0.8)',  // playerGreen glow
      },
    },
  },
  plugins: [],
}
