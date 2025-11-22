// components/ThemeToggle.tsx
"use client";

import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            onClick={toggleTheme}
            className={`
        flex items-center gap-1 rounded-full px-3 py-1 text-[11px] shadow-sm ring-1
        transition-colors duration-200
        ${isDark
                    ? "bg-slate-800 text-slate-100 ring-slate-700"
                    : "bg-slate-100 text-slate-800 ring-slate-300"
                }
      `}
        >
            <span className="text-xs">{isDark ? "🌙" : "☀️"}</span>
            <span>{isDark ? "Dark mode" : "Light mode"}</span>
        </button>
    );
}
