/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        mint: '#62F5AD',
        lime: '#D9FF55',
        lavender: '#BDA5FF',
        cream: '#FFFDF6',
        pure: '#FFFFFF',
      },
      boxShadow: {
        neo: '3px 3px 0px #111111',
        'neo-sm': '2px 2px 0px #111111',
        'neo-lg': '5px 5px 0px #111111',
        'neo-xl': '7px 7px 0px #111111',
      },
      borderWidth: {
        '2': '2px',
        '3': '3px',
      },
      borderRadius: {
        'neo': '14px',
        'neo-sm': '10px',
        'neo-lg': '20px',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Outfit', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
