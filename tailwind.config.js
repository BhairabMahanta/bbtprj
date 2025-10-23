module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          foreground: "hsl(var(--tertiary-foreground))",
        },
        neutral: {
          DEFAULT: "hsl(var(--neutral))",
          foreground: "hsl(var(--neutral-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
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
        gray: {
          50: "hsl(210, 20%, 98%)",
          100: "hsl(210, 20%, 95%)",
          200: "hsl(210, 15%, 90%)",
          300: "hsl(210, 10%, 80%)",
          400: "hsl(212, 10%, 65%)",
          500: "hsl(210, 8%, 50%)",
          600: "hsl(210, 10%, 40%)",
          700: "hsl(210, 12%, 30%)",
          800: "hsl(210, 16%, 20%)",
          900: "hsl(222, 27%, 12%)",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        headline: ["Poppins", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        '4': '1rem',
        '8': '2rem',
        '12': '3rem',
        '16': '4rem',
        '24': '6rem',
        '32': '8rem',
        '48': '12rem',
        '64': '16rem',
      },
      backgroundImage: {
        'gradient-1': 'linear-gradient(135deg, hsl(175, 70%, 50%) 0%, hsl(190, 85%, 40%) 100%)',
        'gradient-2': 'linear-gradient(135deg, hsl(14, 87%, 62%) 0%, hsl(329, 70%, 58%) 100%)',
        'button-border-gradient': 'linear-gradient(90deg, hsl(176, 60%, 50%) 0%, hsl(190, 80%, 55%) 100%)',
      },
    },
  },
  plugins: [],
}
