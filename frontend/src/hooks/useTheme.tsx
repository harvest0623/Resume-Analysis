import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemDark(): boolean {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveDark(theme: Theme): boolean {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return getSystemDark();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem("theme");
        if (saved === "light" || saved === "dark" || saved === "system") {
            return saved;
        }
        return "system";
    });

    const [isDark, setIsDark] = useState(() => resolveDark((() => {
        const saved = localStorage.getItem("theme");
        if (saved === "light" || saved === "dark" || saved === "system") return saved;
        return "system";
    })()));

    const applyTheme = useCallback((currentTheme: Theme) => {
        const root = document.documentElement;
        const dark = resolveDark(currentTheme);

        setIsDark(dark);

        root.classList.remove("dark", "light");
        root.classList.add(dark ? "dark" : "light");
        root.style.colorScheme = dark ? "dark" : "light";
    }, []);

    useEffect(() => {
        applyTheme(theme);
        localStorage.setItem("theme", theme);

        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = () => applyTheme("system");
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, [theme, applyTheme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
