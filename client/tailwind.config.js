/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        trello: {
          blue: '#0079bf',
          green: '#61bd4f',
          yellow: '#f2d600',
          orange: '#ffab4a',
          red: '#eb5a46',
          purple: '#c377e0',
          pink: '#ff78cb',
          sky: '#00c2e0',
          lime: '#51e898',
        },
      },
    },
  },
  plugins: [],
}
