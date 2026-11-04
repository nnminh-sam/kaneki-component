"use client";

import {
  createContext,
  useContext,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";
import { useMediaQuery } from "../hooks/use-media-query";

export type TabsOrientation = "horizontal" | "vertical";
export type TabsVariant = "pill" | "rail" | "underline";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
  baseId: string;
  orientation: TabsOrientation;
  variant: TabsVariant;
  keepMounted: boolean;
  /** Vertical on md+, horizontal scroller below md. */
  responsive: boolean;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabsContext(component: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) throw new Error(`${component} must be used within <Tabs />`);
  return context;
}

/** Turns an arbitrary tab value into a string that is safe inside an id. */
function idSafe(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, (c) => `_${c.charCodeAt(0).toString(36)}`);
}

const triggerId = (baseId: string, value: string) => `${baseId}-tab-${idSafe(value)}`;
const panelId = (baseId: string, value: string) => `${baseId}-panel-${idSafe(value)}`;

export interface TabsProps {
  /** Tab selected initially when uncontrolled. */
  defaultValue: string;
  /** Controlled selected tab. */
  value?: string;
  /** Called when the selected tab changes. */
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
  /** Layout direction. "vertical" puts the list beside the panels and uses Up/Down arrows. Default "horizontal". */
  orientation?: TabsOrientation;
  /** Visual style of the list. Default "pill" (horizontal) or "rail" (vertical). */
  variant?: TabsVariant;
  /** Keep inactive panels mounted (with the `hidden` attribute) so their state survives switching. Default false. */
  keepMounted?: boolean;
  /** Base for generated tab / panel ids. Defaults to a React useId value. */
  id?: string;
  /**
   * With `orientation="vertical"`, render the list as a horizontal scroller (hidden
   * scrollbar) above the panels below the `md` breakpoint. Left / Right arrows work there.
   */
  mobileOrientation?: "horizontal";
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
  orientation = "horizontal",
  variant,
  keepMounted = false,
  id,
  mobileOrientation,
}: TabsProps) {
  const [internalTab, setInternalTab] = useState(defaultValue);
  const activeTab = value !== undefined ? value : internalTab;
  const generatedId = useId();
  const baseId = id ?? generatedId;

  const setActiveTab = (nextTab: string) => {
    if (nextTab === activeTab) return;
    if (value === undefined) setInternalTab(nextTab);
    onValueChange?.(nextTab);
  };

  const resolvedVariant = variant ?? (orientation === "vertical" ? "rail" : "pill");
  const responsive = orientation === "vertical" && mobileOrientation === "horizontal";

  return (
    <TabsContext.Provider
      value={{
        activeTab,
        setActiveTab,
        baseId,
        orientation,
        variant: resolvedVariant,
        keepMounted,
        responsive,
      }}
    >
      <div
        data-orientation={orientation}
        className={cn(
          responsive
            ? "flex flex-col gap-4 md:flex-row md:items-start md:gap-6"
            : orientation === "vertical"
              ? "flex items-start gap-6"
              : "space-y-4",
          className
        )}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const listClasses: Record<TabsVariant, Record<TabsOrientation, string>> = {
  pill: {
    horizontal:
      "inline-flex items-center gap-1 rounded-xl border border-border bg-surface-subtle p-1",
    vertical:
      "flex flex-col items-stretch gap-1 rounded-xl border border-border bg-surface-subtle p-1",
  },
  rail: {
    horizontal: "flex items-center gap-1 overflow-x-auto",
    vertical: "flex w-56 shrink-0 flex-col items-stretch gap-0.5",
  },
  underline: {
    horizontal: "flex items-center gap-4 overflow-x-auto border-b border-border",
    vertical: "flex shrink-0 flex-col items-stretch border-l border-border",
  },
};

/** Vertical list classes that fall back to a horizontal scroller below md. */
const responsiveListClasses: Record<TabsVariant, string> = {
  pill: "flex items-center gap-1 overflow-x-auto rounded-xl border border-border bg-surface-subtle p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-col md:items-stretch md:overflow-visible",
  rail: "flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:w-56 md:shrink-0 md:flex-col md:items-stretch md:gap-0.5 md:overflow-visible",
  underline:
    "flex items-center gap-4 overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:shrink-0 md:flex-col md:items-stretch md:gap-0 md:overflow-visible md:border-b-0 md:border-l",
};

export function TabList({
  children,
  className,
  onKeyDown,
  ...props
}: TabListProps) {
  const { orientation, variant, setActiveTab, responsive } = useTabsContext("TabList");
  // False on the server and first render, so SSR markup stays "vertical".
  const isMobile = useMediaQuery("(max-width: 767.98px)");
  const effectiveOrientation: TabsOrientation =
    responsive && isMobile ? "horizontal" : orientation;

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;

    // Vertical lists accept both arrow pairs (they may render horizontally on mobile).
    const prevKeys = orientation === "vertical" ? ["ArrowUp", "ArrowLeft"] : ["ArrowLeft"];
    const nextKeys = orientation === "vertical" ? ["ArrowDown", "ArrowRight"] : ["ArrowRight"];
    const isPrev = prevKeys.includes(e.key);
    const isNext = nextKeys.includes(e.key);
    if (!isPrev && !isNext && e.key !== "Home" && e.key !== "End") return;

    const tabs = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])')
    ).filter((t) => t.closest('[role="tablist"]') === e.currentTarget);
    if (tabs.length === 0) return;

    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
    let next: number;
    if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else if (isNext) next = current < 0 ? 0 : (current + 1) % tabs.length;
    else next = current < 0 ? tabs.length - 1 : (current - 1 + tabs.length) % tabs.length;

    e.preventDefault();
    const target = tabs[next];
    target.focus();
    if (responsive) target.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    const nextValue = target.dataset.value;
    if (nextValue !== undefined) setActiveTab(nextValue);
  };

  return (
    <div
      role="tablist"
      aria-orientation={effectiveOrientation}
      data-variant={variant}
      onKeyDown={handleKeyDown}
      className={cn(
        responsive ? responsiveListClasses[variant] : listClasses[variant][orientation],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TabTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Value that identifies this tab. */
  value: string;
  children: ReactNode;
  /** Leading icon. */
  icon?: ReactNode;
  /** Trailing content such as a count badge or an unsaved-changes dot. */
  trailing?: ReactNode;
}

const triggerBase =
  "inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0 motion-reduce:transition-none";

const triggerClasses: Record<
  TabsVariant,
  { base: Record<TabsOrientation, string>; active: string; inactive: string }
> = {
  pill: {
    base: {
      horizontal: "rounded-lg px-3 py-1.5",
      vertical: "rounded-lg px-3 py-2 justify-start text-left",
    },
    active: "bg-surface font-semibold text-fg shadow-xs",
    inactive: "text-muted hover:text-fg hover:bg-surface/50",
  },
  rail: {
    base: {
      horizontal: "rounded-lg px-3 py-2 text-sm",
      vertical: "w-full rounded-lg px-3 py-2 text-sm justify-start text-left",
    },
    active: "bg-accent-soft font-semibold text-accent",
    inactive: "text-muted hover:bg-surface-subtle hover:text-fg",
  },
  underline: {
    base: {
      horizontal: "-mb-px border-b-2 px-1 py-2 text-sm rounded-t-sm",
      vertical: "-ml-px border-l-2 px-3 py-2 text-sm justify-start text-left rounded-r-sm",
    },
    active: "border-accent font-semibold text-fg",
    inactive: "border-transparent text-muted hover:text-fg hover:border-border",
  },
};

/** Trigger base classes for a responsive (horizontal below md, vertical from md) list. */
const responsiveTriggerBase: Record<TabsVariant, string> = {
  pill: "shrink-0 rounded-lg px-3 py-1.5 md:py-2 md:justify-start md:text-left",
  rail: "shrink-0 rounded-lg px-3 py-2 text-sm md:w-full md:justify-start md:text-left",
  underline:
    "shrink-0 -mb-px border-b-2 px-1 py-2 text-sm rounded-t-sm md:mb-0 md:-ml-px md:border-b-0 md:border-l-2 md:px-3 md:justify-start md:text-left md:rounded-t-none md:rounded-r-sm",
};

export function TabTrigger({
  value,
  children,
  icon,
  trailing,
  className,
  onClick,
  ...props
}: TabTriggerProps) {
  const context = useTabsContext("TabTrigger");
  const { baseId, orientation, variant, keepMounted, responsive } = context;
  const isActive = context.activeTab === value;
  const styles = triggerClasses[variant];

  return (
    <button
      type="button"
      role="tab"
      id={triggerId(baseId, value)}
      aria-selected={isActive}
      aria-controls={isActive || keepMounted ? panelId(baseId, value) : undefined}
      tabIndex={isActive ? 0 : -1}
      data-value={value}
      data-state={isActive ? "active" : "inactive"}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) context.setActiveTab(value);
      }}
      className={cn(
        triggerBase,
        responsive ? responsiveTriggerBase[variant] : styles.base[orientation],
        isActive ? styles.active : styles.inactive,
        className
      )}
      {...props}
    >
      {icon && (
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      <span
        className={cn(
          orientation === "vertical" && (responsive ? "md:flex-1 md:truncate" : "flex-1 truncate")
        )}
      >
        {children}
      </span>
      {trailing && <span className="ml-auto inline-flex shrink-0 items-center">{trailing}</span>}
    </button>
  );
}

export interface TabContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Value of the tab this panel belongs to. */
  value: string;
  children: ReactNode;
  /** Override Tabs' `keepMounted` for this panel. */
  keepMounted?: boolean;
}

export function TabContent({
  value,
  children,
  className,
  keepMounted,
  ...props
}: TabContentProps) {
  const context = useTabsContext("TabContent");
  const isActive = context.activeTab === value;
  const mountWhenInactive = keepMounted ?? context.keepMounted;

  if (!isActive && !mountWhenInactive) return null;

  return (
    <div
      role="tabpanel"
      id={panelId(context.baseId, value)}
      aria-labelledby={triggerId(context.baseId, value)}
      tabIndex={0}
      hidden={!isActive}
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        "rounded-sm data-[state=inactive]:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0",
        context.orientation === "vertical" && "min-w-0 flex-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
