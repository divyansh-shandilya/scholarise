/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF8F4',
          100: '#F7F3EB',
          200: '#EFE8DA',
        },
        obsidian: {
          900: '#090A0D',
          800: '#14161B',
          700: '#23252A',
        }
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Plus Jakarta Sans',
          'Inter',
          'system-ui',
          'sans-serif'
        ]
      }
    },
  },
  plugins: [],
}
