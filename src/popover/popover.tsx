"use client";

import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type FocusEvent as ReactFocusEvent,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "../utils/cn";
import { getFirstFocusable, safeFocus } from "../modal/focus";

export type PopoverAlign = "start" | "end" | "center";
export type PopoverSide = "bottom" | "top";

/** Props to spread onto a custom trigger element when using the render-prop form. */
export interface PopoverTriggerProps {
  id: string;
  "aria-expanded": boolean;
  "aria-haspopup": "dialog";
  "aria-controls": string | undefined;
  "data-kaneki-popover-trigger": string;
  onClick: (event: ReactMouseEvent<HTMLElement>) => void;
}

export interface PopoverApi {
  /** Whether the panel is open. */
  open: boolean;
  /** Close the panel and return focus to the trigger. */
  close: () => void;
}

const PopoverContext = createContext<PopoverApi | null>(null);

/** Access the nearest Popover (e.g. to close it from custom content). */
export function usePopover(): PopoverApi {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error("usePopover must be used within <Popover />");
  return ctx;
}

export interface PopoverProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "role"> {
  /**
   * The trigger. Either an element (it receives aria-expanded, aria-haspopup,
   * aria-controls and an onClick toggle via cloneElement; its own onClick still runs)
   * or a render function that receives those props to spread onto your element.
   */
  trigger:
    | ReactElement
    | ((props: PopoverTriggerProps, state: { open: boolean }) => ReactNode);
  /** Panel content, or a function receiving `{ open, close }`. */
  children: ReactNode | ((api: PopoverApi) => ReactNode);
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. Default false. */
  defaultOpen?: boolean;
  /** Called whenever the popover wants to open or close. */
  onOpenChange?: (open: boolean) => void;
  /** Horizontal alignment of the panel against the trigger. Default "start". */
  align?: PopoverAlign;
  /** Which side of the trigger the panel opens on. Default "bottom". */
  side?: PopoverSide;
  /** Element to focus on open. Defaults to the first focusable element in the panel, else the panel. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Close on pointerdown outside the popover. Default true. */
  closeOnOutsideClick?: boolean;
  /** Close on Escape. Default true. */
  closeOnEscape?: boolean;
  /** Close when focus moves outside the popover (e.g. Tab past the last item). Default true. */
  closeOnFocusOut?: boolean;
  /** Classes for the positioned panel (`className` also targets the panel). */
  panelClassName?: string;
  /** Classes for the relative wrapper around trigger and panel. */
  wrapperClassName?: string;
}

const sideClasses: Record<PopoverSide, string> = {
  bottom: "top-full mt-2",
  top: "bottom-full mb-2",
};

const alignClasses: Record<PopoverAlign, string> = {
  start: "left-0",
  end: "right-0",
  center: "left-1/2 -translate-x-1/2",
};

const originClasses: Record<PopoverSide, Record<PopoverAlign, string>> = {
  bottom: { start: "origin-top-left", end: "origin-top-right", center: "origin-top" },
  top: { start: "origin-bottom-left", end: "origin-bottom-right", center: "origin-bottom" },
};

/**
 * Non-modal popover dialog anchored to a trigger. The panel is absolutely
 * positioned inside a relative wrapper (no portal). Focus moves into the panel on
 * open and back to the trigger on close (except when closed by clicking elsewhere).
 */
