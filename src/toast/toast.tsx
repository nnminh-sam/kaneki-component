"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "../utils/cn";

export type ToastType = "default" | "success" | "error" | "warn" | "info";

export interface ToastItem {
  id: string;
  type?: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  toast: (options: Omit<ToastItem, "id">) => string;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  warn: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({
      type = "default",
      title,
      description,
      duration = 4000,
    }: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const item: ToastItem = { id, type, title, description, duration };

      setToasts((prev) => [...prev, item]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }

      return id;
    },
    [dismiss]
  );

  const success = useCallback(
    (title: string, description?: string) =>
      toast({ type: "success", title, description }),
    [toast]
  );

  const error = useCallback(
    (title: string, description?: string) =>
      toast({ type: "error", title, description }),
    [toast]
  );

  const warn = useCallback(
    (title: string, description?: string) =>
      toast({ type: "warn", title, description }),
    [toast]
  );

  const info = useCallback(
    (title: string, description?: string) =>
      toast({ type: "info", title, description }),
    [toast]
  );

  const typeConfig: Record<
    ToastType,
    { icon: ReactNode; borderClass: string; bgClass: string; textClass: string }
  > = {
    default: {
      icon: <Info className="h-4 w-4 text-accent" />,
      borderClass: "border-border",
      bgClass: "bg-surface",
      textClass: "text-fg",
    },
    success: {
      icon: <CheckCircle2 className="h-4 w-4 text-ok" />,
      borderClass: "border-ok/30",
      bgClass: "bg-surface",
      textClass: "text-ok",
    },
    error: {
      icon: <AlertCircle className="h-4 w-4 text-danger" />,
      borderClass: "border-danger/30",
      bgClass: "bg-surface",
      textClass: "text-danger",
    },
    warn: {
      icon: <AlertTriangle className="h-4 w-4 text-warn" />,
      borderClass: "border-warn/30",
      bgClass: "bg-surface",
      textClass: "text-warn",
    },
    info: {
      icon: <Info className="h-4 w-4 text-accent" />,
      borderClass: "border-accent/30",
      bgClass: "bg-surface",
      textClass: "text-accent",
    },
  };

  return (
    <ToastContext.Provider
      value={{ toasts, toast, success, error, warn, info, dismiss }}
    >
      {children}

      {/* Floating Toast Viewport */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3">
        {toasts.map((t) => {
          const cfg = typeConfig[t.type || "default"];
          return (
            <div
              key={t.id}
              role="alert"
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-xl transition-all duration-200 bg-surface",
                cfg.borderClass
              )}
            >
              <div className="shrink-0 mt-0.5">{cfg.icon}</div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-semibold", cfg.textClass)}>
                  {t.title}
                </p>
                {t.description && (
                  <p className="mt-0.5 text-xs text-muted leading-relaxed">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="shrink-0 rounded p-1 text-muted hover:text-fg hover:bg-surface-subtle transition-colors cursor-pointer"
                aria-label="Close notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a <ToastProvider />");
  }
  return context;
}
