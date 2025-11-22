// components/ThemeToggle.tsx
"use client";

import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    const isDark = theme === "dark";

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-200 shadow-sm ring-1 ring-slate-700 hover:bg-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            aria-label="Toggle theme"
        >
            <span className="text-xs">
                {isDark ? "🌙" : "☀️"}
            </span>
            <span>{isDark ? "Dark" : "Light"} mode</span>
        </button>
    );
}
