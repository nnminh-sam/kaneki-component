import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils/cn";

export interface PageHeaderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Page title, rendered as a heading (`h1` by default). */
  title: ReactNode;
  /** Supporting text below the title. */
  description?: ReactNode;
  /** Small uppercase label above the title (e.g. a section or breadcrumb). */
  eyebrow?: ReactNode;
  /** Right-aligned actions (buttons). Wraps below the title on mobile. */
  actions?: ReactNode;
  /** Slot for a period / date-range switcher, shown beside the actions (or on its own row on mobile). */
  period?: ReactNode;
  /** Heading level for the title. Default 1. */
  level?: 1 | 2 | 3;
}

/** Page title block with eyebrow, description, period switcher and actions. */
export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    {
      title,
      description,
      eyebrow,
      actions,
      period,
      level = 1,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Heading = `h${level}` as "h1" | "h2" | "h3";
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
          className
        )}
        {...props}
      >
        <div className="min-w-0 space-y-1">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              {eyebrow}
            </p>
          )}
          <Heading
            className={cn(
              "font-semibold tracking-tight text-fg",
              level === 1 ? "text-2xl" : level === 2 ? "text-xl" : "text-lg"
            )}
          >
            {title}
          </Heading>
          {description && (
            <p className="max-w-prose text-sm leading-relaxed text-muted">
              {description}
            </p>
          )}
          {children}
        </div>
        {(period || actions) && (
          <div className="flex flex-wrap items-center gap-2 md:shrink-0 md:justify-end">
            {period && <div className="flex min-w-0 items-center">{period}</div>}
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}
      </div>
    );
  }
);
PageHeader.displayName = "PageHeader";
