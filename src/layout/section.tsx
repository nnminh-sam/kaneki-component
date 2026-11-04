"use client";

import {
  forwardRef,
  useId,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

export interface SectionProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Section heading. When set, the `<section>` is labelled by it. */
  title?: ReactNode;
  /** Supporting text under the heading. */
  description?: ReactNode;
  /** Right-aligned actions next to the heading (e.g. "View all"). */
  actions?: ReactNode;
  /** Heading level. Default 2. */
  level?: 2 | 3 | 4;
  /** Class names for the content wrapper. */
  contentClassName?: string;
}

/** A titled content block (`<section aria-labelledby>`). */
export const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      title,
      description,
      actions,
      level = 2,
      className,
      contentClassName,
      children,
      id,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const headingId = `${id ?? autoId}-title`;
    const Heading = `h${level}` as "h2" | "h3" | "h4";
    const hasHeader = Boolean(title || description || actions);
    return (
      <section
        ref={ref}
        id={id}
        aria-labelledby={title ? headingId : undefined}
        className={cn("space-y-3", className)}
        {...props}
      >
        {hasHeader && (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-0.5">
              {title && (
                <Heading
                  id={headingId}
                  className={cn(
                    "font-semibold tracking-tight text-fg",
                    level === 2 ? "text-base" : "text-sm"
                  )}
                >
                  {title}
                </Heading>
              )}
              {description && (
                <p className="text-xs leading-relaxed text-muted">{description}</p>
              )}
            </div>
            {actions && (
              <div className="flex shrink-0 items-center gap-2">{actions}</div>
            )}
          </div>
        )}
        <div className={contentClassName}>{children}</div>
      </section>
    );
  }
);
Section.displayName = "Section";
