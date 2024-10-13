/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/**/*.{html,js}'],  // Make sure Tailwind scans all HTML and JS files
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
}