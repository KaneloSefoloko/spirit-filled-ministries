export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#38bdf8",   // sky blue
                secondary: "#7c3aed" // purple
            }
        },
        fontFamily: {
            display: ["Cormorant Garamond", "serif"],
            sans: ["Inter", "sans-serif"]
        }
    },
    plugins: []
};