import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge the Kaneki colour tokens so e.g. `bg-surface` vs `bg-accent`
// and `text-muted` vs `text-sm` resolve correctly.
const KANEKI_COLORS = [
  "bg", "surface", "surface-subtle", "fg", "muted", "border",
  "accent", "accent-soft", "accent-fg", "danger", "danger-soft", "danger-fg",
  "warn", "warn-soft", "warn-fg", "ok", "ok-soft", "ok-fg",
];

const twMerge = extendTailwindMerge({
  extend: {
    theme: { color: KANEKI_COLORS },
  },
});

/** Joins class names, dropping falsy values; later Tailwind classes override earlier conflicting ones. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
