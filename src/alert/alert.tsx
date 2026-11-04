"use client";

import {
  forwardRef,
  useState,
  type AriaRole,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  TriangleAlert,
  CircleCheck,
  Info,
  OctagonAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../utils/cn";

export type AlertTone = "info" | "ok" | "warn" | "danger" | "neutral";
export type AlertVariant = "soft" | "outline" | "accent-border";

export interface AlertProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Semantic tone. Default "info". */
  tone?: AlertTone;
  /** `"soft"`: tinted background (default). `"outline"`: surface with tinted border. `"accent-border"`: surface with a thick left border. */
  variant?: AlertVariant;
  /** Bold first line. */
  title?: ReactNode;
  /** Custom icon; defaults per tone. Pass `false` to hide. */
  icon?: ReactNode | false;
  /** Actions slot (buttons / links) shown under the body. */
  actions?: ReactNode;
  /** Show a dismiss (X) button. The alert hides itself after `onDismiss` runs. */
  dismissible?: boolean;
  /** Called when the dismiss button is pressed. */
  onDismiss?: () => void;
  /** Accessible label for the dismiss button. Default "Dismiss". */
  dismissLabel?: string;
  /**
   * ARIA role. Default "alert" for danger (assertive), otherwise "status" (polite).
   * Pass `"none"` / another role for static, non-announced callouts.
   */
  role?: AriaRole;
}

const toneIcon: Record<AlertTone, LucideIcon> = {
  info: Info,
  ok: CircleCheck,
  warn: TriangleAlert,
  danger: OctagonAlert,
  neutral: Info,
};

const softStyles: Record<AlertTone, string> = {
  info: "bg-accent-soft border-accent/20",
  ok: "bg-ok-soft border-ok/20",
  warn: "bg-warn-soft border-warn/20",
  danger: "bg-danger-soft border-danger/20",
  neutral: "bg-surface-subtle border-border",
};

const outlineStyles: Record<AlertTone, string> = {
  info: "bg-surface border-accent/40",
  ok: "bg-surface border-ok/40",
  warn: "bg-surface border-warn/40",
  danger: "bg-surface border-danger/40",
  neutral: "bg-surface border-border",
};

const leftBorderStyles: Record<AlertTone, string> = {
  info: "border-l-accent",
  ok: "border-l-ok",
  warn: "border-l-warn",
  danger: "border-l-danger",
  neutral: "border-l-muted",
};

const iconColor: Record<AlertTone, string> = {
  info: "text-accent",
  ok: "text-ok",
  warn: "text-warn",
  danger: "text-danger",
  neutral: "text-muted",
};

/** An inline message box with tone, icon, title, actions and optional dismiss. */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      tone = "info",
      variant = "soft",
      title,
      icon,
      actions,
      dismissible = false,
      onDismiss,
      dismissLabel = "Dismiss",
      role,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [dismissed, setDismissed] = useState(false);
    if (dismissed) return null;

    const DefaultIcon = toneIcon[tone];
    const iconNode =
      icon === false ? null : icon ?? <DefaultIcon className="h-4 w-4" />;

    return (
      <div
        ref={ref}
        role={role ?? (tone === "danger" ? "alert" : "status")}
        data-tone={tone}
        className={cn(
          "relative flex gap-3 rounded-xl border p-3.5 text-sm text-fg animate-fade-in",
          variant === "soft" && softStyles[tone],
          variant === "outline" && outlineStyles[tone],
          variant === "accent-border" &&
            cn("border-border border-l-4 bg-surface", leftBorderStyles[tone]),
          className
        )}
        {...props}
      >
        {iconNode && (
          <span
            aria-hidden="true"
            className={cn(
              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4",
              iconColor[tone]
            )}
          >
            {iconNode}
          </span>
        )}
        <div className={cn("min-w-0 flex-1 space-y-1", dismissible && "pr-6")}>
          {title && <p className="font-semibold leading-5 tracking-tight">{title}</p>}
          {children && (
            <div className={cn("leading-relaxed", title ? "text-muted" : "text-fg")}>
              {children}
            </div>
          )}
          {actions && <div className="flex flex-wrap items-center gap-2 pt-2">{actions}</div>}
        </div>
        {dismissible && (
          <button
            type="button"
            aria-label={dismissLabel}
            onClick={() => {
              onDismiss?.();
              setDismissed(true);
            }}
            className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-fg/5 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = "Alert";

/** Alias of `Alert` for static, non-announced callouts: defaults `role` to `"note"`. */
export const Callout = forwardRef<HTMLDivElement, AlertProps>(
  ({ role = "note", ...props }, ref) => <Alert ref={ref} role={role} {...props} />
);
Callout.displayName = "Callout";
