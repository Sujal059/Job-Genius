/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces
        background: "var(--bg-background)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        sunken: "var(--bg-sunken)",

        // Text
        main: "var(--text-main)",
        muted: "var(--text-muted)",
        faint: "var(--text-faint)",

        // Lines
        line: {
          DEFAULT: "var(--border-default)",
          subtle: "var(--border-subtle)",
          glow: "var(--border-glow)",
        },

        // Brand accent (AI / primary actions)
        accent: {
          DEFAULT: "var(--primary-accent)",
          hover: "var(--primary-accent-hover)",
          soft: "var(--primary-accent-soft)",
          contrast: "var(--primary-accent-contrast)",
        },

        // Achievement accent (scores / results)
        gold: {
          DEFAULT: "var(--accent-gold)",
          soft: "var(--accent-gold-soft)",
          contrast: "var(--accent-gold-contrast)",
        },

        cyan: {
          DEFAULT: "var(--accent-cyan)",
          soft: "var(--accent-cyan-soft)",
        },

        danger: {
          DEFAULT: "var(--accent-danger)",
          soft: "var(--accent-danger-soft)",
        },
        success: {
          DEFAULT: "var(--accent-success)",
          soft: "var(--accent-success-soft)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        "glow-accent": "var(--shadow-glow-accent)",
        "glow-gold": "var(--shadow-glow-gold)",
        "glow-cyan": "var(--shadow-glow-cyan)",
        panel: "var(--shadow-panel)",
      },
      backgroundColor: {
        DEFAULT: "var(--bg-background)",
      },
    },
  },
  plugins: [],
};
