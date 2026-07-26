import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#12141a",
        surface: "#1b1f28",
        surface2: "#232837",
        line: "#2e3444",
        marquee: "#e8b94f",
        velvet: "#c1443f",
        ink: "#eef0f3",
        muted: "#8b93a1",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
export default config;
