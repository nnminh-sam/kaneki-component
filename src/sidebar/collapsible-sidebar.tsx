"use client";

import {
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

export interface CollapsibleSidebarRenderState {
  collapsed: boolean;
  closeMobile: () => void;
}

export interface CollapsibleSidebarProps {
  /** Icon rendered in the header badge and expand button */
  icon: ReactNode;
  /** Primary title in the header */
  title: string;
  /** Optional subtitle/description in the header */
  description?: string;
  /** Optional link href for the header brand area */
  headerHref?: string;
  /** Custom Link component (e.g. Next.js Link or React Router Link) */
  LinkComponent?: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
    onClick?: () => void;
  }>;
  /** Accessible label for the <aside> element */
  ariaLabel?: string;
  /** Controlled collapsed state */
  collapsed?: boolean;
  /** Initial collapsed state when uncontrolled */
  defaultCollapsed?: boolean;
  /** Callback fired when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Controlled mobile drawer open state */
  mobileOpen?: boolean;
  /** Initial mobile drawer open state when uncontrolled */
  defaultMobileOpen?: boolean;
  /** Callback fired when mobile drawer open state changes */
  onMobileOpenChange?: (open: boolean) => void;
  /** Desktop width class when expanded (default: "w-64") */
  expandedWidthClass?: string;
  /** Desktop width class when collapsed (default: "w-16") */
  collapsedWidthClass?: string;
  /** When true, sidebar is only used as a mobile drawer and hidden on desktop */
  mobileOnly?: boolean;
  /** Main scrollable body content */
  children: ReactNode | ((state: CollapsibleSidebarRenderState) => ReactNode);
  /** Optional footer content */
  footer?: ReactNode | ((state: CollapsibleSidebarRenderState) => ReactNode);
  /** Custom className for the aside element */
  className?: string;
}

const DefaultLink: ComponentType<{
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}> = ({ href, className, children, onClick }) => (
  <a href={href} className={className} onClick={onClick}>
    {children}
  </a>
);

export function CollapsibleSidebar({
  icon,
  title,
  description,
  headerHref,
  LinkComponent = DefaultLink,
  ariaLabel,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  mobileOpen: controlledMobileOpen,
  defaultMobileOpen = false,
  onMobileOpenChange,
  expandedWidthClass = "w-64",
  collapsedWidthClass = "w-16",
  mobileOnly = false,
  children,
  footer,
  className = "",
}: CollapsibleSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const [internalMobileOpen, setInternalMobileOpen] =
    useState(defaultMobileOpen);

  const isCollapsed = controlledCollapsed ?? internalCollapsed;
  const isMobileOpen = controlledMobileOpen ?? internalMobileOpen;

  const setCollapsed = (next: boolean) => {
    if (controlledCollapsed === undefined) {
      setInternalCollapsed(next);
    }
    onCollapsedChange?.(next);
  };

  const setMobileOpen = (next: boolean) => {
    if (controlledMobileOpen === undefined) {
      setInternalMobileOpen(next);
    }
    onMobileOpenChange?.(next);
  };

  const closeMobile = () => setMobileOpen(false);

  const renderState: CollapsibleSidebarRenderState = {
    collapsed: isCollapsed,
    closeMobile,
  };

  const brandContent = (
    <>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
        {icon}
      </span>
      <div className="truncate text-left">
        <p className="truncate text-sm font-semibold tracking-tight text-fg">
          {title}
        </p>
        {description && (
          <p className="truncate text-[11px] text-muted">{description}</p>
        )}
      </div>
    </>
  );

  const LinkElem = LinkComponent;
  const widthClass = isCollapsed ? collapsedWidthClass : expandedWidthClass;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside */}
      <aside
        aria-label={ariaLabel ?? title}
        className={`fixed inset-y-0 left-0 z-50 flex h-full shrink-0 flex-col border-r border-border bg-surface transition-all duration-200 md:static md:z-auto ${
          mobileOnly ? "md:hidden" : ""
        } ${
          isMobileOpen
            ? "w-72 sm:w-80 translate-x-0 shadow-2xl md:shadow-none"
            : "-translate-x-full md:translate-x-0"
        } md:${widthClass} ${className}`}
      >
        {/* Brand / Header */}
        <div
          className={`flex h-14 shrink-0 items-center justify-between border-b border-border px-3.5 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          {!isCollapsed &&
            (headerHref ? (
              <LinkElem
                href={headerHref}
                onClick={closeMobile}
                className="flex min-w-0 items-center gap-2.5 overflow-hidden"
              >
                {brandContent}
              </LinkElem>
            ) : (
              <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">
                {brandContent}
              </div>
            ))}

          {/* Desktop Toggle Button */}
          {isCollapsed ? (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
              aria-label="Expand sidebar"
              className="group hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent transition-colors hover:bg-surface-subtle hover:text-fg md:inline-flex cursor-pointer"
            >
              <span className="flex items-center justify-center group-hover:hidden">
                {icon}
              </span>
              <PanelLeftOpen className="hidden h-4 w-4 group-hover:block" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              className="hidden rounded-lg p-1.5 text-muted hover:bg-surface-subtle hover:text-fg md:inline-flex cursor-pointer"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-muted hover:bg-surface-subtle hover:text-fg md:hidden cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
          {typeof children === "function" ? children(renderState) : children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="border-t border-border p-3">
            {typeof footer === "function" ? footer(renderState) : footer}
          </div>
        )}
      </aside>
    </>
  );
}
