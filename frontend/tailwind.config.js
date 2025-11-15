export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mtg-dark': '#0d0d0d',
        'mtg-gold': '#d4af37',
        'mtg-purple': '#7c3aed',
        'mtg-border': '#1a1a1a',
      },
      fontFamily: {
        'beleren': ['Beleren', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
