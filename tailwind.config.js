/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "cyber-dark": "#0a0a0f",
        "cyber-card": "#0f0f1e",
        "cyber-cyan": "#00f5ff",
        "cyber-purple": "#b44dff",
        "cyber-border": "rgba(0, 245, 255, 0.2)",
        "cyber-border-hover": "rgba(0, 245, 255, 0.4)",
      },
      animation: {
        "pulse-slow": "pulse 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
