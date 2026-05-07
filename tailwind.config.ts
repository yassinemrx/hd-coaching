import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1fbf6",
          100: "#dcf5e7",
          200: "#bbe9d0",
          300: "#88d6ae",
          400: "#52bd87",
          500: "#2ea36a",
          600: "#1f8253",
          700: "#1a6743",
          800: "#175238",
          900: "#13432f",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
