/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-pink': '#FAD1E8',
        'brand-blue': '#BEE3F8',
        'brand-text': '#2D3748',
        'brand-primary': '#EC4899',
        'brand-primary-hover': '#DB2777',
      }
    },
  },
  plugins: [],
}
