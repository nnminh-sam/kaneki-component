"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "../utils/cn";
import { useTheme } from "./theme-provider";
import type { Theme } from "./types";

export type ThemeToggleSize = "sm" | "md" | "lg";

export interface ThemeToggleProps {
  /** Display style: auto adapts based on collapsed state */
  variant?: "auto" | "icon" | "segmented";
  /** When true, automatically collapses to icon variant */
  collapsed?: boolean;
  /** Size of the icon variant: sm = 32px, md = 40px, lg = 44px. Default "sm". */
  size?: ThemeToggleSize;
  /** Optional custom class name */
  className?: string;
}

const THEME_NAMES: Record<Theme, string> = { light: "light", dark: "dark", system: "system" };
const THEME_TITLES: Record<Theme, string> = { light: "Light", dark: "Dark", system: "Auto" };
const DEFAULT_ORDER: readonly Theme[] = ["light", "dark", "system"];

const iconSizes: Record<ThemeToggleSize, { box: string; icon: string }> = {
  sm: { box: "h-8 w-8", icon: "h-4 w-4" },
  md: { box: "h-10 w-10", icon: "h-[18px] w-[18px]" },
  lg: { box: "h-11 w-11", icon: "h-5 w-5" },
};

const segmentClasses = (active: boolean) =>
  cn(
    "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md py-1.5 px-2 font-medium transition-all",
    active ? "bg-surface font-semibold text-fg shadow-xs" : "text-muted hover:text-fg"
  );

/** Theme switcher: a cycling icon button or a light / dark / auto segmented control. */
export function ThemeToggle({
  variant = "auto",
  collapsed = false,
  size = "sm",
  className,
}: ThemeToggleProps) {
  const { theme, setTheme, cycleTheme, themes } = useTheme();

  const isIconOnly = variant === "icon" || (variant === "auto" && collapsed);

  if (isIconOnly) {
    const order = themes ?? DEFAULT_ORDER;
    const next = order[(order.indexOf(theme) + 1) % order.length] ?? "light";
    const sz = iconSizes[size];
    return (
      <button
        type="button"
        onClick={cycleTheme}
        aria-label={`Theme: ${THEME_NAMES[theme]}. Switch to ${THEME_NAMES[next]}`}
        title={`Theme: ${THEME_TITLES[theme]} (click for ${THEME_TITLES[next]})`}
        className={cn(
          "flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface-subtle text-fg transition-all hover:border-accent hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          sz.box,
          className
        )}
      >
        {theme === "light" ? (
          <Sun aria-hidden="true" className={cn(sz.icon, "text-amber-500")} />
        ) : theme === "dark" ? (
          <Moon aria-hidden="true" className={cn(sz.icon, "text-accent")} />
        ) : (
          <Monitor aria-hidden="true" className={cn(sz.icon, "text-muted")} />
        )}
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Theme selection"
      className={cn(
        "flex w-full items-center rounded-lg border border-border bg-surface-subtle p-0.5 text-xs",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-pressed={theme === "light"}
        className={segmentClasses(theme === "light")}
      >
        <Sun aria-hidden="true" className="h-3.5 w-3.5" />
        <span>Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-pressed={theme === "dark"}
        className={segmentClasses(theme === "dark")}
      >
        <Moon aria-hidden="true" className="h-3.5 w-3.5" />
        <span>Dark</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("system")}
        aria-pressed={theme === "system"}
        className={segmentClasses(theme === "system")}
      >
        <Monitor aria-hidden="true" className="h-3.5 w-3.5" />
        <span>Auto</span>
      </button>
    </div>
  );
}
