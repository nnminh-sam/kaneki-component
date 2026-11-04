/* Internal focus helpers shared by Modal and Popover. Not part of the public API. */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "audio[controls]",
  "video[controls]",
  "[contenteditable]:not([contenteditable='false'])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/** Returns the first keyboard-focusable, visible element inside `root`. */
export function getFirstFocusable(root: HTMLElement | null): HTMLElement | null {
  if (!root) return null;
  const candidates = root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  for (const el of Array.from(candidates)) {
    if (el.closest("[hidden],[inert]")) continue;
    if (el.getClientRects().length === 0) continue;
    return el;
  }
  return null;
}

/** Focuses an element without scrolling, if it can still receive focus. */
export function safeFocus(el: Element | null | undefined): void {
  if (el && el instanceof HTMLElement && el.isConnected) {
    el.focus({ preventScroll: true });
  }
}

let scrollLockCount = 0;
let savedOverflow = "";
let savedPaddingRight = "";

/** Locks body scroll (ref-counted, so nested modals work). Returns the unlock function. */
export function lockBodyScroll(): () => void {
  const body = document.body;
  if (scrollLockCount === 0) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    savedOverflow = body.style.overflow;
    savedPaddingRight = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      const current = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${current + scrollbarWidth}px`;
    }
  }
  scrollLockCount += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    scrollLockCount -= 1;
    if (scrollLockCount === 0) {
      body.style.overflow = savedOverflow;
      body.style.paddingRight = savedPaddingRight;
    }
  };
}
