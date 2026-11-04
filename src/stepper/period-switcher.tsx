"use client";

import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../utils/cn";

export type PeriodSwitcherSize = "sm" | "md" | "lg";

export interface PeriodSwitcherProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Text between the buttons (announced politely when it changes). Ignored if `children` is set. */
  label?: ReactNode;
  /** Custom middle content, e.g. a month input. */
  children?: ReactNode;
  /** Called by the previous button. */
  onPrev?: () => void;
  /** Called by the next button. */
  onNext?: () => void;
  /** Renders the previous control as a link to this URL (styled like the icon button). `onPrev` still runs on click. */
  prevHref?: string;
  /** Renders the next control as a link to this URL (styled like the icon button). `onNext` still runs on click. */
  nextHref?: string;
  /** Component used for `prevHref` / `nextHref` links, e.g. Next.js `Link`. Default `"a"`. */
  linkAs?: ElementType;
  /** Accessible name of the previous button. Default "Previous". */
  prevLabel?: string;
  /** Accessible name of the next button. Default "Next". */
  nextLabel?: string;
  /** Disables the previous control (a disabled button is rendered instead of a link). */
  prevDisabled?: boolean;
  /** Disables the next control (a disabled button is rendered instead of a link). */
  nextDisabled?: boolean;
  /** Button size: sm 28px, md 36px, lg 40px (touch target). Default `md`. */
  size?: PeriodSwitcherSize;
}

const buttonSize: Record<PeriodSwitcherSize, string> = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-10 w-10",
};
const iconSize: Record<PeriodSwitcherSize, string> = { sm: "h-4 w-4", md: "h-4 w-4", lg: "h-5 w-5" };
const labelSize: Record<PeriodSwitcherSize, string> = { sm: "text-xs", md: "text-sm", lg: "text-base" };

/** "◀ Period ▶" navigation: prev / next icon buttons (or links) around a label or custom content. */
export function PeriodSwitcher({
  label,
  children,
  onPrev,
  onNext,
  prevHref,
  nextHref,
  linkAs: LinkComp = "a",
  prevLabel = "Previous",
  nextLabel = "Next",
  prevDisabled = false,
  nextDisabled = false,
  size = "md",
  className,
  ...props
}: PeriodSwitcherProps) {
  const btn = cn(
    "inline-flex shrink-0 items-center justify-center rounded-lg text-muted transition-colors motion-reduce:transition-none",
    "cursor-pointer hover:bg-surface-subtle hover:text-fg",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
    "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
    buttonSize[size]
  );

  const control = (
    side: "prev" | "next",
    href: string | undefined,
    ariaLabel: string,
    disabled: boolean,
    onClick: (() => void) | undefined
  ) => {
    const Icon = side === "prev" ? ChevronLeft : ChevronRight;
    const icon = <Icon aria-hidden="true" className={iconSize[size]} />;
    if (href && !disabled) {
      return (
        <LinkComp href={href} aria-label={ariaLabel} onClick={onClick} className={btn}>
          {icon}
        </LinkComp>
      );
    }
    return (
      <button type="button" aria-label={ariaLabel} disabled={disabled} onClick={onClick} className={btn}>
        {icon}
      </button>
    );
  };

  return (
    <div role="group" className={cn("inline-flex items-center gap-1", className)} {...props}>
      {control("prev", prevHref, prevLabel, prevDisabled, onPrev)}
      {children ?? (
        <span
          aria-live="polite"
          aria-atomic="true"
          className={cn("min-w-0 px-1 text-center font-semibold text-fg", labelSize[size])}
        >
          {label}
        </span>
      )}
      {control("next", nextHref, nextLabel, nextDisabled, onNext)}
    </div>
  );
}
