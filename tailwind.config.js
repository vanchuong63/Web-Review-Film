/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js}",
    "./src/**/*.{html,js}"
  ],
  theme: {
    screens: {
      'xs': '480px',  // Thêm breakpoint cho điện thoại nhỏ
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: '#4dbf00',
        secondary: '#141414',
        dark: '#000000',
        light: '#ffffff'
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        heading: ['Sen', 'sans-serif']
      }
    },
  },
  plugins: [],
}