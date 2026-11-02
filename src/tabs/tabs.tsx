"use client";

import {
  createContext,
  useContext,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className = "",
}: TabsProps) {
  const [internalTab, setInternalTab] = useState(defaultValue);
  const activeTab = value !== undefined ? value : internalTab;

  const setActiveTab = (nextTab: string) => {
    if (value === undefined) {
      setInternalTab(nextTab);
    }
    onValueChange?.(nextTab);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`space-y-4 ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function TabList({ children, className = "", ...props }: TabListProps) {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center gap-1 rounded-xl border border-border bg-surface-subtle p-1 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TabTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: ReactNode;
  icon?: ReactNode;
}

export function TabTrigger({
  value,
  children,
  icon,
  className = "",
  ...props
}: TabTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabTrigger must be used within <Tabs />");

  const isActive = context.activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => context.setActiveTab(value)}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
        isActive
          ? "bg-surface font-semibold text-fg shadow-xs"
          : "text-muted hover:text-fg hover:bg-surface/50"
      } ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export interface TabContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
}

export function TabContent({
  value,
  children,
  className = "",
  ...props
}: TabContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabContent must be used within <Tabs />");

  if (context.activeTab !== value) return null;

  return (
    <div role="tabpanel" className={`focus:outline-none ${className}`} {...props}>
      {children}
    </div>
  );
}
