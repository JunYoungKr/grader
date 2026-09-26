import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: Object.fromEntries(
        [
          "paper",
          "surface",
          "card",
          "ink",
          "muted",
          "faint",
          "hairline",
          "brand",
          "brand-hover",
          "brand-soft",
          "on-brand",
          "accent",
          "accent-soft",
          "photo-surface",
          "photo-ink",
          "on-photo",
          "header-surface",
        ].map((name) => [name, `var(--${name})`]),
      ),
      fontFamily: { sans: ["var(--font-body)"] },
      fontSize: {
        caption: ["var(--text-caption)", { lineHeight: "1.6" }],
        small: ["var(--text-small)", { lineHeight: "1.65" }],
        body: ["var(--text-body)", { lineHeight: "var(--leading-body)" }],
        reading: [
          "var(--text-reading)",
          {
            lineHeight: "var(--leading-reading)",
            letterSpacing: "var(--tracking-reading)",
          },
        ],
        lead: ["var(--text-lead)", { lineHeight: "var(--leading-body)" }],
        title: ["var(--text-title)", { lineHeight: "1.5" }],
        section: [
          "var(--text-section)",
          {
            lineHeight: "var(--leading-heading)",
            letterSpacing: "var(--tracking-heading)",
          },
        ],
        heading: [
          "var(--text-heading)",
          {
            lineHeight: "var(--leading-heading)",
            letterSpacing: "var(--tracking-heading)",
          },
        ],
        display: [
          "var(--text-display)",
          {
            lineHeight: "var(--leading-heading)",
            letterSpacing: "var(--tracking-heading)",
          },
        ],
      },
      fontWeight: {
        normal: "var(--font-regular)",
        medium: "var(--font-medium)",
        semibold: "var(--font-semibold)",
      },
      spacing: Object.fromEntries(
        [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24].map((n) => [
          n,
          `var(--space-${n})`,
        ]),
      ),
      height: { touch: "var(--tap-target)", header: "var(--header-height)" },
      width: { touch: "var(--tap-target)" },
      minHeight: { touch: "var(--tap-target)", button: "var(--button-height)" },
      inset: { sticky: "var(--sticky-offset)" },
      padding: { safe: "var(--safe-bottom)" },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        hero: "var(--radius-hero)",
        full: "var(--radius-pill)",
      },
      maxWidth: {
        content: "var(--width-content)",
        reading: "var(--width-reading)",
        prose: "var(--width-prose)",
      },
      gridTemplateColumns: {
        article: "var(--layout-article)",
        hero: "var(--layout-hero)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
};
export default config;
