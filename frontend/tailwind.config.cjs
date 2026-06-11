/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tremor: {
          brand: {
            faint: "#eef2ff",
            muted: "#c7d2fe",
            subtle: "#818cf8",
            DEFAULT: "#4f46e5",
            emphasis: "#4338ca",
            inverted: "#ffffff",
          },
          background: {
            muted: "#fafafa",
            subtle: "#f4f4f5",
            DEFAULT: "#ffffff",
            emphasis: "#3f3f46",
          },
          border: { DEFAULT: "#e4e4e7" },
          ring: { DEFAULT: "#e4e4e7" },
          content: {
            subtle: "#a1a1aa",
            DEFAULT: "#71717a",
            emphasis: "#3f3f46",
            strong: "#18181b",
            inverted: "#ffffff",
          },
        },
        "dark-tremor": {
          brand: {
            faint: "#1e1b4b",
            muted: "#3730a3",
            subtle: "#4f46e5",
            DEFAULT: "#818cf8",
            emphasis: "#a5b4fc",
            inverted: "#1e1b4b",
          },
          background: {
            muted: "#18181b",
            subtle: "#27272a",
            DEFAULT: "#1c1c1e",
            emphasis: "#d4d4d8",
          },
          border: { DEFAULT: "#3f3f46" },
          ring: { DEFAULT: "#3f3f46" },
          content: {
            subtle: "#52525b",
            DEFAULT: "#a1a1aa",
            emphasis: "#d4d4d8",
            strong: "#f4f4f5",
            inverted: "#18181b",
          },
        },
      },
      boxShadow: {
        "tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "tremor-card": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "tremor-dropdown": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "dark-tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.3)",
        "dark-tremor-card": "0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)",
        "dark-tremor-dropdown": "0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)",
      },
      borderRadius: {
        "tremor-small": "0.375rem",
        "tremor-default": "0.5rem",
        "tremor-full": "9999px",
        "tremor-large": "0.75rem",
      },
      fontSize: {
        "tremor-label": ["0.75rem", { lineHeight: "1rem" }],
        "tremor-default": ["0.875rem", { lineHeight: "1.25rem" }],
        "tremor-title": ["1.125rem", { lineHeight: "1.75rem" }],
        "tremor-metric": ["1.875rem", { lineHeight: "2.25rem" }],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
  darkMode: "class",
};
