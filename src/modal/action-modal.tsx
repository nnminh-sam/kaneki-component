"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AlertTriangle, Info } from "lucide-react";
import { Button } from "../button/button";
import { cn } from "../utils/cn";
import { Modal, type ModalVariant } from "./modal";

export type ActionModalType = "prompt" | "confirm" | "alert";

export interface ActionModalProps {
  /** Whether the dialog is shown. */
  isOpen: boolean;
  /** "prompt" asks for a text value, "confirm" asks yes/no, "alert" only acknowledges. Default "prompt". */
  type?: ActionModalType;
  /** Heading. */
  title: ReactNode;
  /** Supporting text under the title. */
  description?: ReactNode;
  /** Initial value of the prompt input. */
  defaultValue?: string;
  /** Placeholder of the prompt input. */
  inputPlaceholder?: string;
  /** Accessible label of the prompt input. Defaults to the title when it is a string. */
  inputLabel?: string;
  /** Confirm button text. Default "Confirm". */
  confirmText?: ReactNode;
  /** Cancel button text. Default "Cancel". */
  cancelText?: ReactNode;
  /** Danger styling; the Cancel button receives initial focus. */
  isDestructive?: boolean;
  /** Shows a spinner on Confirm and blocks every close path. */
  isLoading?: boolean;
  /** Extra content rendered under the description. */
  children?: ReactNode;
  /** Called with the trimmed input (prompt) or no argument (confirm / alert). */
  onConfirm: (inputValue?: string) => void;
  /** Called on Cancel, Escape, backdrop click or the X button. */
  onCancel: () => void;
  /** Passed to Modal. Default "dialog". */
  variant?: ModalVariant;
  /** Hide the decorative icon tile. */
  hideIcon?: boolean;
}

/** Small prompt / confirm / alert dialog built on Modal. */
export function ActionModal({
  isOpen,
  type = "prompt",
  title,
  description,
  defaultValue = "",
  inputPlaceholder = "",
  inputLabel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
  children,
  onConfirm,
  onCancel,
  variant = "dialog",
  hideIcon = false,
}: ActionModalProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const formId = useId();

  useEffect(() => {
    if (isOpen) setValue(defaultValue);
  }, [isOpen, defaultValue]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (type === "prompt") {
      const trimmed = value.trim();
      if (!trimmed) return;
      onConfirm(trimmed);
    } else {
      onConfirm();
    }
  };

  const initialFocusRef =
    type === "prompt"
      ? inputRef
      : isDestructive && type === "confirm"
        ? cancelRef
        : confirmRef;

  const iconTile = hideIcon ? undefined : (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg",
        isDestructive ? "bg-danger-soft text-danger" : "bg-accent-soft text-accent"
      )}
    >
      {isDestructive ? <AlertTriangle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
    </div>
  );

  const hasBody = type === "prompt" || Boolean(children);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      description={description}
      icon={iconTile}
      size="md"
      variant={variant}
      busy={isLoading}
      initialFocusRef={initialFocusRef}
      bodyClassName={hasBody ? undefined : "pb-0"}
      footerClassName="border-t-0 pt-0 pb-5 gap-2"
      footer={
        <>
          {type !== "alert" && (
            <Button
              ref={cancelRef}
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
            ref={confirmRef}
            type="submit"
            form={formId}
            variant={isDestructive ? "danger" : "primary"}
            size="sm"
            isLoading={isLoading}
            disabled={isLoading || (type === "prompt" && !value.trim())}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate>
        {children && <div className={cn(type === "prompt" && "mb-3")}>{children}</div>}
        {type === "prompt" && (
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={inputPlaceholder}
            aria-label={inputLabel ?? (typeof title === "string" ? title : undefined)}
            disabled={isLoading}
            className="w-full rounded-lg border border-border bg-surface-subtle px-3 py-2 text-sm text-fg placeholder:text-muted transition-colors focus:border-accent focus:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50"
          />
        )}
      </form>
    </Modal>
  );
}
