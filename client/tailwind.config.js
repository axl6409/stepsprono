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
        'green-lime-deep': '#02d302',
        'flat-yellow': '#F4D738',
        'bright-yellow': '#FFFF00',
        'electric-blue': '#7DF9FF',
        'flat-blue': '#3300FF',
        'flat-purple': '#FF00F5',
        'deep-purple': '#b40cd6',
        'flat-red': '#FF4911',
        'light-red': '#FF6B6B',
        'deep-red': '#c40404',
        'flat-orange': '#E66F15',
      },
      fontFamily: {
        'sans': ['Montserrat'],
        'title': ['Darker Grotesque'],
      },
      fontSize: {
        xxs: '0.7rem', // 12px
        xs: '0.85rem', // 13.6px
        sm: '1rem', // 16px
        base: '1.2rem', // 18px
        l: '1.25rem', // 20px
        xl: '1.45rem', // 24px
        xl2: '1.72rem', // 28px
        xl3: '2rem', // 32px
        xl4: '2.5rem', // 40px
        xl5: '3rem', // 48px
        xl6: '4rem', // 64px
        xl7: '5rem', // 80px
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
        'flat-black-adjust': '2px 2px 0 rgba(0,0,0,1);',
        'flat-black-adjust-50': '2px 2px 0 rgba(0,0,0,0.5);',
        'flat-black-middle': '0px 4px 0 4px rgba(0,0,0,1);',
        'flat-purple': '3px 4px 0 rgba(255,0,245,1);',
        'flat-purple-adjust': '2px 2px 0 rgba(255,0,245,1);',
        'flat-lime': '3px 4px 0 rgba(0,255,0,1);',
        'flat-lime-adjust': '2px 2px 0 rgba(0,255,0,1);',
        'inner-black-light': 'inset 0px 5px 5px 5px rgba(0,0,0,0.5);',
      },
      translate: {
        '-5': '-1.25rem',
      }
    },
  },
  plugins: [],
}