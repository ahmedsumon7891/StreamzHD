import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#050505",
        card: "#111111",
        "card-hover": "#1a1a1a",
        border: "#222222",
        primary: { DEFAULT: "#ff6a00", dark: "#cc5500" },
        text: { DEFAULT: "#ffffff", muted: "#888888", dim: "#555555" },
        success: "#22c55e",
        error: "#ef4444",
        warning: "#f59e0b",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      animation: {
        "marquee": "marquee 40s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
