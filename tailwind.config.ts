import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: "#2E8B99", deep: "#1B6B7A", soft: "#D5EBEE" },
        rose: { DEFAULT: "#E48A96", blush: "#EFA5A8", soft: "#FBE3E4" },
        cream: "#FAF7F2",
        ink: "#1E242B",
        gold: "#B8955A",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        script: ["var(--font-script)", "cursive"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: { retro: "1.75rem" },
      boxShadow: {
        retro: "5px 5px 0 0 #1E242B",
        "retro-sm": "3px 3px 0 0 #1E242B",
        "retro-teal": "5px 5px 0 0 #1B6B7A",
      },
    },
  },
  plugins: [],
};
export default config;
