/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        zed: {
          dark: "#0d1117",
          light: "#ffffff",
          border: "#30363d",
          accent: "#58a6ff",
        },
        midnight: {
          bg: "#1a1b26",
          text: "#a9b1d6",
          accent: "#7aa2f7",
          border: "#414868",
          input: "#1f2335",
        },
        forest: {
          bg: "#1a1b26",
          text: "#c0caf5",
          accent: "#9ece6a",
          border: "#565f89",
          input: "#24283b",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
