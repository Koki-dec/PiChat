/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      height: {
        'screen-custom': '515px',
      },
      width: {
        'screen-custom': '1920px',
      },
      colors: {
        'gemini': {
          'blue': '#1a73e8',
          'light-blue': '#4285f4',
          'dark': '#202124',
          'gray': '#5f6368',
          'light-gray': '#e8eaed',
          'surface': '#f8f9fa',
        }
      }
    },
  },
  plugins: [],
}
