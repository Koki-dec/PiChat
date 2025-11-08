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
          secondary: '#F5F5F5',
          border: '#E5E5E5',
        },
        'text': {
          primary: '#1A1A1A',
          secondary: '#666666',
          tertiary: '#999999',
        }
      }
    },
  },
  plugins: [],
}
