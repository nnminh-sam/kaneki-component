import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftAddon,
      rightAddon,
      id,
      className = "",
      wrapperClassName = "",
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`space-y-1.5 ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold text-fg"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftAddon && (
            <div className="pointer-events-none absolute left-3 flex items-center text-muted">
              {leftAddon}
            </div>
          )}

          <input
            id={id}
            ref={ref}
            disabled={disabled}
            className={`w-full rounded-lg border bg-surface-subtle px-3 py-2 text-sm text-fg placeholder:text-muted transition-colors focus:border-accent focus:bg-surface focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
              error ? "border-danger focus:border-danger" : "border-border"
            } ${leftAddon ? "pl-9" : ""} ${rightAddon ? "pr-9" : ""} ${className}`}
            {...props}
          />

          {rightAddon && (
            <div className="absolute right-3 flex items-center text-muted">
              {rightAddon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-danger">{error}</p>
        ) : (
          helperText && <p className="text-xs text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      id,
      className = "",
      wrapperClassName = "",
      disabled,
      rows = 3,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`space-y-1.5 ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold text-fg"
          >
            {label}
          </label>
        )}

        <textarea
          id={id}
          ref={ref}
          rows={rows}
          disabled={disabled}
          className={`w-full rounded-lg border bg-surface-subtle px-3 py-2 text-sm text-fg placeholder:text-muted transition-colors focus:border-accent focus:bg-surface focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? "border-danger focus:border-danger" : "border-border"
          } ${className}`}
          {...props}
        />

        {error ? (
          <p className="text-xs text-danger">{error}</p>
        ) : (
          helperText && <p className="text-xs text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      id,
      className = "",
      wrapperClassName = "",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`space-y-1.5 ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold text-fg"
          >
            {label}
          </label>
        )}

        <select
          id={id}
          ref={ref}
          disabled={disabled}
          className={`w-full rounded-lg border bg-surface-subtle px-3 py-2 text-sm text-fg transition-colors focus:border-accent focus:bg-surface focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? "border-danger focus:border-danger" : "border-border"
          } ${className}`}
          {...props}
        >
          {children}
        </select>

        {error ? (
          <p className="text-xs text-danger">{error}</p>
        ) : (
          helperText && <p className="text-xs text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
