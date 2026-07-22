/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter_400Regular"],
        inter: ["Inter_400Regular"],
        "inter-medium": ["Inter_500Medium"],
        "inter-semibold": ["Inter_600SemiBold"],
        "inter-bold": ["Inter_700Bold"],
        "inter-black": ["Inter_900Black"],
      },
      fontSize: {
        'display': ['32px', { lineHeight: '38px' }],
        'screen-title': ['24px', { lineHeight: '30px' }],
        'section-title': ['20px', { lineHeight: '28px' }],
        'card-title': ['18px', { lineHeight: '24px' }],
        'body': ['16px', { lineHeight: '24px' }],
        'secondary': ['14px', { lineHeight: '20px' }],
        'small': ['12px', { lineHeight: '16px' }],
        'button': ['16px', { lineHeight: '24px' }],
      },
      opacity: {
        'secondary': '0.7',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
      }
    },
  },
  plugins: [],
}

