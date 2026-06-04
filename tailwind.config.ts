import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Primary display font — sharp, technical, futuristic
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
        // Body font — clean, readable
        sans: ["'DM Sans'", "'Inter'", "sans-serif"],
        // Accent display
        display: ["'Orbitron'", "monospace"],
      },
      colors: {
        // Deep space cyber palette
        cyber: {
          bg: "#020409",
          surface: "#060d1a",
          card: "#0a1628",
          border: "#0f2040",
          glow: "#00d4ff",
          accent: "#00ff88",
          warning: "#ffaa00",
          danger: "#ff3366",
          purple: "#7c3aed",
          text: "#c8d8f0",
          muted: "#4a6080",
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
        "scan-gradient":
          "linear-gradient(180deg, transparent 0%, rgba(0,212,255,0.15) 50%, transparent 100%)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "scan-line": "scanLine 2s linear infinite",
        "data-flow": "dataFlow 3s linear infinite",
        flicker: "flicker 0.15s infinite",
        "border-spin": "borderSpin 4s linear infinite",
        "count-up": "countUp 2s ease-out forwards",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(0,212,255,0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(0,212,255,0.8), 0 0 60px rgba(0,212,255,0.4)" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        dataFlow: {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "0% 100%" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        borderSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        countUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      boxShadow: {
        "cyber-sm": "0 0 10px rgba(0,212,255,0.2)",
        "cyber-md": "0 0 20px rgba(0,212,255,0.3), inset 0 0 20px rgba(0,212,255,0.05)",
        "cyber-lg": "0 0 40px rgba(0,212,255,0.4), inset 0 0 40px rgba(0,212,255,0.08)",
        "danger-glow": "0 0 20px rgba(255,51,102,0.4)",
        "success-glow": "0 0 20px rgba(0,255,136,0.4)",
        "warning-glow": "0 0 20px rgba(255,170,0,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
