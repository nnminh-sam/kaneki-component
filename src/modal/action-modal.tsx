"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, Info, X } from "lucide-react";
import { Button } from "../button/button";

export type ActionModalType = "prompt" | "confirm" | "alert";

export interface ActionModalProps {
  isOpen: boolean;
  type?: ActionModalType;
  title: string;
  description?: string;
  defaultValue?: string;
  inputPlaceholder?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  children?: ReactNode;
  onConfirm: (inputValue?: string) => void;
  onCancel: () => void;
}

export function ActionModal({
  isOpen,
  type = "prompt",
  title,
  description,
  defaultValue = "",
  inputPlaceholder = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
  children,
  onConfirm,
  onCancel,
}: ActionModalProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(defaultValue);
    if (isOpen && type === "prompt") {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, defaultValue, type]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === "prompt") {
      onConfirm(value.trim());
    } else {
      onConfirm();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          aria-label="Close"
          className="absolute right-3.5 top-3.5 rounded p-1 text-muted hover:text-fg disabled:opacity-50 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          {isDestructive ? (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger-soft text-danger">
              <AlertTriangle className="h-5 w-5" />
            </div>
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Info className="h-5 w-5" />
            </div>
          )}

          <div className="flex-1">
            <h3 className="text-sm font-semibold text-fg">{title}</h3>
            {description && (
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {description}
              </p>
            )}
            {children && <div className="mt-2">{children}</div>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          {type === "prompt" && (
            <div className="mb-4">
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={inputPlaceholder}
                disabled={isLoading}
                className="w-full rounded-lg border border-border bg-surface-subtle px-3 py-2 text-sm text-fg placeholder:text-muted focus:border-accent focus:bg-surface focus:outline-none transition-colors"
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            {type !== "alert" && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onCancel}
                disabled={isLoading}
              >
                {cancelText}
              </Button>
            )}

            <Button
              type="submit"
              variant={isDestructive ? "danger" : "primary"}
              size="sm"
              isLoading={isLoading}
              disabled={isLoading || (type === "prompt" && !value.trim())}
            >
              {confirmText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
