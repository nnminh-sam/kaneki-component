"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ActionModal } from "../modal/action-modal";
import type { ModalVariant } from "../modal/modal";

export interface ConfirmOptions {
  /** Dialog heading. */
  title: ReactNode;
  /** Supporting text under the title. */
  description?: ReactNode;
  /** Confirm button text. Default "Confirm" (or the provider default). */
  confirmText?: ReactNode;
  /** Cancel button text. Default "Cancel" (or the provider default). */
  cancelText?: ReactNode;
  /** Danger styling; Cancel receives initial focus. */
  destructive?: boolean;
}

/** Opens a confirm dialog; resolves true on Confirm, false on Cancel / Escape / backdrop. A string is shorthand for `{ title }`. */
export type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;

interface PendingConfirm {
  id: number;
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

const ConfirmContext = createContext<ConfirmFn | null>(null);

let nextConfirmId = 0;

export interface ConfirmProviderProps {
  children: ReactNode;
  /** Default Confirm button text. Default "Confirm". */
  defaultConfirmText?: ReactNode;
  /** Default Cancel button text. Default "Cancel". */
  defaultCancelText?: ReactNode;
  /** Modal variant used for every confirm. Default "dialog". */
  variant?: ModalVariant;
}

/**
 * Provides `useConfirm()`, a promise-based replacement for `window.confirm`.
 * Concurrent calls are queued and shown one after another.
 */
export function ConfirmProvider({
  children,
  defaultConfirmText = "Confirm",
  defaultCancelText = "Cancel",
  variant = "dialog",
}: ConfirmProviderProps) {
  const [queue, setQueue] = useState<PendingConfirm[]>([]);
  const queueRef = useRef(queue);
  queueRef.current = queue;

  const confirm = useCallback<ConfirmFn>((input) => {
    const options = typeof input === "string" ? { title: input } : input;
    return new Promise<boolean>((resolve) => {
      setQueue((q) => [...q, { id: nextConfirmId++, options, resolve }]);
    });
  }, []);

  // Never leave callers hanging if the provider unmounts.
  useEffect(
    () => () => {
      queueRef.current.forEach((p) => p.resolve(false));
    },
    []
  );

  const current = queue[0];

  const settle = (value: boolean) => {
    if (!current) return;
    const { id, resolve } = current;
    resolve(value);
    setQueue((q) => (q[0]?.id === id ? q.slice(1) : q));
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ActionModal
        // Remount per request so focus and state reset cleanly between queued confirms.
        key={current ? current.id : "idle"}
        isOpen={Boolean(current)}
        type="confirm"
        variant={variant}
        title={current?.options.title ?? ""}
        description={current?.options.description}
        confirmText={current?.options.confirmText ?? defaultConfirmText}
        cancelText={current?.options.cancelText ?? defaultCancelText}
        isDestructive={current?.options.destructive}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
    </ConfirmContext.Provider>
  );
}

/** Returns `confirm(options) => Promise<boolean>`. Must be used inside `<ConfirmProvider>`. */
export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm must be used within <ConfirmProvider />");
  return confirm;
}
