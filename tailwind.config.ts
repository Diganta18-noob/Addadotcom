import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        espresso: {
          DEFAULT: "#4B2E2B",
          50: "#F5EFEE",
          100: "#E8DCDA",
          200: "#D1BAB6",
          300: "#BA9791",
          400: "#A3756D",
          500: "#7A5650",
          600: "#4B2E2B",
          700: "#3D2523",
          800: "#2F1C1A",
          900: "#211312",
          950: "#130B0A",
        },
        caramel: {
          DEFAULT: "#D4A056",
          50: "#FBF5EC",
          100: "#F5E7D0",
          200: "#EDD0A5",
          300: "#E2B87A",
          400: "#D4A056",
          500: "#C08A3D",
          600: "#9C6F31",
          700: "#785526",
          800: "#543B1A",
          900: "#30210F",
          950: "#1E1509",
        },
        sage: {
          DEFAULT: "#8BA888",
          50: "#F3F6F3",
          100: "#E2EAE1",
          200: "#C5D5C3",
          300: "#A8C0A5",
          400: "#8BA888",
          500: "#6E906B",
          600: "#587356",
          700: "#425641",
          800: "#2C392B",
          900: "#161D16",
          950: "#0B0E0B",
        },
        cream: {
          DEFAULT: "#FFF8F0",
          50: "#FFFDFB",
          100: "#FFF8F0",
          200: "#FFEFD9",
          300: "#FFE5C2",
        },
        // shadcn/ui CSS variables
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-bottom": "slide-in-bottom 0.3s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
