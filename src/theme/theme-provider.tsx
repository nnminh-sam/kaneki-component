"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  Theme,
  ThemeContextValue,
  ThemeProviderProps,
  ThemeScriptProps,
} from "./types";
import { THEMES } from "./types";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const SYSTEM_QUERY = "(prefers-color-scheme: dark)";
const DEFAULT_STORAGE_KEY = "kaneki_theme";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }
  return window.matchMedia(SYSTEM_QUERY).matches ? "dark" : "light";
}

function readStoredTheme(storageKey: string): Theme | null {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored && (THEMES as readonly string[]).includes(stored)
      ? (stored as Theme)
      : null;
  } catch {
    return null;
  }
}

function writeStoredTheme(storageKey: string, theme: Theme) {
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // Storage blocked: the choice still applies for this session.
  }
}

/** Mirrors the theme onto <html>: `data-theme` = light | dark | system, plus color-scheme. */
function applyTheme(attribute: string, theme: Theme, resolved: "light" | "dark") {
  const root = document.documentElement;
  root.setAttribute(attribute, theme);
  root.style.colorScheme = resolved;
}

/**
 * Renders an inline script that applies the stored theme before first paint, so
 * server-rendered pages don't flash the wrong theme. Place it at the top of <body>
 * (or in <head>) with the same props as the ThemeProvider.
 */
export function ThemeScript({
  storageKey = DEFAULT_STORAGE_KEY,
  defaultTheme = "system",
  attribute = "data-theme",
  nonce,
}: ThemeScriptProps) {
  const code = `(function(){try{var k=${JSON.stringify(storageKey)},a=${JSON.stringify(
    attribute
  )},t=localStorage.getItem(k);if(t!=="light"&&t!=="dark"&&t!=="system")t=${JSON.stringify(
    defaultTheme
  )};var r=t==="system"?(matchMedia("${SYSTEM_QUERY}").matches?"dark":"light"):t;var e=document.documentElement;e.setAttribute(a,t);e.style.colorScheme=r;}catch(_){}})();`;
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: code }} />;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = DEFAULT_STORAGE_KEY,
  enableSystem = true,
  attribute = "data-theme",
  onThemeChange,
}: ThemeProviderProps) {
  // Start from the default on both server and client; the stored value is read
  // after mount (ThemeScript has already painted it) to keep hydration stable.
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = readStoredTheme(storageKey);
    if (stored) setThemeState(stored);
    setSystemTheme(getSystemTheme());

    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey && event.key !== null) return;
      setThemeState(readStoredTheme(storageKey) ?? defaultTheme);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey, defaultTheme]);

  useEffect(() => {
    if (!enableSystem || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia(SYSTEM_QUERY);
    const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? "dark" : "light");
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [enableSystem]);

  const effectiveTheme: Theme = !enableSystem && theme === "system" ? "light" : theme;
  const resolvedTheme: "light" | "dark" =
    effectiveTheme === "system" ? systemTheme : effectiveTheme;

  useEffect(() => {
    applyTheme(attribute, effectiveTheme, resolvedTheme);
  }, [attribute, effectiveTheme, resolvedTheme]);

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      writeStoredTheme(storageKey, next);
      onThemeChange?.(next);
    },
    [storageKey, onThemeChange]
  );

  const themes = useMemo<readonly Theme[]>(
    () => (enableSystem ? ["light", "dark", "system"] : ["light", "dark"]),
    [enableSystem]
  );

  const cycleTheme = useCallback(() => {
    const next = themes[(themes.indexOf(effectiveTheme) + 1) % themes.length];
    setTheme(next);
  }, [effectiveTheme, themes, setTheme]);

  const value = useMemo(
    () => ({ theme: effectiveTheme, resolvedTheme, setTheme, cycleTheme, themes }),
    [effectiveTheme, resolvedTheme, setTheme, cycleTheme, themes]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a <ThemeProvider />");
  }
  return context;
}
