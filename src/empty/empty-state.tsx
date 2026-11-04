import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils/cn";

export interface EmptyStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Illustration or icon, shown in a soft circular chip. Decorative. */
  icon?: ReactNode;
  /** Short headline, e.g. "Nothing here yet". */
  title: ReactNode;
  /** One or two lines explaining what to do next. */
  description?: ReactNode;
  /** Action slot (primary / secondary buttons). */
  action?: ReactNode;
  /** `"sm"` for cards and panels, `"md"` for full pages (default). */
  size?: "sm" | "md";
  /** Draw a dashed border around the block. Default false. */
  bordered?: boolean;
  /** Heading element for the title. Default "h3". */
  headingAs?: "h1" | "h2" | "h3" | "h4" | "p";
}

/** Placeholder shown when a view has no data. */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      action,
      size = "md",
      bordered = false,
      headingAs: Heading = "h3",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const sm = size === "sm";
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center text-center",
          sm ? "gap-2 px-4 py-6" : "gap-3 px-6 py-12",
          bordered && "rounded-2xl border border-dashed border-border",
          className
        )}
        {...props}
      >
        {icon && (
          <span
            aria-hidden="true"
            className={cn(
              "flex items-center justify-center rounded-full bg-surface-subtle text-muted",
              sm
                ? "h-9 w-9 [&>svg]:h-4 [&>svg]:w-4"
                : "h-12 w-12 [&>svg]:h-5 [&>svg]:w-5"
            )}
          >
            {icon}
          </span>
        )}
        <div className="max-w-sm space-y-1">
          <Heading
            className={cn(
              "font-semibold tracking-tight text-fg",
              sm ? "text-sm" : "text-base"
            )}
          >
            {title}
          </Heading>
          {description && (
            <p className={cn("leading-relaxed text-muted", sm ? "text-xs" : "text-sm")}>
              {description}
            </p>
          )}
        </div>
        {children}
        {action && (
          <div className={cn("flex flex-wrap items-center justify-center gap-2", sm ? "pt-1" : "pt-2")}>
            {action}
          </div>
        )}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";
