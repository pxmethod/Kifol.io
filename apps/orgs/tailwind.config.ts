import type { Config } from "tailwindcss";
import kifolioTailwindPreset from "@kifolio/tailwind-preset";

const config: Config = {
  presets: [kifolioTailwindPreset],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        discovery: {
          green: "#1AC85D",
          orange: "#FF5938",
          blue: "#4A53E2",
          gray: "#FAFAFD",
        },
      },
    },
  },
  plugins: [],
};

export default config;
