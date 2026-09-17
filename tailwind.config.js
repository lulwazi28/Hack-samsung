/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        app: '#F3F5F9',
        card: '#FFFFFF',
        border: '#E6E9F0',
        sidebar: '#0B1437',
        sidebarhover: '#16204A',
        sidebarmuted: '#8A93B8',
        ink: '#111827',
        muted: '#6B7280',
        primary: '#2563EB',
        primarydark: '#1D4ED8',
        primarylight: '#EEF3FF',
        success: '#16A34A',
        successlight: '#EAFBF0',
        warning: '#D97706',
        warninglight: '#FFF6E5',
        danger: '#DC2626',
        dangerlight: '#FDEEEE',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s ease-out',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
      },
    },
  },
  plugins: [],
};
