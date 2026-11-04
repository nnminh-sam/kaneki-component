/**
 * Server-safe class helpers. Pure functions and strings with no React import,
 * so they can be used from React Server Components (e.g. to style a Next.js
 * `<Link>` as a button). Published as `kaneki-components/classes`, a build
 * entry without the "use client" banner; also re-exported from the main entry.
 */
import { cn } from "./utils/cn";

export { cn };

/** Keyboard focus ring shared by buttons and icon buttons. */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0";

// ---------------------------------------------------------------- Button

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "danger-outline"
  | "danger-ghost"
  | "warn"
  | "success"
  | "link";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon";

export type ButtonShape = "default" | "pill";

/** Variant class map, shared by Button and IconButton. */
export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-fg font-semibold hover:brightness-105 active:scale-[0.98] shadow-xs disabled:opacity-50",
  secondary:
    "bg-surface-subtle text-fg border border-border hover:bg-surface hover:border-accent active:scale-[0.98] disabled:opacity-50",
  outline:
    "bg-transparent text-fg border border-border hover:border-accent hover:bg-surface-subtle active:scale-[0.98] disabled:opacity-50",
  ghost:
    "bg-transparent text-fg hover:bg-surface-subtle active:scale-[0.98] disabled:opacity-50",
  danger:
    "bg-danger text-danger-fg font-semibold hover:brightness-105 active:scale-[0.98] shadow-xs disabled:opacity-50",
  "danger-outline":
    "bg-transparent text-danger font-medium border border-danger hover:bg-danger-soft active:scale-[0.98] disabled:opacity-50 focus-visible:ring-danger",
  "danger-ghost":
    "bg-transparent text-danger hover:bg-danger-soft active:scale-[0.98] disabled:opacity-50 focus-visible:ring-danger",
  warn:
    "bg-warn text-warn-fg font-semibold hover:brightness-105 active:scale-[0.98] shadow-xs disabled:opacity-50",
  success:
    "bg-ok text-ok-fg font-semibold hover:brightness-105 active:scale-[0.98] shadow-xs disabled:opacity-50",
  link:
    "bg-transparent text-accent underline-offset-4 hover:underline disabled:opacity-50 disabled:no-underline",
};

const buttonSizeClasses: Record<ButtonSize, string> = {
  xs: "px-2 py-1 text-xs gap-1 rounded-md",
  sm: "px-3 py-1.5 text-xs font-medium gap-1.5 rounded-lg",
  md: "px-4 py-2 text-sm font-medium gap-2 rounded-lg",
  lg: "px-5 py-2.5 text-base font-medium gap-2.5 rounded-xl",
  icon: "h-10 w-10 p-0 text-sm rounded-lg",
};

/** Link variant: text size only, no padding or fixed height. */
const linkSizeClasses: Record<ButtonSize, string> = {
  xs: "text-xs gap-1 rounded-sm",
  sm: "text-xs font-medium gap-1.5 rounded-sm",
  md: "text-sm font-medium gap-1.5 rounded-sm",
  lg: "text-base font-medium gap-2 rounded-sm",
  icon: "text-sm rounded-sm",
};

/** Layout / interaction classes shared by Button and IconButton. */
export const buttonBaseClasses =
  "inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:cursor-not-allowed select-none motion-reduce:transition-none motion-reduce:transform-none";

export interface ButtonClassOptions {
  /** Visual style. Default "primary". */
  variant?: ButtonVariant;
  /** Size preset. Default "md". */
  size?: ButtonSize;
  /** "pill" gives fully rounded ends. Default "default". */
  shape?: ButtonShape;
  /** Stretch to the container width. */
  fullWidth?: boolean;
}

/**
 * Button classes for any element, e.g. a Next.js `<Link>` in a server component:
 * `<Link href="/new" className={buttonClasses({ variant: "secondary" })}>`.
 */
export function buttonClasses({
  variant = "primary",
  size = "md",
  shape = "default",
  fullWidth = false,
}: ButtonClassOptions = {}): string {
  return cn(
    buttonBaseClasses,
    focusRing,
    buttonVariantClasses[variant],
    variant === "link" ? linkSizeClasses[size] : buttonSizeClasses[size],
    shape === "pill" && "rounded-full",
    fullWidth && "w-full"
  );
}

// ---------------------------------------------------------------- IconButton

export type IconButtonSize = "sm" | "md" | "lg";

const iconButtonSizeClasses: Record<IconButtonSize, string> = {
  sm: "h-8 w-8 rounded-md [&_svg]:h-4 [&_svg]:w-4",
  md: "h-10 w-10 rounded-lg [&_svg]:h-[18px] [&_svg]:w-[18px]",
  lg: "h-11 w-11 rounded-lg [&_svg]:h-5 [&_svg]:w-5",
};

export interface IconButtonClassOptions {
  /** Visual style, same set as Button. Default "ghost". */
  variant?: ButtonVariant;
  /** sm = 32px, md = 40px, lg = 44px. Default "md". */
  size?: IconButtonSize;
  /** "square" has rounded corners, "round" is a circle. Default "square". */
  shape?: "square" | "round";
}

/** Square icon-button classes for any element (give it an `aria-label`). */
export function iconButtonClasses({
  variant = "ghost",
  size = "md",
  shape = "square",
}: IconButtonClassOptions = {}): string {
  return cn(
    buttonBaseClasses,
    "shrink-0 p-0",
    focusRing,
    buttonVariantClasses[variant],
    variant === "link" && "hover:no-underline hover:bg-accent-soft",
    iconButtonSizeClasses[size],
    shape === "round" && "rounded-full"
  );
}

// ---------------------------------------------------------------- Badge

export type BadgeVariant = "default" | "accent" | "ok" | "warn" | "danger" | "subtle";

const badgeVariantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface-subtle text-fg border border-border",
  accent: "bg-accent-soft text-accent border border-accent/20",
  ok: "bg-ok-soft text-ok border border-ok/20",
  warn: "bg-warn-soft text-warn border border-warn/20",
  danger: "bg-danger-soft text-danger border border-danger/20",
  subtle: "bg-transparent text-muted border border-border/60",
};

export interface BadgeClassOptions {
  /** Colour variant. Default "default". */
  variant?: BadgeVariant;
}

/** Pill badge classes for any element. */
export function badgeClasses({ variant = "default" }: BadgeClassOptions = {}): string {
  return cn(
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-tight",
    badgeVariantClasses[variant]
  );
}

// ---------------------------------------------------------------- Card

/** Card surface classes (border, radius, background, shadow) for any element. */
export function cardClasses(): string {
  return "rounded-2xl border border-border bg-surface text-fg shadow-xs transition-shadow hover:shadow-sm";
}
