/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
        },
        accent: {
          indigo: '#4F46E5',
          green: '#22C55E',
          orange: '#F59E0B',
          red: '#EF4444',
        },
        bg: {
          page: '#F8FAFC',
          card: '#FFFFFF',
        },
        text: {
          primary: '#0F172A',
          secondary: '#475569',
        },
        border: '#E2E8F0',
        light: {
          blue: '#DBEAFE',
          green: '#DCFCE7',
          orange: '#FEF3C7',
          purple: '#EDE9FE',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Outfit', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-left': {
          from: { opacity: '0', transform: 'translateX(32px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-right': {
          from: { opacity: '0', transform: 'translateX(-32px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-slide-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-slide-right': {
          from: { opacity: '0', transform: 'translateX(-24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-left': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'slide-right': {
          from: { transform: 'translateX(-50%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-28px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(28px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'blob-move': {
          '0%,100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
        'chat-bubble-in': {
          from: { opacity: '0', transform: 'translateY(12px) scale(0.95)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'typing-dot': {
          '0%,100%': { transform: 'translateY(0)', opacity: '0.4' },
          '50%': { transform: 'translateY(-4px)', opacity: '1' },
        },
        'accordion-open': {
          from: { maxHeight: '0', opacity: '0' },
          to: { maxHeight: '600px', opacity: '1' },
        },
        'notification-in': {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'bot-wave': {
          '0%,100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-15deg)' },
          '75%': { transform: 'rotate(15deg)' },
        },
        'progress-fill': {
          from: { width: '0%' },
          to: { width: 'var(--w)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'pulse-ring-notif': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        'pulse-dot': {
          '0%,100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.6)' },
        },
        'shimmer': {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
        'shimmer-sweep': {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%,100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -12px, 0)' },
        },
        'card-rise': {
          from: { opacity: '0', transform: 'translateY(40px) scale(0.96)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'tag-pop': {
          '0%': { transform: 'scale(0) rotate(-5deg)' },
          '70%': { transform: 'scale(1.1) rotate(1deg)' },
          '100%': { transform: 'scale(1) rotate(0)' },
        },
        'badge-pop': {
          '0%': { transform: 'scale(0) rotate(-10deg)' },
          '70%': { transform: 'scale(1.25) rotate(3deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        'search-glow': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(37,99,235,0)' },
          '50%': { boxShadow: '0 0 0 8px rgba(37,99,235,0.12)' },
        },
        'glow-pulse': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(37,99,235,0)' },
          '50%': { boxShadow: '0 0 0 8px rgba(37,99,235,0.12)' },
        },
        'border-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'count-tick': {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'ticker': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'dismiss-fly': {
          from: { opacity: '1', transform: 'translateX(0) scale(1) rotate(0deg)' },
          to: { opacity: '0', transform: 'translateX(60px) scale(0.9) rotate(2deg)' },
        },
        'icon-pop': {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.3) rotate(-8deg)' },
          '70%': { transform: 'scale(0.9) rotate(4deg)' },
          '100%': { transform: 'scale(1) rotate(0)' },
        },
        'icon-bounce': {
          '0%,100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-6px)' },
          '60%': { transform: 'translateY(-3px)' },
        },
        'mark-read-sweep': {
          '0%': { backgroundColor: '#DBEAFE' },
          '100%': { backgroundColor: '#FFFFFF' },
        },
        'underline-grow': {
          from: { transform: 'scaleX(0)', transformOrigin: 'left' },
          to: { transform: 'scaleX(1)', transformOrigin: 'left' },
        },
        'bento-rise': {
          from: { opacity: '0', transform: 'translateY(20px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'bento-float': {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'progress-grow': {
          from: { width: '0%' },
          to: { width: 'var(--w, 84%)' },
        },
        'category-active': {
          from: { width: '0px' },
          to: { width: '3px' },
        },
        'section-label-in': {
          from: { opacity: '0', letterSpacing: '0.3em' },
          to: { opacity: '1', letterSpacing: '0.1em' },
        },
        'number-rise': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'bell-shake': {
          '0%,100%': { transform: 'rotate(0) scale(1)' },
          '15%': { transform: 'rotate(-18deg) scale(1.1)' },
          '30%': { transform: 'rotate(18deg) scale(1.1)' },
          '45%': { transform: 'rotate(-12deg)' },
          '60%': { transform: 'rotate(8deg)' },
          '75%': { transform: 'rotate(-5deg)' },
        },
        'draw-line': {
          from: { transform: 'scaleX(0)', transformOrigin: 'left' },
          to: { transform: 'scaleX(1)', transformOrigin: 'left' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out forwards',
        'fade-left': 'fade-left 0.5s ease-out forwards',
        'fade-right': 'fade-right 0.5s ease-out forwards',
        'fade-slide-up': 'fade-slide-up 0.5s ease-out forwards',
        'fade-slide-right': 'fade-slide-right 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        'slide-left': 'slide-left 25s linear infinite',
        'slide-right': 'slide-right 40s linear infinite',
        'slide-left-slow': 'slide-left 30s linear infinite',
        'slide-in-left': 'slide-in-left 0.5s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.5s ease-out forwards',
        'blob-move': 'blob-move 8s ease-in-out infinite',
        'chat-bubble-in': 'chat-bubble-in 0.3s ease-out forwards',
        'typing-dot': 'typing-dot 1s ease-in-out infinite',
        'accordion-open': 'accordion-open 0.35s ease-out forwards',
        'notification-in': 'notification-in 0.35s cubic-bezier(0.34,1.2,0.64,1) forwards',
        'bot-wave': 'bot-wave 0.6s ease-in-out',
        'progress-fill': 'progress-fill 1.2s ease-out forwards',
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
        'pulse-ring-notif': 'pulse-ring-notif 2s ease-out infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
        'shimmer-sweep': 'shimmer-sweep 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'card-rise': 'card-rise 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) forwards',
        'tag-pop': 'tag-pop 0.4s cubic-bezier(0.22,1,0.36,1) forwards',
        'badge-pop': 'badge-pop 0.4s cubic-bezier(0.34, 1.2, 0.64, 1) forwards',
        'search-glow': 'search-glow 2s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'border-flow': 'border-flow 4s ease infinite',
        'count-up': 'count-up 0.4s ease-out forwards',
        'count-tick': 'count-tick 0.3s ease-out forwards',
        'ticker': 'ticker 30s linear infinite',
        'dismiss-fly': 'dismiss-fly 0.3s ease-in forwards',
        'icon-pop': 'icon-pop 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)',
        'icon-bounce': 'icon-bounce 0.4s ease-in-out',
        'mark-read-sweep': 'mark-read-sweep 0.5s ease-out forwards',
        'underline-grow': 'underline-grow 0.2s ease-out forwards',
        'bento-rise': 'bento-rise 0.5s cubic-bezier(0.34, 1.1, 0.64, 1) forwards',
        'bento-float': 'bento-float 3s ease-in-out infinite',
        'progress-grow': 'progress-grow 1.2s ease-out forwards',
        'category-active': 'category-active 0.3s ease-out forwards',
        'section-label-in': 'section-label-in 0.5s ease-out forwards',
        'number-rise': 'number-rise 0.4s ease-out forwards',
        'bell-shake': 'bell-shake 0.6s ease-in-out',
        'draw-line': 'draw-line 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
}
