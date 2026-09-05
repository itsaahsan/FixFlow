/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0b",
        muted: "#6b7280",
        border: "#e5e7eb",
        accent: "#111827",
      },
      fontFamily: { sans: ["Inter","ui-sans-serif","system-ui"] }
    },
  },
  plugins: [],
}

