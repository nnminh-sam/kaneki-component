/** Tone maps shared by the progress components. The class maps are internal; the types are re-exported from progress.tsx. */
export type ProgressTone = "accent" | "ok" | "warn" | "danger" | "neutral";
export type ProgressSize = "sm" | "md" | "lg";

export const progressToneBg: Record<ProgressTone, string> = {
  accent: "bg-accent",
  ok: "bg-ok",
  warn: "bg-warn",
  danger: "bg-danger",
  neutral: "bg-muted",
};

export const progressToneText: Record<ProgressTone, string> = {
  accent: "text-accent",
  ok: "text-ok",
  warn: "text-warn",
  danger: "text-danger",
  neutral: "text-muted",
};

