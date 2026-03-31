import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        pulse: {
          bg: "var(--bg)",
          card: "var(--card)",
          accent: "var(--accent)",
          "accent-2": "var(--accent-2)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-dot": "pulse-dot 1.5s ease-in-out infinite",
        radar: "radar 2.5s ease-out infinite",
        "live-bar": "live-bar 2.2s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
