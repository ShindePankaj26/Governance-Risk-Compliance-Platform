/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        grc: {
          bg:      '#0a0e1a',
          bg2:     '#111827',
          bg3:     '#1a2236',
          card:    '#141c2e',
          card2:   '#1e2a42',
          border:  '#2a3550',
          border2: '#334066',
        },
      },
    },
  },
  plugins: [],
}
