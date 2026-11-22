/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-terracotta)",
          dark: "var(--color-terracotta-dark)",
          soft: "#F7EFE6",
        },
        gold: {
          DEFAULT: "var(--color-gold)",
          dark: "var(--color-gold-chart)",
        },
        espresso: "var(--color-espresso)",
        obsidian: "var(--color-espresso)",
        brown: "var(--color-ink)",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        ivory: "var(--color-ivory)",
        borderWarm: "var(--color-border)",
        forest: {
          DEFAULT: "var(--color-forest)",
          soft: "var(--color-forest-soft)",
        },
        info: "var(--color-info)",
        catalog: "var(--color-catalog)",
        warning: {
          DEFAULT: "var(--color-warning)",
          soft: "var(--color-warning-soft)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          soft: "var(--color-danger-soft)",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
        serif: ["'Playfair Display'", "Georgia", "serif"],
        luxury: ["'Cormorant Garamond'", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 10px 28px -12px rgba(23, 18, 15, 0.12)",
        glow: "0 10px 24px -10px rgba(185, 78, 45, 0.36)",
      },
    },
  },
  plugins: [],
};
