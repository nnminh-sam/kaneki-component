"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ElementType,
  type ForwardedRef,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../utils/cn";
import {
  buttonClasses,
  iconButtonClasses,
  type ButtonShape,
  type ButtonSize,
  type ButtonVariant,
  type IconButtonSize,
} from "../classes";
import type { PolymorphicComponent, PolymorphicImplProps } from "../nav/polymorphic";

/** Button's own props, independent of the rendered element. */
export interface ButtonOwnProps {
  /** Visual style. Default "primary". */
  variant?: ButtonVariant;
  /** Size preset. "icon" is a 40px square for a single icon child (give it an aria-label, or use IconButton). Default "md". */
  size?: ButtonSize;
  /** "pill" gives fully rounded ends. Default "default". */
  shape?: ButtonShape;
  /** Shows a spinner, disables the button and sets aria-busy. */
  isLoading?: boolean;
  /** Icon rendered before the label (replaced by the spinner while loading). */
  leftIcon?: ReactNode;
  /** Icon rendered after the label (hidden while loading). */
  rightIcon?: ReactNode;
  /** Stretch to the container width. */
  fullWidth?: boolean;
  /** When true, forces the legacy white text (useful for demo contrast comparisons). */
  legacyContrast?: boolean;
  /** Disables the button. On non-button elements (`as`) this sets aria-disabled and blocks clicks. */
  disabled?: boolean;
  /** Label content. */
  children?: ReactNode;
  /** Extra classes; they override the defaults. */
  className?: string;
}

/** Props of Button rendered as a native `<button>` (the default). */
export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps>,
    ButtonOwnProps {}

const legacyClasses: Partial<Record<ButtonVariant, string>> = {
  primary: "bg-accent text-white",
  danger: "bg-danger text-white",
  warn: "bg-warn text-white",
  success: "bg-ok text-white",
};

/**
 * Button. Renders a `<button>` by default; pass `as` to render another element or
 * component with button styling, e.g. `<Button as={Link} href="/new">New</Button>`.
 * In server components, use `buttonClasses()` from `kaneki-components/classes` instead.
 */
export const Button = forwardRef(function Button(
  {
    as,
    variant = "primary",
    size = "md",
    shape = "default",
    isLoading = false,
    disabled,
    leftIcon,
    rightIcon,
    fullWidth = false,
    legacyContrast = false,
    className,
    children,
    onClick,
    ...props
  }: PolymorphicImplProps<ButtonOwnProps>,
  ref: ForwardedRef<Element>
) {
  const Comp: ElementType = as ?? "button";
  const isNativeButton = Comp === "button";
  const isDisabled = Boolean(disabled || isLoading);
  const legacy = legacyContrast && legacyClasses[variant];

  const handleClick = (event: ReactMouseEvent<HTMLElement>) => {
    if (!isNativeButton && isDisabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <Comp
      ref={ref}
      {...(isNativeButton
        ? { disabled: isDisabled }
        : {
            "aria-disabled": isDisabled || undefined,
            "data-disabled": isDisabled || undefined,
            tabIndex: isDisabled ? -1 : undefined,
          })}
      aria-busy={isLoading || undefined}
      onClick={handleClick}
      className={cn(
        buttonClasses({ variant, size, shape, fullWidth }),
        legacy &&
          `${legacy} font-medium hover:brightness-110 active:scale-[0.98] shadow-xs disabled:opacity-50`,
        !isNativeButton && isDisabled && "pointer-events-none cursor-not-allowed opacity-50",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
      ) : (
        leftIcon && (
          <span className="shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )
      )}
      {children}
      {!isLoading && rightIcon && (
        <span className="shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </Comp>
  );
}) as PolymorphicComponent<"button", ButtonOwnProps>;

Button.displayName = "Button";

export interface SubmitButtonProps extends ButtonProps {
  /** Label shown while pending. */
  pendingText?: string;
  /** Alias for isLoading. */
  isPending?: boolean;
}

/** A `type="submit"` Button with a pending state. */
export function SubmitButton({
  children,
  pendingText,
  isPending = false,
  isLoading,
  disabled,
  ...props
}: SubmitButtonProps) {
  const pending = isLoading ?? isPending;

  return (
    <Button type="submit" isLoading={pending} disabled={disabled || pending} {...props}>
      {pending && pendingText ? pendingText : children}
    </Button>
  );
}

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> {
  /** Accessible name (required; becomes aria-label). Also used as the native tooltip unless `title` is set or `showTitle` is false. */
  label: string;
  /** The icon to render. Decorative; hidden from assistive tech. */
  icon: ReactNode;
  /** Visual style, same set as Button. Default "ghost". */
  variant?: ButtonVariant;
  /** sm = 32px, md = 40px, lg = 44px (touch target). Default "md". */
  size?: IconButtonSize;
  /** "square" has rounded corners, "round" is a circle. Default "square". */
  shape?: "square" | "round";
  /** Shows a spinner, disables the button and sets aria-busy. */
  isLoading?: boolean;
  /** Set to false to suppress the native `title` tooltip. Default true. */
  showTitle?: boolean;
}

/** Icon-only button with a required accessible label. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      label,
      icon,
      variant = "ghost",
      size = "md",
      shape = "square",
      isLoading = false,
      showTitle = true,
      disabled,
      title,
      className,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={title ?? (showTitle ? label : undefined)}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={cn(iconButtonClasses({ variant, size, shape }), className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <span className="inline-flex items-center justify-center" aria-hidden="true">
            {icon}
          </span>
        )}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
