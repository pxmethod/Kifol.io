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
  plugins: [],
};

export default config;
