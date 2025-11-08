/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
theme: {
    extend: {
       fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      scale: {
        '102': '1.02',
      }
    }
  },
  plugins: [],
}
