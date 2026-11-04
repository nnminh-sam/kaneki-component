"use client";

import {
  useEffect,
  useState,
  type ImgHTMLAttributes,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { cn } from "../utils/cn";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type AvatarStatus = "online" | "offline" | "busy" | "away";

export interface AvatarProps {
  /** Image URL. Falls back to initials when missing or when it fails to load. */
  src?: string;
  /** Person's name; used for the initials fallback and the image alt text. */
  name?: string;
  /** xs 24px, sm 32px, md 40px (default), lg 48px, xl 64px, 2xl 80px. */
  size?: AvatarSize;
  /** Presence dot at the bottom right. */
  status?: AvatarStatus;
  /** Extra props for the `<img>` (e.g. `referrerPolicy`, `loading`). `src` and `alt` are set by Avatar unless overridden here. */
  imgProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, "src">;
  /** Called when the image fails to load (the initials fallback is shown). */
  onError?: (event: SyntheticEvent<HTMLImageElement>) => void;
  /** Slot pinned to the bottom-right corner, e.g. an edit `IconButton`. Hides the status dot when set. */
  badge?: ReactNode;
  /** Class names for the outer wrapper. */
  className?: string;
}

const sizeClasses: Record<AvatarSize, { box: string; text: string; dot: string }> = {
  xs: { box: "h-6 w-6", text: "text-[10px]", dot: "h-1.5 w-1.5" },
  sm: { box: "h-8 w-8", text: "text-xs", dot: "h-2 w-2" },
  md: { box: "h-10 w-10", text: "text-sm", dot: "h-2.5 w-2.5" },
  lg: { box: "h-12 w-12", text: "text-base", dot: "h-3 w-3" },
  xl: { box: "h-16 w-16", text: "text-lg", dot: "h-3.5 w-3.5" },
  "2xl": { box: "h-20 w-20", text: "text-xl", dot: "h-4 w-4" },
};

const statusColors: Record<AvatarStatus, string> = {
  online: "bg-ok",
  offline: "bg-muted",
  busy: "bg-danger",
  away: "bg-warn",
};

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Round avatar: image with an initials fallback, optional status dot and corner badge. */
export function Avatar({
  src,
  name,
  size = "md",
  status,
  imgProps,
  onError,
  badge,
  className,
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const cfg = sizeClasses[size];

  // A new src gets a fresh attempt.
  useEffect(() => setHasError(false), [src]);

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-accent-soft text-accent font-semibold overflow-hidden border border-border select-none",
          cfg.box,
          cfg.text
        )}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={name || "Avatar"}
            {...imgProps}
            onError={(event) => {
              setHasError(true);
              imgProps?.onError?.(event);
              onError?.(event);
            }}
            className={cn("h-full w-full object-cover", imgProps?.className)}
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {status && !badge && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-surface",
            statusColors[status],
            cfg.dot
          )}
          title={`Status: ${status}`}
        />
      )}
      {badge && (
        <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center">
          {badge}
        </span>
      )}
    </div>
  );
}
