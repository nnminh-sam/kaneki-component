"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { IconButton } from "../button/button";
import { cn } from "../utils/cn";
import { getFirstFocusable, lockBodyScroll, safeFocus } from "./focus";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

/** What triggered a close request. */
export type ModalCloseReason = "escape" | "backdrop" | "close-button";

export type ModalVariant = "dialog" | "sheet";

export type ModalTitleTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "p";

export interface ModalProps {
  /** Whether the dialog is shown. */
  isOpen: boolean;
  /** Called when a close request is accepted (after `onRequestClose`, if any, did not veto it). */
  onClose: () => void;
  /**
   * Called before any user-initiated close. Return (or resolve to) `false` to veto,
   * e.g. to guard unsaved changes. Any other result lets the close continue to `onClose`.
   */
  onRequestClose?: (
    reason: ModalCloseReason
  ) => boolean | void | Promise<boolean | void>;
  /** Heading; wired to aria-labelledby. */
  title?: ReactNode;
  /** Element used for the title. Default "h2". */
  titleAs?: ModalTitleTag;
  /** Supporting text under the title; wired to aria-describedby. */
  description?: ReactNode;
  /** Optional visual (e.g. an icon tile) shown left of the title. */
  icon?: ReactNode;
  /** Body content. It scrolls internally when taller than the viewport allows. */
  children: ReactNode;
  /** Actions row pinned to the bottom of the dialog. */
  footer?: ReactNode;
  /** Max-width preset. Ignored when `width` is set. Default "md". */
  size?: ModalSize;
  /** Explicit width as any CSS length (e.g. "36rem", "640px"). Capped to the viewport. */
  width?: string;
  /** "sheet" renders as a bottom sheet below the `sm` breakpoint and a centred dialog above it. Default "dialog". */
  variant?: ModalVariant;
  /** Show the X button in the header. Default true. */
  showCloseButton?: boolean;
  /** Accessible label of the X button. Default "Close dialog". */
  closeButtonLabel?: string;
  /** Close when the backdrop is clicked. Default true. */
  closeOnOutsideClick?: boolean;
  /** Close on the Escape key. Default true. */
  closeOnEsc?: boolean;
  /** Sets aria-busy and disables every close path (Escape, backdrop, X button). */
  busy?: boolean;
  /** Element to focus on open. Defaults to the first focusable element in the body, then the footer, else the dialog itself (never the header close button first). */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /**
   * Alternative to `initialFocusRef`: a CSS selector resolved inside the dialog
   * (e.g. `"#amount"`), or a function receiving the dialog element and returning
   * the element to focus. Falls back to the default when it resolves to nothing.
   */
  initialFocus?: string | ((dialog: HTMLDialogElement) => HTMLElement | null | undefined);
  /** Classes for the dialog panel. */
  className?: string;
  /** Classes for the scrollable body. */
  bodyClassName?: string;
  /** Classes for the footer row. */
  footerClassName?: string;
}

const dialogSizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  full: "max-w-5xl",
};

const sheetSizeClasses: Record<ModalSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-2xl",
  full: "sm:max-w-5xl",
};

function isOutsideRect(el: HTMLElement, e: { clientX: number; clientY: number }) {
  const r = el.getBoundingClientRect();
  return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
}

/**
 * Accessible modal dialog built on the native `<dialog>` element (opened with
 * `showModal()`, so the rest of the page is inert), portalled to document.body.
 */
