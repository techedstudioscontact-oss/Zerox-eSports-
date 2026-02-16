/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Royal Black & Metallic Gold Theme
                'royal-black': '#0a0a0a',
                'dark-gray': '#1a1a1a',
                'metallic-gold': '#D4AF37',
                'bright-gold': '#FFD700',
                'dark-gold': '#B8941E',
                'border-gold': 'rgba(212, 175, 55, 0.3)',
            },
            fontFamily: {
                'display': ['Teko', 'sans-serif'],
                'body': ['Inter', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
            },
            boxShadow: {
                'gold-glow': '0 0 20px rgba(212, 175, 55, 0.5)',
            },
        },
    },
    plugins: [],
}
