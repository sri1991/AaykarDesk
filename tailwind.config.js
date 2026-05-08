/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#0a1929',
        },
        cream: {
          50: '#fefdfb',
          100: '#fdf8f0',
          200: '#faf0e1',
          300: '#f5e6cc',
          400: '#e8d5b0',
        },
        urgency: {
          low: '#2d6a4f',
          medium: '#e09f3e',
          high: '#d62828',
          overdue: '#6a040f',
        },
        status: {
          new: '#486581',
          pending: '#e09f3e',
          active: '#2d6a4f',
          complete: '#1b4332',
          filed: '#334e68',
        },
      },
      fontFamily: {
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        table: ['13px', '18px'],
        label: ['11px', '14px'],
        stat: ['28px', '32px'],
      },
    },
  },
  plugins: [],
}
