import { useState, useEffect, createContext, useContext, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem("theme");
        return (saved as Theme) || "system";
    });

    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const applyTheme = () => {
            const root = document.documentElement;
            let dark = false;

            if (theme === "dark") {
                dark = true;
            } else if (theme === "light") {
                dark = false;
            } else {
                dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            }

            setIsDark(dark);

            root.classList.remove("dark", "light");
            root.classList.add(dark ? "dark" : "light");
        };

        applyTheme();
        localStorage.setItem("theme", theme);

        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = () => applyTheme();
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, [theme]);

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
