"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Theme, ThemeContextValue, ThemeProviderProps } from "./types";
import { THEMES } from "./types";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "kaneki_theme",
  enableSystem = true,
  attribute = "data-theme",
  onThemeChange,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored && (THEMES as readonly string[]).includes(stored)) {
          return stored as Theme;
        }
      } catch {
        // localStorage unavailable or restricted
      }
    }
    return defaultTheme;
  });

  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(
    getSystemTheme
  );

  useEffect(() => {
    if (!enableSystem) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [enableSystem]);

  const resolvedTheme: "light" | "dark" =
    theme === "system" ? systemTheme : theme;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute(attribute);
      root.dataset.theme = "system";
    } else {
      root.setAttribute(attribute, theme);
      root.dataset.theme = theme;
    }
  }, [theme, attribute]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch {
        // ignore
      }
      onThemeChange?.(newTheme);
    },
    [storageKey, onThemeChange]
  );

  const cycleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: Theme =
        current === "light" ? "dark" : current === "dark" ? "system" : "light";
      try {
        localStorage.setItem(storageKey, next);
      } catch {
        // ignore
      }
      onThemeChange?.(next);
      return next;
    });
  }, [storageKey, onThemeChange]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      cycleTheme,
    }),
    [theme, resolvedTheme, setTheme, cycleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a <ThemeProvider />");
  }
  return context;
}
