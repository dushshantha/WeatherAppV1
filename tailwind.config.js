/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'purple-accent': '#48319D',
        'cyan-accent': '#40CBD8',
        'bg-dark-start': '#2E335A',
        'bg-dark-end': '#1C1B33',
      },
      backgroundImage: {
        'dark-gradient': 'linear-gradient(to bottom, #2E335A, #1C1B33)',
      },
    },
  },
  plugins: [],
}
