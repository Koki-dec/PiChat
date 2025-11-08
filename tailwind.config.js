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
        'primary': {
          DEFAULT: '#0066CC',
          dark: '#0052A3',
          light: '#3385D6',
        },
        'surface': {
          DEFAULT: '#FFFFFF',
          secondary: '#F8F9FA',
          border: '#D1D5DB', // はっきりしたグレー
        },
        'text': {
          primary: '#111827', // はっきりした黒
          secondary: '#4B5563', // はっきりしたグレー
          tertiary: '#6B7280', // はっきりしたグレー
        }
      }
    },
  },
  plugins: [],
}
