/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        charcoal: '#101010',
        card: '#111111',
        primary: {
          DEFAULT: '#FF7900',
          dark: '#F4510B',
          glow: 'rgba(255, 121, 0, 0.25)',
        },
        border: {
          subtle: '#292929',
          focus: '#FF7900',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A1A1AA',
        },
      },
      boxShadow: {
        'orange-glow': '0 0 25px rgba(255, 121, 0, 0.35)',
        'orange-subtle': '0 4px 20px rgba(255, 121, 0, 0.2)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.8)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

