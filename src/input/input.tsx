"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useRef,
  type ForwardedRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "../utils/cn";

/* ------------------------------------------------------------------ */
/* Shared                                                              */
/* ------------------------------------------------------------------ */

export type FieldSize = "sm" | "md" | "lg";

const controlBase =
  "w-full rounded-lg border bg-surface-subtle text-fg placeholder:text-muted transition-colors focus:border-accent focus:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none";

const controlSizeClasses: Record<FieldSize, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-3 text-lg font-medium",
};

const textSizeClasses: Record<FieldSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-lg font-medium",
};

const stateClasses = (hasError: boolean) =>
  hasError
    ? "border-danger focus:border-danger focus-visible:ring-danger/30"
    : "border-border";

/** ARIA props a Field hands to its control. */
export interface FieldControlProps {
  id: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  "aria-required"?: true;
}

interface FieldIds {
  controlId: string;
  labelId: string;
  helperId: string;
  errorId: string;
  describedBy: string | undefined;
}

function joinIds(...ids: Array<string | false | null | undefined>): string | undefined {
  const joined = ids.filter(Boolean).join(" ");
  return joined || undefined;
}

function useFieldIds(
  id: string | undefined,
  helperText: ReactNode,
  error: ReactNode,
  externalDescribedBy?: string
): FieldIds {
  const generated = useId();
  const controlId = id ?? generated;
  const helperId = `${controlId}-help`;
  const errorId = `${controlId}-error`;
  const hasError = isPresent(error);
  return {
    controlId,
    labelId: `${controlId}-label`,
    helperId,
    errorId,
    describedBy: joinIds(
      externalDescribedBy,
      hasError ? errorId : isPresent(helperText) && helperId
    ),
  };
}

function isPresent(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false && node !== "";
}

function setRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Shows a decorative required marker. (Set `required` on the control itself for semantics.) */
  required?: boolean;
}

/** Form label. */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, className, children, ...props }, ref) => (
    <label ref={ref} className={cn("block text-xs font-semibold text-fg", className)} {...props}>
      {children}
      {required && (
        <span aria-hidden="true" className="ml-0.5 text-danger">
          *
        </span>
      )}
    </label>
  )
);
Label.displayName = "Label";

export interface HelperTextProps extends HTMLAttributes<HTMLParagraphElement> {
  /** Error styling plus role="alert" so the message is announced. */
  error?: boolean;
}

/** Help or error text under a control. Give it an id and reference it from aria-describedby. */
export const HelperText = forwardRef<HTMLParagraphElement, HelperTextProps>(
  ({ error = false, className, role, ...props }, ref) => (
    <p
      ref={ref}
      role={role ?? (error ? "alert" : undefined)}
      className={cn("text-xs", error ? "text-danger" : "text-muted", className)}
      {...props}
    />
  )
);
HelperText.displayName = "HelperText";

function FieldMessages({
  ids,
  helperText,
  error,
}: {
  ids: FieldIds;
  helperText: ReactNode;
  error: ReactNode;
}) {
  if (isPresent(error)) {
    return (
      <HelperText id={ids.errorId} error>
        {error}
      </HelperText>
    );
  }
  if (isPresent(helperText)) return <HelperText id={ids.helperId}>{helperText}</HelperText>;
  return null;
}

/* ------------------------------------------------------------------ */
/* Field (custom controls)                                             */
/* ------------------------------------------------------------------ */

const FieldContext = createContext<FieldControlProps | null>(null);

/** Inside a `<Field>`, returns the ARIA props for the control; otherwise null. */
export function useFieldControl(): FieldControlProps | null {
  return useContext(FieldContext);
}

export interface FieldProps {
  /** Visible label. Linked with htmlFor and exposed as aria-labelledby for non-labelable controls. */
  label?: ReactNode;
  /** Help text; wired to aria-describedby. Hidden while `error` is set. */
  helperText?: ReactNode;
  /** Error message; sets aria-invalid, is wired to aria-describedby and announced (role="alert"). */
  error?: ReactNode;
  /** Control id. Generated with useId when omitted. */
  id?: string;
  /** Marks the control aria-required and shows a required marker on the label. */
  required?: boolean;
  /**
   * The control. Pass a function to receive the ARIA props to spread onto it,
   * or plain children that call `useFieldControl()`.
   */
  children: ReactNode | ((controlProps: FieldControlProps) => ReactNode);
  /** Classes for the wrapper. */
  className?: string;
  /** Classes for the label. */
  labelClassName?: string;
}

