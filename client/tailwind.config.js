/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        archive: {
          bg: '#111210',
          surface: '#191A17',
          surface2: '#22231F',
          hover: '#282A25',
          text: '#F0EFE8',
          muted: '#999A90',
          border: '#34352F',
          borderSubtle: '#262723',
          accent: '#C5E86C',
          accentHover: '#D4F285',
          accentDim: 'rgba(197, 232, 108, 0.12)'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace']
      },
      borderRadius: {
        'none': '0',
        'xs': '2px',
        'sm': '3px',
        'DEFAULT': '4px',
        'md': '6px',
        'lg': '8px'
      }
    },
  },
  plugins: [],
}
