/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        noir: '#050505',
        anthracite: '#121212',
        carbon: '#1A1A1A',
        steel: '#262626',
        ash: '#E5E5E5',
        neon: '#35FF8A',
        electric: '#3B82F6',
        // Tokens texte à contraste maîtrisé (WCAG AA sur fond sombre)
        muted: '#A3A3A3', // ~7:1 sur #050505 — texte secondaire
        faint: '#9E9E9E', // Contrast-compliant (AA >4.5:1 on dark)
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '0',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(53,255,138,0.25), 0 8px 40px -12px rgba(53,255,138,0.35)',
        'glow-blue': '0 0 0 1px rgba(59,130,246,0.25), 0 8px 40px -12px rgba(59,130,246,0.35)',
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 18px 50px -24px rgba(0,0,0,0.9)',
        'card-hover': '0 1px 0 0 rgba(255,255,255,0.06) inset, 0 28px 70px -28px rgba(0,0,0,0.95)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.5s ease both',
        shimmer: 'shimmer 8s linear infinite',
      },
    },
  },
  plugins: [],
}
