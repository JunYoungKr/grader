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
      fontSize: {
        caption: ["var(--text-caption)", { lineHeight: "1.6" }],
        small: ["var(--text-small)", { lineHeight: "1.65" }],
        body: ["var(--text-body)", { lineHeight: "var(--leading-body)" }],
        reading: ["var(--text-reading)", {
          lineHeight: "var(--leading-reading)",
          letterSpacing: "var(--tracking-reading)",
        }],
        title: ["var(--text-title)", { lineHeight: "1.5" }],
        section: ["var(--text-section)", {
          lineHeight: "var(--leading-heading)",
          letterSpacing: "var(--tracking-heading)",
        }],
        heading: ["var(--text-heading)", {
          lineHeight: "var(--leading-heading)",
          letterSpacing: "var(--tracking-heading)",
        }],
      },
      fontWeight: {
        normal: "var(--font-regular)",
        medium: "var(--font-medium)",
        semibold: "var(--font-semibold)",
      },
      spacing: { 5: "var(--space-5)" },
      minHeight: { touch: "var(--tap-target)" },
      borderRadius: { md: "8px", lg: "12px", xl: "16px" },
      maxWidth: { content: "72rem", prose: "var(--width-prose)" },
    },
  },
  plugins: [],
};
export default config;
