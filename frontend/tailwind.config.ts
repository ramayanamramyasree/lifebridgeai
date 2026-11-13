import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        midnight: {
          950: "#060913",
          900: "#0B0F19",
          850: "#0F1523",
          800: "#131C31",
          700: "#1E293B",
          600: "#334155"
        },
        brand: {
          violet: "#8B5CF6",
          indigo: "#6366F1",
          cyan: "#06B6D4",
          teal: "#14B8A6",
          emerald: "#10B981"
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow": "radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.18) 0%, rgba(139, 92, 246, 0.08) 35%, transparent 70%)",
        "card-glass": "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
      }
    },
  },
  plugins: [],
};
export default config;
