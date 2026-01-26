export default {
    darkMode: ["class"],
    content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./app/**/*.{js,jsx}", "./src/**/*.{js,jsx}"],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                "background-secondary": "hsl(var(--background-secondary))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                    light: "hsl(var(--primary-light))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                warning: {
                    DEFAULT: "hsl(var(--warning))",
                    foreground: "hsl(var(--warning-foreground))",
                },
                success: {
                    DEFAULT: "hsl(var(--success))",
                    foreground: "hsl(var(--success-foreground))",
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
                sidebar: {
                    DEFAULT: "hsl(var(--sidebar-background))",
                    foreground: "hsl(var(--sidebar-foreground))",
                    primary: "hsl(var(--sidebar-primary))",
                    "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
                    accent: "hsl(var(--sidebar-accent))",
                    "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
                    border: "hsl(var(--sidebar-border))",
                    ring: "hsl(var(--sidebar-ring))",
                },
                status: {
                    pending: "hsl(var(--status-pending))",
                    "pending-bg": "hsl(var(--status-pending-bg))",
                    approved: "hsl(var(--status-approved))",
                    "approved-bg": "hsl(var(--status-approved-bg))",
                    rejected: "hsl(var(--status-rejected))",
                    "rejected-bg": "hsl(var(--status-rejected-bg))",
                    revision: "hsl(var(--status-revision))",
                    "revision-bg": "hsl(var(--status-revision-bg))",
                    info: "hsl(var(--status-info))",
                    "info-bg": "hsl(var(--status-info-bg))",
                },
                ocean: {
                    50: "hsl(185 50% 96%)",
                    100: "hsl(185 45% 92%)",
                    200: "hsl(180 45% 85%)",
                    300: "hsl(178 50% 70%)",
                    400: "hsl(176 55% 55%)",
                    500: "hsl(174 62% 40%)",
                    600: "hsl(172 65% 32%)",
                    700: "hsl(170 70% 25%)",
                    800: "hsl(168 75% 18%)",
                    900: "hsl(165 80% 12%)",
                },
                navy: {
                    50: "hsl(210 40% 96%)",
                    100: "hsl(210 40% 90%)",
                    200: "hsl(210 45% 80%)",
                    300: "hsl(210 50% 65%)",
                    400: "hsl(210 55% 45%)",
                    500: "hsl(210 55% 35%)",
                    600: "hsl(210 55% 25%)",
                    700: "hsl(210 55% 18%)",
                    800: "hsl(210 60% 12%)",
                    900: "hsl(210 65% 8%)",
                },
                map: {
                    grid: "hsl(var(--map-grid))",
                    placeholder: "hsl(var(--map-placeholder))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                xl: "calc(var(--radius) + 4px)",
                "2xl": "calc(var(--radius) + 8px)",
            },
            boxShadow: {
                card: "var(--shadow-card)",
                "card-hover": "var(--shadow-md)",
                "card-lg": "var(--shadow-lg)",
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
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
                pulse: {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.5" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                shimmer: "shimmer 2s linear infinite",
                pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
