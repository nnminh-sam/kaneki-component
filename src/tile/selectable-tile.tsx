"use client";

import {
  forwardRef,
  type ElementType,
  type ForwardedRef,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";
import type {
  PolymorphicComponent,
  PolymorphicImplProps,
  PolymorphicProps,
} from "../nav/polymorphic";

export interface SelectableTileOwnProps {
  /** Toggle state: sets `aria-pressed` and the selected style. Leave undefined for a plain action tile. */
  selected?: boolean;
  /** Disclosure state: sets `aria-expanded` (use with `controls`). */
  expanded?: boolean;
  /** Id of the region the tile expands (`aria-controls`). */
  controls?: string;
  /** Leading visual, e.g. an icon. Decorative. */
  leading?: ReactNode;
  /** Primary text. */
  title?: ReactNode;
  /** Secondary text under the title. */
  description?: ReactNode;
  /** Trailing content (e.g. a chevron or a count). */
  trailing?: ReactNode;
  /** Dashed outline for an "add new" tile. */
  dashed?: boolean;
  /** Disables the tile (native `disabled` on buttons, `aria-disabled` otherwise). */
  disabled?: boolean;
  /** Extra content under the description. */
  children?: ReactNode;
  /** Extra classes; they override the defaults. */
  className?: string;
}

export type SelectableTileProps<E extends ElementType = "button"> = PolymorphicProps<
  E,
  SelectableTileOwnProps
>;

/**
 * A card-like button for grids of choices: categories, accounts, "add new".
 * Renders a `<button type="button">`; pass `as` (e.g. `as={Link}`) for navigation.
 */
export const SelectableTile = forwardRef(function SelectableTile(
  {
    as,
    selected,
    expanded,
    controls,
    leading,
    title,
    description,
    trailing,
    dashed = false,
    disabled = false,
    className,
    children,
    onClick,
    ...props
  }: PolymorphicImplProps<SelectableTileOwnProps>,
  ref: ForwardedRef<Element>
) {
  const Comp: ElementType = as ?? "button";
  const isButton = Comp === "button";

  return (
    <Comp
      ref={ref}
      {...(isButton
        ? { type: "button", disabled }
        : { "aria-disabled": disabled || undefined, tabIndex: disabled ? -1 : undefined })}
      aria-pressed={selected}
      aria-expanded={expanded}
      aria-controls={controls}
      data-selected={selected || undefined}
      onClick={(event: ReactMouseEvent<HTMLElement>) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      className={cn(
        "group relative flex w-full min-w-0 items-start gap-3 rounded-2xl border p-4 text-left transition-colors motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        dashed
          ? "border-dashed border-border bg-transparent text-muted hover:border-accent hover:text-accent"
          : selected
            ? "border-accent bg-accent-soft text-fg"
            : "border-border bg-surface text-fg shadow-xs hover:border-accent hover:bg-surface-subtle",
        disabled ? "cursor-not-allowed opacity-50 hover:border-border" : "cursor-pointer",
        className
      )}
      {...props}
    >
      {leading && (
        <span
          aria-hidden="true"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl [&>svg]:h-[18px] [&>svg]:w-[18px]",
            dashed
              ? "bg-surface-subtle text-current"
              : selected
                ? "bg-accent text-accent-fg"
                : "bg-accent-soft text-accent"
          )}
        >
          {leading}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title && <span className="truncate text-sm font-semibold">{title}</span>}
        {description && <span className="text-xs leading-relaxed text-muted">{description}</span>}
        {children}
      </span>
      {trailing && <span className="flex shrink-0 items-center self-center text-muted">{trailing}</span>}
    </Comp>
  );
}) as PolymorphicComponent<"button", SelectableTileOwnProps>;
SelectableTile.displayName = "SelectableTile";
