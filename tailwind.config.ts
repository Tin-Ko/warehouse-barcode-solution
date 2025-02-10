import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enables dark mode support
  theme: {
    extend: {
      colors: {
        primary: "#6B46C1", // Soft purple
        secondary: "#9F7AEA",
        darkBg: "#1A202C", // Dark theme background
        lightText: "#E2E8F0",
      },
    },
  },
  plugins: [],
};

export default config;