/** Label + control slot + help / error, with the same ARIA wiring as Input, for custom controls. */
export function Field({
  label,
  helperText,
  error,
  id,
  required,
  children,
  className,
  labelClassName,
}: FieldProps) {
  const ids = useFieldIds(id, helperText, error);
  const controlProps: FieldControlProps = {
    id: ids.controlId,
    "aria-labelledby": label ? ids.labelId : undefined,
    "aria-describedby": ids.describedBy,
    "aria-invalid": isPresent(error) ? true : undefined,
    "aria-required": required ? true : undefined,
  };

  return (
    <FieldContext.Provider value={controlProps}>
      <div className={cn("space-y-1.5", className)}>
        {label && (
          <Label id={ids.labelId} htmlFor={ids.controlId} required={required} className={labelClassName}>
            {label}
          </Label>
        )}
        {typeof children === "function" ? children(controlProps) : children}
        <FieldMessages ids={ids} helperText={helperText} error={error} />
      </div>
    </FieldContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Input                                                               */
/* ------------------------------------------------------------------ */

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Visible label, linked to the input. */
  label?: ReactNode;
  /** Help text; wired to aria-describedby. Hidden while `error` is set. */
  helperText?: ReactNode;
  /** Error message; sets aria-invalid, is wired to aria-describedby and announced. */
  error?: ReactNode;
  /** Content before the input (icon, currency symbol). Clicking it focuses the input. */
  leftAddon?: ReactNode;
  /** Content after the input. May contain interactive elements such as buttons. */
  rightAddon?: ReactNode;
  /** Classes for the outer wrapper (label + control + messages). */
  wrapperClassName?: string;
  /** Classes for the bordered box that holds the addons and the input (only rendered with addons). */
  groupClassName?: string;
  /** Control size; "lg" uses larger text, e.g. for amount entry. Default "md". */
  inputSize?: FieldSize;
}

const addonPad: Record<FieldSize, { left: string; right: string }> = {
  sm: { left: "pl-2.5", right: "pr-1.5" },
  md: { left: "pl-3", right: "pr-2" },
  lg: { left: "pl-4", right: "pr-2.5" },
};

const INTERACTIVE = "input,button,a,select,textarea,label,[role='button'],[tabindex]";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftAddon,
      rightAddon,
      id,
      className,
      wrapperClassName,
      groupClassName,
      inputSize = "md",
      disabled,
      required,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const ids = useFieldIds(id, helperText, error, ariaDescribedBy);
    const hasError = isPresent(error);
    const innerRef = useRef<HTMLInputElement | null>(null);
    const mergedRef = useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node;
        setRef(ref, node);
      },
      [ref]
    );

    const a11y = {
      id: ids.controlId,
      "aria-describedby": ids.describedBy,
      "aria-invalid": hasError ? true : undefined,
    } as const;

    const hasAddons = Boolean(leftAddon || rightAddon);

    const focusFromGroup = (e: ReactMouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (disabled || target.closest(INTERACTIVE)) return;
      e.preventDefault();
      innerRef.current?.focus();
    };

    return (
      <div className={cn("space-y-1.5", wrapperClassName)}>
        {label && (
          <Label htmlFor={ids.controlId} required={required}>
            {label}
          </Label>
        )}

        {hasAddons ? (
          <div
            onMouseDown={focusFromGroup}
            className={cn(
              "flex w-full items-center rounded-lg border bg-surface-subtle text-fg transition-colors focus-within:border-accent focus-within:bg-surface focus-within:ring-2 focus-within:ring-accent/30 motion-reduce:transition-none",
              hasError ? "border-danger focus-within:border-danger focus-within:ring-danger/30" : "border-border",
              disabled && "cursor-not-allowed opacity-50",
              textSizeClasses[inputSize],
              groupClassName
            )}
          >
            {leftAddon && (
              <span className={cn("flex shrink-0 items-center text-muted", addonPad[inputSize].left)}>
                {leftAddon}
              </span>
            )}
            <input
              ref={mergedRef}
              disabled={disabled}
              required={required}
              className={cn(
                "min-w-0 flex-1 border-0 bg-transparent text-fg placeholder:text-muted focus:outline-none disabled:cursor-not-allowed",
                controlSizeClasses[inputSize],
                leftAddon && "pl-2",
                rightAddon && "pr-2",
                className
              )}
              {...a11y}
              {...props}
            />
            {rightAddon && (
              <span
                className={cn(
                  "flex shrink-0 items-center gap-1 text-muted",
                  addonPad[inputSize].right
                )}
              >
                {rightAddon}
              </span>
            )}
          </div>
        ) : (
          <input
            ref={mergedRef}
            disabled={disabled}
            required={required}
            className={cn(controlBase, stateClasses(hasError), controlSizeClasses[inputSize], className)}
            {...a11y}
            {...props}
          />
        )}

        <FieldMessages ids={ids} helperText={helperText} error={error} />
      </div>
    );
  }
);
Input.displayName = "Input";

