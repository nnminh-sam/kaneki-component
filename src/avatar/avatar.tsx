import { useState } from "react";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarStatus = "online" | "offline" | "busy" | "away";

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  className?: string;
}

const sizeClasses: Record<AvatarSize, { box: string; text: string; dot: string }> = {
  xs: { box: "h-6 w-6", text: "text-[10px]", dot: "h-1.5 w-1.5" },
  sm: { box: "h-8 w-8", text: "text-xs", dot: "h-2 w-2" },
  md: { box: "h-10 w-10", text: "text-sm", dot: "h-2.5 w-2.5" },
  lg: { box: "h-12 w-12", text: "text-base", dot: "h-3 w-3" },
  xl: { box: "h-16 w-16", text: "text-lg", dot: "h-3.5 w-3.5" },
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

export function Avatar({
  src,
  name,
  size = "md",
  status,
  className = "",
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const cfg = sizeClasses[size];

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={`flex items-center justify-center rounded-full bg-accent-soft text-accent font-semibold overflow-hidden border border-border select-none ${cfg.box} ${cfg.text}`}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={name || "Avatar"}
            onError={() => setHasError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-surface ${statusColors[status]} ${cfg.dot}`}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
}
