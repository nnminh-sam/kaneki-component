"use client";

import { useEffect, useRef } from "react";

export interface UseUnsavedChangesOptions {
  /** Prompt text for in-app navigations (browsers ignore custom text for beforeunload). */
  message?: string;
  /**
   * Custom confirmation for guarded link clicks (e.g. an in-app dialog).
   * Resolve `true` to continue. When set, `window.confirm` is not used for clicks.
   */
  onConfirmNavigate?: () => Promise<boolean>;
}

const DEFAULT_MESSAGE = "You have unsaved changes. Leave this page?";

/**
 * Warns before leaving while `when` is true:
 * - `beforeunload` for reloads, tab closes and full navigations;
 * - a capture-phase click guard on same-origin `<a href>` navigations, which
 *   covers client-side router links that never fire `beforeunload`.
 *
 * @param when Whether there are unsaved changes.
 * @param messageOrOptions A prompt message, or an options object.
 */
export function useUnsavedChanges(
  when: boolean,
  messageOrOptions?: string | UseUnsavedChangesOptions
): void {
  const opts: UseUnsavedChangesOptions =
    typeof messageOrOptions === "string"
      ? { message: messageOrOptions }
      : messageOrOptions ?? {};
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    if (!when || typeof window === "undefined") return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Older browsers require returnValue to be set.
      e.returnValue = optsRef.current.message ?? DEFAULT_MESSAGE;
      return e.returnValue;
    };

    // True while an approved click is being replayed after an async confirm.
    let bypass = false;

    const onClick = (e: MouseEvent) => {
      if (bypass || e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // new tab / window
      const target = e.target as Element | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      const here = window.location;
      if (url.origin !== here.origin) return;
      if (url.href === here.href) return;
      // In-page hash links do not leave the page.
      if (url.pathname === here.pathname && url.search === here.search && url.hash) return;

      const { message = DEFAULT_MESSAGE, onConfirmNavigate } = optsRef.current;

      if (onConfirmNavigate) {
        e.preventDefault();
        e.stopPropagation();
        void onConfirmNavigate().then((ok) => {
          if (!ok) return;
          window.removeEventListener("beforeunload", onBeforeUnload);
          bypass = true;
          try {
            anchor.click();
          } finally {
            bypass = false;
          }
        });
        return;
      }

      if (window.confirm(message)) {
        window.removeEventListener("beforeunload", onBeforeUnload);
      } else {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [when]);
}
