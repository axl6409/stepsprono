/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'green-lime': "#00ff00",
        'flat-yellow': '#F4D738',
        'bright-yellow': '#FFFF00',
        'electric-blue': '#7DF9FF',
        'flat-blue': '#3300FF',
        'flat-purple': '#FF00F5',
        'flat-red': '#FF4911',
        'light-red': '#FF6B6B'
      },
      fontFamily: {
        'sans': ['Montserrat'],
        'title': ['Darker Grotesque'],
      },
      fontSize: {
        xs: '0.85rem', // 13.6px
        sm: '1rem', // 16px
        base: '1.2rem', // 18px
        l: '1.25rem', // 20px
        xl: '1.45rem', // 24px
        xxl: '1.72rem', // 28px
        xxxl: '2rem', // 32px
        x4l: '2.5rem', // 40px
      },
      height: {
        '10vh': '10vh',
        '20vh': '20vh',
        '30vh': '30vh',
        '40vh': '40vh',
        '50vh': '50vh',
        '60vh': '60vh',
        '70vh': '70vh',
        '80vh': '80vh',
        '90vh': '90vh',
        '100vh': '100vh',
      },
      boxShadow: {
        'menu': '0.25rem 0.5rem 2rem rgba(0,0,0,.16);',
        'flat-black': '3px 4px 0 rgba(0,0,0,1);',
        'flat-black-adjust': '2px 2px 0 rgba(0,0,0,1)'
      },
      translate: {
        '-5': '-1.25rem',
      }
    },
  },
  plugins: [],
}