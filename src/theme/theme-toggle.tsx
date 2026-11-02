"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import type { Theme } from "./types";

export interface ThemeToggleProps {
  /** Display style: auto adapts based on collapsed state */
  variant?: "auto" | "icon" | "segmented";
  /** When true, automatically collapses to icon variant */
  collapsed?: boolean;
  /** Optional custom class name */
  className?: string;
}

export function ThemeToggle({
  variant = "auto",
  collapsed = false,
  className = "",
}: ThemeToggleProps) {
  const { theme, setTheme, cycleTheme } = useTheme();

  const isIconOnly = variant === "icon" || (variant === "auto" && collapsed);

  if (isIconOnly) {
    return (
      <button
        type="button"
        onClick={cycleTheme}
        aria-label={`Current theme: ${theme}. Click to switch theme.`}
        title={`Theme: ${
          theme === "light" ? "Light" : theme === "dark" ? "Dark" : "Auto"
        } (Click to cycle)`}
        className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface-subtle text-fg transition-all hover:border-accent hover:bg-surface ${className}`}
      >
        {theme === "light" ? (
          <Sun className="h-4 w-4 text-amber-500" />
        ) : theme === "dark" ? (
          <Moon className="h-4 w-4 text-accent" />
        ) : (
          <Monitor className="h-4 w-4 text-muted" />
        )}
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Theme selection"
      className={`flex w-full items-center rounded-lg border border-border bg-surface-subtle p-0.5 text-xs ${className}`}
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-pressed={theme === "light"}
        className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md py-1.5 px-2 font-medium transition-all ${
          theme === "light"
            ? "bg-surface font-semibold text-fg shadow-xs"
            : "text-muted hover:text-fg"
        }`}
      >
        <Sun className="h-3.5 w-3.5" />
        <span>Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-pressed={theme === "dark"}
        className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md py-1.5 px-2 font-medium transition-all ${
          theme === "dark"
            ? "bg-surface font-semibold text-fg shadow-xs"
            : "text-muted hover:text-fg"
        }`}
      >
        <Moon className="h-3.5 w-3.5" />
        <span>Dark</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("system")}
        aria-pressed={theme === "system"}
        className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md py-1.5 px-2 font-medium transition-all ${
          theme === "system"
            ? "bg-surface font-semibold text-fg shadow-xs"
            : "text-muted hover:text-fg"
        }`}
      >
        <Monitor className="h-3.5 w-3.5" />
        <span>Auto</span>
      </button>
    </div>
  );
}