export function Popover({
  trigger,
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  align = "start",
  side = "bottom",
  initialFocusRef,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  closeOnFocusOut = true,
  className,
  panelClassName,
  wrapperClassName,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  id: panelIdProp,
  ...panelProps
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;

  const baseId = useId();
  const panelId = panelIdProp ?? `${baseId}-panel`;
  const fallbackTriggerId = `${baseId}-trigger`;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef(true);
  const wasOpen = useRef(open);

  const latest = useRef({ isControlled, onOpenChange, initialFocusRef });
  latest.current = { isControlled, onOpenChange, initialFocusRef };

  const setOpen = useCallback((next: boolean, returnFocus = true) => {
    returnFocusRef.current = returnFocus;
    if (!latest.current.isControlled) setInternalOpen(next);
    latest.current.onOpenChange?.(next);
  }, []);

  const close = useCallback(() => setOpen(false, true), [setOpen]);

  const getTrigger = () =>
    wrapperRef.current?.querySelector<HTMLElement>(
      `[data-kaneki-popover-trigger="${CSS.escape(panelId)}"]`
    ) ?? null;

  // Focus management on open / close transitions.
  useEffect(() => {
    if (open && !wasOpen.current) {
      const panel = panelRef.current;
      const target =
        latest.current.initialFocusRef?.current ?? getFirstFocusable(panel) ?? panel;
      safeFocus(target);
    } else if (!open && wasOpen.current) {
      const active = document.activeElement;
      const focusLost = !active || active === document.body;
      const focusInside = !!active && !!wrapperRef.current?.contains(active);
      if (returnFocusRef.current && (focusLost || focusInside)) safeFocus(getTrigger());
      returnFocusRef.current = true;
    }
    wasOpen.current = open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Outside pointerdown closes without stealing focus back.
  useEffect(() => {
    if (!open || !closeOnOutsideClick) return;
    const onPointerDown = (e: PointerEvent) => {
      const wrapper = wrapperRef.current;
      if (wrapper && e.target instanceof Node && !wrapper.contains(e.target)) {
        setOpen(false, false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, closeOnOutsideClick, setOpen]);

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && open && closeOnEscape) {
      // preventDefault also stops an enclosing <dialog> from treating it as its own Escape.
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  };

  const handleBlur = (e: ReactFocusEvent<HTMLDivElement>) => {
    if (!open || !closeOnFocusOut) return;
    const next = e.relatedTarget;
    if (next instanceof Node && !e.currentTarget.contains(next)) setOpen(false, false);
  };

  const toggle = () => setOpen(!open, true);

  const triggerProps = (ownId?: string, ownOnClick?: (e: ReactMouseEvent<HTMLElement>) => void): PopoverTriggerProps => ({
    id: ownId ?? fallbackTriggerId,
    "aria-expanded": open,
    "aria-haspopup": "dialog",
    "aria-controls": open ? panelId : undefined,
    "data-kaneki-popover-trigger": panelId,
    onClick: (e) => {
      ownOnClick?.(e);
      if (!e.defaultPrevented) toggle();
    },
  });

  let triggerNode: ReactNode;
  let triggerId = fallbackTriggerId;
  if (typeof trigger === "function") {
    triggerNode = trigger(triggerProps(), { open });
  } else if (isValidElement(trigger)) {
    const own = trigger.props as {
      id?: string;
      onClick?: (e: ReactMouseEvent<HTMLElement>) => void;
    };
    const props = triggerProps(own.id, own.onClick);
    triggerId = props.id;
    triggerNode = cloneElement(trigger as ReactElement<Record<string, unknown>>, {
      ...props,
    });
  } else {
    triggerNode = trigger;
  }

  const api: PopoverApi = { open, close };

  return (
    <PopoverContext.Provider value={api}>
      <div
        ref={wrapperRef}
        className={cn("relative inline-block", wrapperClassName)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      >
        {triggerNode}
        {open && (
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            tabIndex={-1}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabel ? ariaLabelledBy : (ariaLabelledBy ?? triggerId)}
            className={cn(
              "absolute z-50 min-w-48 rounded-xl border border-border bg-surface p-3 text-sm text-fg shadow-xl animate-pop-in motion-reduce:animate-none focus:outline-none",
              sideClasses[side],
              alignClasses[align],
              originClasses[side][align],
              className,
              panelClassName
            )}
            {...panelProps}
          >
            {typeof children === "function" ? children(api) : children}
          </div>
        )}
      </div>
    </PopoverContext.Provider>
  );
}

export interface PopoverCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

/** A button that closes the nearest Popover (focus returns to the trigger). Unstyled apart from a focus ring; pass className. */
export const PopoverClose = forwardRef<HTMLButtonElement, PopoverCloseProps>(
  ({ onClick, className, type = "button", ...props }, ref) => {
    const { close } = usePopover();
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0",
          className
        )}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) close();
        }}
        {...props}
      />
    );
  }
);

PopoverClose.displayName = "PopoverClose";
