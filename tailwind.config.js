/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Nunito Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
                serif: ['"Nunito Sans"', 'serif'],
                inter: ['"Nunito Sans"', 'sans-serif'],
                nunito: ['"Nunito Sans"', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
