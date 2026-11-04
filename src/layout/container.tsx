import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Max width: sm 640px, md 768px, lg 1024px, xl 1280px (default), full none. */
  size?: ContainerSize;
  /** Apply responsive horizontal padding (px-4 / sm:px-6 / lg:px-8). Default true. */
  padded?: boolean;
}

const sizeStyles: Record<ContainerSize, string> = {
  sm: "max-w-[640px]",
  md: "max-w-[768px]",
  lg: "max-w-[1024px]",
  xl: "max-w-[1280px]",
  full: "max-w-none",
};

/** Centred max-width wrapper with responsive padding. */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = "xl", padded = true, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mx-auto w-full",
        sizeStyles[size],
        padded && "px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    />
  )
);
Container.displayName = "Container";
