import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        hairline: "var(--hairline)",
        brand: "var(--brand)",
        "brand-soft": "var(--brand-soft)",
        "on-brand": "var(--on-brand)",
      },
      fontFamily: {
        sans: ["Pretendard Variable", "Pretendard", "system-ui", "sans-serif"],
      },
      borderRadius: { md: "8px", lg: "12px", xl: "16px" },
      maxWidth: { content: "72rem" },
    },
  },
  plugins: [],
};
export default config;
