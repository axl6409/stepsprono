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
        'flat-red': '#FF4911',
        'light-red': '#FF6B6B',
        'deep-red': '#c40404',

        // V2
        'grey-light': '#E9E9E9',
        'grey-medium': '#858383',
        'beige-light': '#F2FFCC',
        'green-light': '#CCFFCC',
        'green-soft': '#00CC99',
        'green-medium': '#BDFF00',
        'green-deep': '#02D302',
        'purple-light': '#FFCCFF',
        'purple-soft': '#CC99FF',
        'yellow-light': '#F3F5B2',
        'yellow-medium': '#FDD41D',
        'orange-medium': '#F7B009',
        'red-light': '#FFB5BE',
        'red-medium': '#F41731',
        'blue-light': '#CCCCFF',
        'blue-medium': '#6666FF',
      },
      fontFamily: {
        'sans': ['Montserrat'],
        'roboto': ['Roboto Mono'] || ['monospace'],
        'rubik': ['Rubik'] || ['sans-serif'],
        'title': ['Darker Grotesque'],
      },
      fontSize: {
        xxxs: '0.6rem', // 10px
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
        'flat-black-adjust-left': '-3px 2px 0 rgba(0,0,0,1);',
        'flat-black-adjust-50': '2px 2px 0 rgba(0,0,0,0.5);',
        'flat-black-middle': '0px 4px 0 4px rgba(0,0,0,1);',
        'flat-purple': '3px 4px 0 rgba(255,0,245,1);',
        'flat-purple-adjust': '2px 2px 0 rgba(255,0,245,1);',
        'green-medium': '1px 3px 0 rgba(189,255,0,1);',
        'flat-lime-adjust': '2px 2px 0 rgba(0,255,0,1);',
        'inner-black-light': 'inset 0px 5px 5px 5px rgba(0,0,0,0.5);',
      },
      backgroundSize: {
        'grid-70': '70px 70px',
      },
      textShadow: {
        'glow-green': '0px -1px 2px #00ff0352, 0px -1px 2px #00ff0352',
      },
      backgroundImage: {
        'bronze-gradient': 'linear-gradient(40deg, rgba(103, 50, 8, 1) 0%, rgba(219, 108, 43, 1) 17%, rgba(243, 150, 93, 1) 36%, rgba(161, 79, 26, 1) 57%, rgba(103, 50, 9, 1) 79%, rgba(175, 86, 30, 1) 100%)',
        'sliver-gradient': 'linear-gradient(40deg, rgba(71,71,71,1) 0%, rgba(216,215,214,1) 17%, rgba(239,237,228,1) 36%, rgba(125,125,124,1) 57%, rgba(80,80,80,1) 79%, rgba(211,211,210,1) 100%)',
        'golden-gradient': 'linear-gradient(40deg, rgba(163,122,28,1) 0%, rgba(211,168,77,1) 17%, rgba(255,236,148,1) 36%, rgba(211,168,77,1) 57%, rgba(163,122,28,1) 79%, rgba(255,215,124,1) 100%)',
        'grid-background': 'linear-gradient(90deg,#80808033 1px,transparent 0),linear-gradient(180deg,#80808033 1px,transparent 0)',
      },
      translate: {
        '-5': '-1.25rem',
      }
    },
  },
  plugins: [],
}