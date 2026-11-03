import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#060709",
        card: "#0d0e12",
        "card-hover": "#13151b",
        border: "#1d2027",
        pearl: "#f8fafc",
        siren: {
          400: "#38bdf8",
          500: "#00a8ff",
          600: "#0284c7",
          glow: "rgba(0, 168, 255, 0.15)",
        },
        neon: {
          pink: "#ff2d55",
          "pink-hover": "#e02447",
          glow: "rgba(255, 45, 85, 0.18)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        siren: "0 0 20px -3px rgba(0, 168, 255, 0.25)",
        neon: "0 0 20px -3px rgba(255, 45, 85, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;

