import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FFFBEB",
        navy: "#1E293B",
        slate: "#475569",
        orange: {
          DEFAULT: "#EA580C",
          dark: "#C2410C",
        },
      },
      fontFamily: {
        heading: ["var(--font-inter)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        sub: ["var(--font-merriweather)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
