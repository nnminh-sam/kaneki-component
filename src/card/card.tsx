import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { cardClasses } from "../classes";

/** Bordered, rounded surface. Use `cardClasses()` to style other elements the same way. */
export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(cardClasses(), className)} {...props} />
  )
);
Card.displayName = "Card";

export type CardHeaderIconTone = "accent" | "ok" | "warn" | "danger" | "neutral";

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Icon shown in a tinted chip before the title. Decorative. */
  icon?: ReactNode;
  /** Tint of the icon chip (same palette as Stat). Default "accent". */
  iconTone?: CardHeaderIconTone;
  /** Header title. When `title`, `description`, `icon` or `actions` is set, a header row is rendered before `children`. */
  title?: ReactNode;
  /** Heading element for `title`. Default "h3". */
  titleAs?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div";
  /** Supporting text under the title. */
  description?: ReactNode;
  /** Right-aligned actions (buttons, menus). */
  actions?: ReactNode;
}

const chipTones: Record<CardHeaderIconTone, string> = {
  accent: "bg-accent-soft text-accent",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-surface-subtle text-muted",
};

/**
 * Card header. Use the `icon` / `title` / `description` / `actions` props for the
 * standard row, or pass children (e.g. CardTitle + CardDescription) as before.
 */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  (
    {
      icon,
      iconTone = "accent",
      title,
      titleAs: Title = "h3",
      description,
      actions,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const hasRow = Boolean(icon || title || description || actions);
    return (
      <div ref={ref} className={cn("flex flex-col space-y-1.5 p-5", className)} {...props}>
        {hasRow && (
          <div className="flex items-start gap-3">
            {icon && (
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg [&>svg]:h-4 [&>svg]:w-4",
                  chipTones[iconTone]
                )}
              >
                {icon}
              </span>
            )}
            <div className="min-w-0 flex-1 space-y-1">
              {title && (
                <Title className="text-base font-semibold leading-tight tracking-tight text-fg">
                  {title}
                </Title>
              )}
              {description && (
                <p className="text-xs leading-relaxed text-muted">{description}</p>
              )}
            </div>
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    );
  }
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-base font-semibold leading-none tracking-tight text-fg", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-xs text-muted leading-relaxed", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-5 pt-0 border-t border-border mt-4", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";
