/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6c0a',
          700: '#c2570a',
          800: '#9a3f08',
          900: '#7c330a',
        },
        fpt: {
          orange:  '#F26522',
          light:   '#FBBF80',
          pale:    '#FDE8D0',
          pastel:  '#FFF5EE',
          cream:   '#FEF3E8',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
      boxShadow: {
        'orange-sm': '0 2px 8px rgba(242, 101, 34, 0.15)',
        'orange-md': '0 4px 20px rgba(242, 101, 34, 0.2)',
        'orange-lg': '0 8px 40px rgba(242, 101, 34, 0.25)',
      },
      backgroundImage: {
        'orange-gradient': 'linear-gradient(135deg, #F26522 0%, #FBBF80 100%)',
        'pastel-gradient': 'linear-gradient(135deg, #FFF5EE 0%, #FDE8D0 50%, #fff 100%)',
        'hero-pattern': "radial-gradient(circle at 20% 20%, rgba(242,101,34,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(251,191,128,0.12) 0%, transparent 50%)",
      },
    },
  },
  plugins: [],
}