"use client";

import {
  forwardRef,
  type ElementType,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";
import type {
  PolymorphicComponent,
  PolymorphicImplProps,
  PolymorphicProps,
} from "../nav/polymorphic";

export type ListVariant = "plain" | "divided" | "card";

export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  /** `"plain"`: no separators. `"divided"`: hairlines between items (default). `"card"`: bordered rounded panel with dividers. */
  variant?: ListVariant;
  /** Render an ordered list (`<ol>`). */
  ordered?: boolean;
}

/** A vertical list of `ListItem`s. */
export const List = forwardRef<HTMLUListElement, ListProps>(
  ({ variant = "divided", ordered = false, className, ...props }, ref) => {
    const Comp = (ordered ? "ol" : "ul") as "ul";
    return (
      <Comp
        ref={ref}
        role="list"
        className={cn(
          "flex flex-col",
          variant !== "plain" && "divide-y divide-border",
          variant === "card" &&
            "overflow-hidden rounded-2xl border border-border bg-surface shadow-xs",
          className
        )}
        {...props}
      />
    );
  }
);
List.displayName = "List";

export interface ListItemOwnProps {
  /** Leading visual: icon, avatar or thumbnail. Icons should be decorative. */
  leading?: ReactNode;
  /** Primary text. */
  title?: ReactNode;
  /** Secondary text under the title. */
  description?: ReactNode;
  /** Trailing value, right-aligned (e.g. an amount or count). */
  trailing?: ReactNode;
  /** Small text under the trailing value (e.g. a date). */
  meta?: ReactNode;
  /** Buttons / menus rendered outside the clickable area (avoids nested interactive elements). */
  actions?: ReactNode;
  /**
   * Make the row clickable with hover / focus styles. Renders a `<button>`, or an
   * `<a>` when `href` is given, unless `as` is set (e.g. `as={Link}`).
   */
  interactive?: boolean;
  /** De-emphasise the row (e.g. archived / disabled entries). */
  muted?: boolean;
  /** Marks the selected row (highlight plus the attribute chosen by `selectedAttr`). */
  selected?: boolean;
  /**
   * Which attribute `selected` sets. Default: `aria-current="page"` for links
   * (`href`, or an `as` other than `"button"`), `aria-pressed` for button rows,
   * and `aria-current="true"` for static rows. Use `"aria-selected"` inside a
   * listbox / grid, or `"none"` to only apply the highlight.
   */
  selectedAttr?: ListItemSelectedAttr;
  /** Let the title wrap onto several lines instead of truncating. Default false. */
  wrapTitle?: boolean;
  /** Below the `sm` breakpoint, move `actions` onto their own row under the content. Default false. */
  stackActionsOnMobile?: boolean;
  /** Class names for the `actions` wrapper. */
  actionsClassName?: string;
  /** Extra content under the description (tags, progress bars). */
  children?: ReactNode;
  /** Class names for the row element. */
  className?: string;
  /** Class names for the wrapping `<li>`. */
  itemClassName?: string;
  /** Link target; selects `<a>` as the default element when interactive. */
  href?: string;
}

export type ListItemSelectedAttr = "aria-current" | "aria-pressed" | "aria-selected" | "none";

export type ListItemProps<E extends ElementType = "div"> = PolymorphicProps<
  E,
  ListItemOwnProps
>;

/**
 * A row in a `List`: leading visual, title / description, trailing value and
 * actions. `ref` and extra props go to the row element (inside the `<li>`).
 */
export const ListItem = forwardRef(function ListItem(
  {
    as,
    leading,
    title,
    description,
    trailing,
    meta,
    actions,
    interactive = false,
    muted = false,
    selected = false,
    selectedAttr,
    wrapTitle = false,
    stackActionsOnMobile = false,
    className,
    itemClassName,
    actionsClassName,
    children,
    href,
    ...props
  }: PolymorphicImplProps<ListItemOwnProps>,
  ref: ForwardedRef<Element>
) {
  const Comp: ElementType =
    as ?? (interactive ? (href ? "a" : "button") : "div");
  const isButton = Comp === "button";
  const isLink = Boolean(href) || (as !== undefined && as !== "button");
  const attr: ListItemSelectedAttr =
    selectedAttr ?? (isLink ? "aria-current" : isButton ? "aria-pressed" : "aria-current");
  const selectionProps: Record<string, string | boolean | undefined> = {};
  if (attr === "aria-current") {
    selectionProps["aria-current"] = selected ? (isLink ? "page" : "true") : undefined;
  } else if (attr === "aria-pressed") {
    selectionProps["aria-pressed"] = selected;
  } else if (attr === "aria-selected") {
    selectionProps["aria-selected"] = selected;
  }

  return (
    <li
      className={cn(
        "relative flex items-center",
        stackActionsOnMobile && actions && "flex-wrap sm:flex-nowrap",
        itemClassName
      )}
    >
      <Comp
        ref={ref}
        href={href}
        type={isButton ? "button" : undefined}
        {...selectionProps}
        data-selected={selected || undefined}
        data-muted={muted || undefined}
        className={cn(
          "flex w-full min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left",
          muted && "opacity-60",
          interactive &&
            "cursor-pointer rounded-xl transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent motion-reduce:transition-none",
          selected && "bg-accent-soft",
          actions && (stackActionsOnMobile ? "sm:pr-1" : "pr-1"),
          stackActionsOnMobile && actions && "pb-1.5 sm:pb-3",
          className
        )}
        {...props}
      >
        {leading && (
          <span className="flex shrink-0 items-center justify-center text-muted">
            {leading}
          </span>
        )}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          {title && (
            <span
              className={cn(
                "text-sm font-medium",
                wrapTitle ? "break-words" : "truncate",
                muted ? "text-muted" : "text-fg"
              )}
            >
              {title}
            </span>
          )}
          {description && (
            <span className="truncate text-xs text-muted">{description}</span>
          )}
          {children}
        </span>
        {(trailing || meta) && (
          <span className="flex shrink-0 flex-col items-end gap-0.5 text-right">
            {trailing && (
              <span className="text-sm font-semibold tabular-nums text-fg">{trailing}</span>
            )}
            {meta && <span className="text-xs text-muted">{meta}</span>}
          </span>
        )}
      </Comp>
      {actions && (
        <div
          className={cn(
            "flex shrink-0 items-center gap-1 pr-2",
            stackActionsOnMobile &&
              "w-full flex-wrap justify-end px-3 pb-3 sm:w-auto sm:flex-nowrap sm:justify-start sm:pl-0 sm:pb-0 sm:pr-2",
            actionsClassName
          )}
        >
          {actions}
        </div>
      )}
    </li>
  );
}) as PolymorphicComponent<"div", ListItemOwnProps>;
ListItem.displayName = "ListItem";
