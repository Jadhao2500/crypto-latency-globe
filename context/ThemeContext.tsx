// context/ThemeContext.tsx
"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_KEY = "crypto-latency-theme";

function resolveInitialTheme(): Theme {
    if (typeof window === "undefined") return "light";

    const stored = window.localStorage.getItem(THEME_KEY) as Theme | null;
    if (stored === "light" || stored === "dark") return stored;

    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")
        ?.matches;
    return prefersDark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    // default to light on server
    const [theme, setThemeState] = useState<Theme>("light");

    useEffect(() => {
        setThemeState(resolveInitialTheme());
    }, []);

    useEffect(() => {
        if (typeof document === "undefined") return;
        const root = document.documentElement;

        // 🔑 This drives BOTH:
        // - CSS variables (:root[data-theme="dark"])
        // - Tailwind dark: variant via @custom-variant
        root.dataset.theme = theme;

        window.localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    const setTheme = (t: Theme) => setThemeState(t);
    const toggleTheme = () =>
        setThemeState((prev) => (prev === "light" ? "dark" : "light"));

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
    return ctx;
}