export function Modal({
  isOpen,
  onClose,
  onRequestClose,
  title,
  titleAs: TitleTag = "h2",
  description,
  icon,
  children,
  footer,
  size = "md",
  width,
  variant = "dialog",
  showCloseButton = true,
  closeButtonLabel = "Close dialog",
  closeOnOutsideClick = true,
  closeOnEsc = true,
  busy = false,
  initialFocusRef,
  initialFocus,
  className,
  bodyClassName,
  footerClassName,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const pointerDownOnBackdrop = useRef(false);
  const pendingRequest = useRef(false);

  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-description`;

  // Latest values, read from event handlers and effects without re-subscribing.
  const latest = useRef({ isOpen, busy, closeOnEsc, onClose, onRequestClose, initialFocusRef, initialFocus });
  latest.current = { isOpen, busy, closeOnEsc, onClose, onRequestClose, initialFocusRef, initialFocus };

  useEffect(() => setMounted(true), []);

  const requestClose = useCallback(async (reason: ModalCloseReason) => {
    if (latest.current.busy || pendingRequest.current) return;
    pendingRequest.current = true;
    try {
      const guard = latest.current.onRequestClose;
      const result = guard ? await guard(reason) : undefined;
      if (result === false || latest.current.busy || !latest.current.isOpen) return;
      latest.current.onClose();
    } finally {
      pendingRequest.current = false;
    }
  }, []);

  // Open with showModal(), lock scroll, move focus in; undo all of it on close/unmount.
  useEffect(() => {
    if (!isOpen || !mounted) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previouslyFocused = document.activeElement;
    if (!dialog.open) {
      try {
        dialog.showModal();
      } catch {
        dialog.setAttribute("open", "");
      }
    }
    const unlock = lockBodyScroll();

    const resolveInitial = (): HTMLElement | null => {
      const spec = latest.current.initialFocus;
      if (typeof spec === "string") {
        try {
          return dialog.querySelector<HTMLElement>(spec);
        } catch {
          return null;
        }
      }
      return typeof spec === "function" ? spec(dialog) ?? null : null;
    };
    const target =
      latest.current.initialFocusRef?.current ??
      resolveInitial() ??
      getFirstFocusable(bodyRef.current) ??
      getFirstFocusable(footerRef.current) ??
      dialog;
    safeFocus(target);

    return () => {
      unlock();
      if (dialog.open) dialog.close();
      safeFocus(previouslyFocused);
    };
  }, [isOpen, mounted]);

  const handleCancel = (e: SyntheticEvent<HTMLDialogElement>) => {
    // Escape: never let the browser close it on its own; route through requestClose.
    e.preventDefault();
    if (latest.current.closeOnEsc) void requestClose("escape");
  };

  const handleNativeClose = () => {
    // Some browsers force-close a dialog on repeated Escape even when `cancel` is
    // prevented. Keep the DOM in sync with `isOpen`, then treat it as an Escape request.
    const dialog = dialogRef.current;
    if (!latest.current.isOpen || !dialog || dialog.open || !dialog.isConnected) return;
    try {
      dialog.showModal();
    } catch {
      dialog.setAttribute("open", "");
    }
    if (latest.current.closeOnEsc) void requestClose("escape");
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDialogElement>) => {
    pointerDownOnBackdrop.current =
      e.target === e.currentTarget && isOutsideRect(e.currentTarget, e);
  };

  const handleClick = (e: ReactMouseEvent<HTMLDialogElement>) => {
    const startedOnBackdrop = pointerDownOnBackdrop.current;
    pointerDownOnBackdrop.current = false;
    if (!closeOnOutsideClick || !startedOnBackdrop) return;
    if (e.target === e.currentTarget && isOutsideRect(e.currentTarget, e)) {
      void requestClose("backdrop");
    }
  };

  if (!mounted || !isOpen) return null;

  const hasHeader = Boolean(title || description || icon || showCloseButton);
  const isSheet = variant === "sheet";
  const style = width
    ? ({ "--kaneki-modal-width": width } as CSSProperties)
    : undefined;

  const widthClasses = isSheet
    ? cn(
        "w-full max-w-none sm:w-[calc(100%-2rem)]",
        width
          ? "sm:w-[var(--kaneki-modal-width)] sm:max-w-[calc(100%-2rem)]"
          : sheetSizeClasses[size]
      )
    : cn(
        "w-[calc(100%-2rem)]",
        width
          ? "w-[var(--kaneki-modal-width)] max-w-[calc(100%-2rem)]"
          : dialogSizeClasses[size]
      );

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      aria-busy={busy || undefined}
      data-variant={variant}
      tabIndex={-1}
      style={style}
      onCancel={handleCancel}
      onClose={handleNativeClose}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      className={cn(
        "fixed inset-0 z-50 max-h-[90dvh] flex-col overflow-hidden border border-border bg-surface p-0 text-fg shadow-xl open:flex focus:outline-none",
        "backdrop:bg-black/50 backdrop:backdrop-blur-sm backdrop:animate-fade-in",
        isSheet
          ? "mx-0 mb-0 mt-auto rounded-t-2xl rounded-b-none border-b-0 pb-[env(safe-area-inset-bottom)] animate-sheet-up sm:m-auto sm:rounded-2xl sm:border-b sm:pb-0 sm:animate-pop-in"
          : "m-auto rounded-2xl animate-pop-in",
        "motion-reduce:animate-none",
        widthClasses,
        className
      )}
    >
      {isSheet && (
        <div
          aria-hidden="true"
          className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border sm:hidden"
        />
      )}

      {hasHeader && (
        <div className="flex shrink-0 items-start gap-3 px-6 pt-6 pb-4">
          {icon && <div className="shrink-0">{icon}</div>}
          <div className="min-w-0 flex-1">
            {title && (
              <TitleTag id={titleId} className="text-base font-semibold text-fg">
                {title}
              </TitleTag>
            )}
            {description && (
              <div id={descriptionId} className="mt-1 text-xs leading-relaxed text-muted">
                {description}
              </div>
            )}
          </div>
          {showCloseButton && (
            <IconButton
              label={closeButtonLabel}
              showTitle={false}
              icon={<X />}
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => void requestClose("close-button")}
              className="-mr-2 -mt-1.5 text-muted hover:text-fg max-sm:h-10 max-sm:w-10"
            />
          )}
        </div>
      )}

      <div
        ref={bodyRef}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6 text-sm text-fg",
          !hasHeader && "pt-6",
          bodyClassName
        )}
      >
        {children}
      </div>

      {footer && (
        <div
          ref={footerRef}
          className={cn(
            "flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-border px-6 py-4",
            footerClassName
          )}
        >
          {footer}
        </div>
      )}
    </dialog>,
    document.body
  );
}
