"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../utils/cn";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded bg-surface-subtle", className)}
      {...props}
    />
  );
}

export interface LoadingBarProps {
  className?: string;
}

export function LoadingBar({ className }: LoadingBarProps) {
  return (
    <div
      role="progressbar"
      aria-label="Loading content"
      aria-busy="true"
      className={cn("relative h-0.5 w-full overflow-hidden bg-accent-soft", className)}
    >
      <div className="h-full w-full origin-left animate-indeterminate bg-accent" />
    </div>
  );
}

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
  label,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }[size];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex items-center gap-2 text-muted", className)}
    >
      <Loader2 className={cn(sizeClasses, "animate-spin text-accent")} />
      {label && <span className="text-xs font-medium">{label}</span>}
    </div>
  );
}
