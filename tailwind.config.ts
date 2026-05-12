import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#0a0a0a",
        "brand-accent": "#c7a15a",
        "background": "#fafafa",
        "secondary": "#525252",
        "surface": "#ffffff",
        "surface-container-low": "#f5f5f5",
        "surface-container-high": "#ebebeb",
        "outline": "#e5e5e5",
        "outline-variant": "#d4d4d4",
        "error": "#b91c1c"
      },
      fontFamily: {
        "headline": ["var(--font-manrope)", "Manrope", "sans-serif"],
        "body": ["var(--font-inter)", "Inter", "sans-serif"],
        "label": ["var(--font-inter)", "Inter", "sans-serif"]
      },
      borderRadius: {
        "sm": "0.125rem",
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "1rem",
        "2xl": "1.5rem",
        "3xl": "2.5rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
};
export default config;
