import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      colors: {
        kifolio: {
          bg: "#f0f8f6",
          header: "#1a5f5f",
          cta: "#ff6b35",
          text: "#2d5a5a",
        },
      },
    },
  },
  plugins: [],
};

export default config; 