/* ------------------------------------------------------------------ */
/* Textarea                                                            */
/* ------------------------------------------------------------------ */

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visible label, linked to the textarea. */
  label?: ReactNode;
  /** Help text; wired to aria-describedby. Hidden while `error` is set. */
  helperText?: ReactNode;
  /** Error message; sets aria-invalid, is wired to aria-describedby and announced. */
  error?: ReactNode;
  /** Classes for the outer wrapper. */
  wrapperClassName?: string;
  /** Control size. Default "md". */
  inputSize?: FieldSize;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      id,
      className,
      wrapperClassName,
      inputSize = "md",
      disabled,
      required,
      rows = 3,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const ids = useFieldIds(id, helperText, error, ariaDescribedBy);
    const hasError = isPresent(error);

    return (
      <div className={cn("space-y-1.5", wrapperClassName)}>
        {label && (
          <Label htmlFor={ids.controlId} required={required}>
            {label}
          </Label>
        )}

        <textarea
          ref={ref}
          id={ids.controlId}
          rows={rows}
          disabled={disabled}
          required={required}
          aria-describedby={ids.describedBy}
          aria-invalid={hasError ? true : undefined}
          className={cn(controlBase, stateClasses(hasError), controlSizeClasses[inputSize], className)}
          {...props}
        />

        <FieldMessages ids={ids} helperText={helperText} error={error} />
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

/* ------------------------------------------------------------------ */
/* Select                                                              */
/* ------------------------------------------------------------------ */

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Visible label, linked to the select. */
  label?: ReactNode;
  /** Help text; wired to aria-describedby. Hidden while `error` is set. */
  helperText?: ReactNode;
  /** Error message; sets aria-invalid, is wired to aria-describedby and announced. */
  error?: ReactNode;
  /** Classes for the outer wrapper. */
  wrapperClassName?: string;
  /** Control size. Default "md". */
  inputSize?: FieldSize;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      id,
      className,
      wrapperClassName,
      inputSize = "md",
      disabled,
      required,
      children,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const ids = useFieldIds(id, helperText, error, ariaDescribedBy);
    const hasError = isPresent(error);

    return (
      <div className={cn("space-y-1.5", wrapperClassName)}>
        {label && (
          <Label htmlFor={ids.controlId} required={required}>
            {label}
          </Label>
        )}

        <select
          ref={ref}
          id={ids.controlId}
          disabled={disabled}
          required={required}
          aria-describedby={ids.describedBy}
          aria-invalid={hasError ? true : undefined}
          className={cn(controlBase, stateClasses(hasError), controlSizeClasses[inputSize], className)}
          {...props}
        >
          {children}
        </select>

        <FieldMessages ids={ids} helperText={helperText} error={error} />
      </div>
    );
  }
);
Select.displayName = "Select";
