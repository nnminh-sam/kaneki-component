"use client";

import {
  createContext,
  forwardRef,
  useContext,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

export type DescriptionListLayout = "horizontal" | "stacked";

const DescriptionListContext = createContext<{
  layout: DescriptionListLayout;
  stackOnMobile: boolean;
}>({ layout: "horizontal", stackOnMobile: false });

export interface DescriptionListProps extends HTMLAttributes<HTMLDListElement> {
  /** `"horizontal"`: term left, value right (default). `"stacked"`: term above value. */
  layout?: DescriptionListLayout;
  /** Hairline dividers between rows. Default true. */
  divided?: boolean;
  /** With the horizontal layout, stack term above value below the `sm` breakpoint. Default false. */
  stackOnMobile?: boolean;
}

/** A `<dl>` of term / value rows. Fill it with `DescriptionItem`s. */
export const DescriptionList = forwardRef<HTMLDListElement, DescriptionListProps>(
  ({ layout = "horizontal", divided = true, stackOnMobile = false, className, ...props }, ref) => (
    <DescriptionListContext.Provider value={{ layout, stackOnMobile }}>
      <dl
        ref={ref}
        className={cn(
          "flex flex-col text-sm",
          divided && "divide-y divide-border",
          className
        )}
        {...props}
      />
    </DescriptionListContext.Provider>
  )
);
DescriptionList.displayName = "DescriptionList";

export interface DescriptionItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** The term (`<dt>`). */
  term: ReactNode;
  /** The value (`<dd>`); `children` is used when omitted. */
  value?: ReactNode;
  /** Secondary text under the value. */
  helper?: ReactNode;
  /** Layout of this row, overriding the list's `layout`. */
  layout?: DescriptionListLayout;
  /** Stack this row below `sm` (horizontal layout only), overriding the list's `stackOnMobile`. */
  stackOnMobile?: boolean;
}

/** A term / value row inside `DescriptionList`. */
export const DescriptionItem = forwardRef<HTMLDivElement, DescriptionItemProps>(
  ({ term, value, helper, layout: itemLayout, stackOnMobile: itemStack, className, children, ...props }, ref) => {
    const ctx = useContext(DescriptionListContext);
    const horizontal = (itemLayout ?? ctx.layout) === "horizontal";
    const stack = horizontal && (itemStack ?? ctx.stackOnMobile);
    return (
      <div
        ref={ref}
        className={cn(
          "py-2.5",
          stack
            ? "flex flex-col gap-1 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:items-baseline sm:gap-4"
            : horizontal
              ? "grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-baseline gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
              : "flex flex-col gap-1",
          className
        )}
        {...props}
      >
        <dt
          className={cn(
            "text-muted",
            stack
              ? "text-xs font-medium sm:text-sm sm:font-normal"
              : horizontal
                ? "text-sm"
                : "text-xs font-medium"
          )}
        >
          {term}
        </dt>
        <dd className={cn("min-w-0 text-fg", horizontal && !stack && "text-right sm:text-left")}>
          <div className="font-medium">{value ?? children}</div>
          {helper && <div className="mt-0.5 text-xs text-muted">{helper}</div>}
        </dd>
      </div>
    );
  }
);
DescriptionItem.displayName = "DescriptionItem";
