import type { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant =
  | "default"
  | "accent"
  | "ok"
  | "warn"
  | "danger"
  | "subtle";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
  icon?: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface-subtle text-fg border border-border",
  accent: "bg-accent-soft text-accent border border-accent/20",
  ok: "bg-ok-soft text-ok border border-ok/20",
  warn: "bg-warn-soft text-warn border border-warn/20",
  danger: "bg-danger-soft text-danger border border-danger/20",
  subtle: "bg-transparent text-muted border border-border/60",
};

export function Badge({
  variant = "default",
  icon,
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-tight ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
