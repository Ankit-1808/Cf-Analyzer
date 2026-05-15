/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1d2238",
        coral: "#ff7a59",
        tide: "#1f5f8b",
        mist: "#f2efe8",
        mint: "#8fd3c2"
      },
      boxShadow: {
        panel: "0 18px 45px rgba(29, 34, 56, 0.12)"
      },
      fontFamily: {
        sans: ["Trebuchet MS", "Gill Sans", "Segoe UI", "sans-serif"]
      }
    }
  },
  plugins: []
};
