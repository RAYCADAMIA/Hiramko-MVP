/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./Pages/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./App.tsx",
        "./index.tsx",
        "./main.tsx",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Space Grotesk', 'sans-serif'],
            },
            colors: {
                slate: {
                    950: '#020617',
                }
            }
        },
    },
    plugins: [],
}
