/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefdf7",
          100: "#d5f8e8",
          500: "#16a36b",
          600: "#0f8759",
          700: "#0c6b49"
        },
        ink: "#151515"
      },
      boxShadow: {
        panel: "0 1px 2px rgba(21, 21, 21, 0.08)"
      }
    }
  },
  plugins: []
};
