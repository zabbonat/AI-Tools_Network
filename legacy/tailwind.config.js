module.exports = {
  content: [
    "./pages/*.{html,js}",
    "./index.html",
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./components/**/*.{html,js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          DEFAULT: "#ff4b4b", // red-500
          hover: "#ff3333", // red-600
          light: "#ff6b6b", // red-400
        },
        // Secondary Colors
        secondary: {
          DEFAULT: "#262730", // gray-800
          hover: "#2f3139", // gray-750
        },
        // Accent Colors
        accent: {
          DEFAULT: "#4dabf7", // blue-400
          hover: "#339af0", // blue-500
          light: "#74c0fc", // blue-300
        },
        // Background Colors
        background: "#0E1117", // slate-950
        surface: {
          DEFAULT: "#1a1d23", // gray-900
          elevated: "#262730", // gray-800
        },
        // Text Colors
        text: {
          primary: "#ffffff", // white
          secondary: "#a1a8b0", // gray-400
          tertiary: "#6c757d", // gray-500
        },
        // Status Colors
        success: {
          DEFAULT: "#51cf66", // green-500
          light: "#69db7c", // green-400
        },
        warning: {
          DEFAULT: "#ffd43b", // yellow-400
          dark: "#fcc419", // yellow-500
        },
        error: {
          DEFAULT: "#ff6b6b", // red-400
          dark: "#ff4b4b", // red-500
        },
        // Border Colors
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.1)", // white-10
          active: "rgba(255, 75, 75, 0.3)", // red-30
          hover: "rgba(255, 255, 255, 0.15)", // white-15
        },
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0, 0, 0, 0.3)',
        'DEFAULT': '0 1px 3px rgba(0, 0, 0, 0.3)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.35)',
        'lg': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'xl': '0 8px 24px rgba(0, 0, 0, 0.45)',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'pulse-slow': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
        'fade-in': 'fadeIn 200ms ease-smooth',
        'slide-up': 'slideUp 300ms ease-smooth',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      minWidth: {
        '44': '44px',
      },
      minHeight: {
        '44': '44px',
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
}