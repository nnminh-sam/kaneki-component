"use client";

import type { ComponentType, ReactNode } from "react";
import { Tooltip } from "../tooltip/tooltip";

export interface SidebarNavProps {
  children: ReactNode;
  className?: string;
}

export function SidebarNav({ children, className = "" }: SidebarNavProps) {
  return <nav className={`space-y-1 ${className}`}>{children}</nav>;
}

export interface SidebarSectionProps {
  title?: string;
  collapsed?: boolean;
  children: ReactNode;
  className?: string;
}

export function SidebarSection({
  title,
  collapsed = false,
  children,
  className = "",
}: SidebarSectionProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {title && !collapsed && (
        <h4 className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
          {title}
        </h4>
      )}
      {children}
    </div>
  );
}

export interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  badge?: ReactNode;
  href?: string;
  onClick?: () => void;
  LinkComponent?: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
    onClick?: () => void;
  }>;
  className?: string;
}

export function SidebarItem({
  icon,
  label,
  active = false,
  collapsed = false,
  badge,
  href,
  onClick,
  LinkComponent,
  className = "",
}: SidebarItemProps) {
  const content = (
    <>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center transition-colors ${
          active ? "text-accent" : "text-muted group-hover:text-fg"
        }`}
      >
        {icon}
      </span>

      {!collapsed && (
        <>
          <span className="truncate flex-1">{label}</span>
          {badge !== undefined && (
            <span className="shrink-0 rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent">
              {badge}
            </span>
          )}
        </>
      )}
    </>
  );

  const baseClasses = `group relative flex items-center rounded-lg text-xs font-medium transition-all cursor-pointer select-none ${
    collapsed
      ? "justify-center p-2.5 w-10 h-10 mx-auto"
      : "gap-2.5 px-2.5 py-2 w-full text-left"
  } ${
    active
      ? "bg-accent-soft text-accent font-semibold shadow-xs"
      : "text-muted hover:bg-surface-subtle hover:text-fg"
  } ${className}`;

  const element = href ? (
    LinkComponent ? (
      <LinkComponent href={href} onClick={onClick} className={baseClasses}>
        {content}
      </LinkComponent>
    ) : (
      <a href={href} onClick={onClick} className={baseClasses}>
        {content}
      </a>
    )
  ) : (
    <button type="button" onClick={onClick} className={baseClasses}>
      {content}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip content={label} side="right">
        {element}
      </Tooltip>
    );
  }

  return element;
}
