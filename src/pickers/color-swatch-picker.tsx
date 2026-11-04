"use client";

import { useId, useRef, type ReactNode } from "react";
import { Check, Plus } from "lucide-react";
import { cn } from "../utils/cn";
import { useControllable } from "../utils/use-controllable";
import { useRoving } from "./roving";

export interface ColorSwatch {
  /** Any CSS colour. */
  value: string;
  /** Accessible name, e.g. "Ocean blue". Defaults to the value. */
  label?: string;
}

export type SwatchSize = "sm" | "md";

export interface ColorSwatchPickerProps {
  /** Colours to offer, as strings or `{ value, label }`. */
  swatches: (string | ColorSwatch)[];
  /** Controlled selected colour (`null` = none). */
  value?: string | null;
  /** Initial colour when uncontrolled. */
  defaultValue?: string | null;
  /** Called with the new colour. */
  onChange?: (value: string) => void;
  /** Adds a custom-colour swatch backed by a native colour input. */
  allowCustom?: boolean;
  /** Accessible name of the custom swatch. Default "Custom colour". */
  customLabel?: string;
  /** Group label; visually hidden with `hideLabel`. */
  label?: ReactNode;
  /** Keep `label` for screen readers only. */
  hideLabel?: boolean;
  /** Accessible name when there is no `label`. */
  "aria-label"?: string;
  /** Swatch size. Default `md`. */
  size?: SwatchSize;
  /** Disables the picker. */
  disabled?: boolean;
  className?: string;
}

const sizeClasses: Record<SwatchSize, string> = { sm: "h-6 w-6", md: "h-8 w-8" };
const HEX6 = /^#[0-9a-f]{6}$/i;
const CONIC =
  "conic-gradient(from 0deg, #f44336, #ffeb3b, #4caf50, #00bcd4, #3f51b5, #e91e63, #f44336)";
const ICON_ON_COLOR = "h-3.5 w-3.5 text-white drop-shadow-[0_0_1px_rgb(0_0_0/0.9)]";

const norm = (c: string | null | undefined) => (c ?? "").trim().toLowerCase();

/** Radiogroup of colour swatches with an optional custom colour. */
export function ColorSwatchPicker({
  swatches,
  value,
  defaultValue = null,
  onChange,
  allowCustom = false,
  customLabel = "Custom colour",
  label,
  hideLabel = false,
  "aria-label": ariaLabel,
  size = "md",
  disabled = false,
  className,
}: ColorSwatchPickerProps) {
  const labelId = `${useId()}-label`;
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useControllable<string | null>(
    value,
    defaultValue,
    onChange as ((v: string | null) => void) | undefined
  );
  const items: ColorSwatch[] = swatches.map((s) => (typeof s === "string" ? { value: s } : s));
  const presetIndex = selected ? items.findIndex((s) => norm(s.value) === norm(selected)) : -1;
  const customColor = selected && presetIndex === -1 ? selected : null;
  const count = items.length + (allowCustom ? 1 : 0);
  const selectedIndex =
    presetIndex !== -1 ? presetIndex : customColor && allowCustom ? items.length : -1;

  const openCustom = () => {
    const input = colorInputRef.current;
    if (!input) return;
    try {
      input.showPicker();
    } catch {
      input.click();
    }
  };

  const { getItemProps } = useRoving({
    count,
    isDisabled: () => disabled,
    selectedIndex,
    onMove: (index) => {
      if (index < items.length) setSelected(items[index].value);
      else if (customColor) setSelected(customColor);
    },
  });

  const swatchClass = (isSelected: boolean) =>
    cn(
      "relative inline-flex shrink-0 items-center justify-center rounded-full border border-border transition-transform motion-reduce:transition-none",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
      "disabled:cursor-not-allowed disabled:opacity-50",
      !disabled && "cursor-pointer hover:scale-110 motion-reduce:hover:scale-100",
      isSelected && "outline-2 outline-offset-2 outline-fg",
      sizeClasses[size]
    );

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <span id={labelId} className={hideLabel ? "sr-only" : "text-xs font-semibold text-fg"}>
          {label}
        </span>
      )}
      <div
        role="radiogroup"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        aria-disabled={disabled || undefined}
        className="flex flex-wrap items-center gap-2.5 p-1"
      >
        {items.map((swatch, index) => {
          const isSelected = index === presetIndex;
          return (
            <button
              key={`${swatch.value}-${index}`}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={swatch.label ?? swatch.value}
              title={swatch.label ?? swatch.value}
              disabled={disabled}
              onClick={() => setSelected(swatch.value)}
              className={swatchClass(isSelected)}
              style={{ backgroundColor: swatch.value }}
              {...getItemProps(index)}
            >
              {isSelected && <Check aria-hidden="true" strokeWidth={3} className={ICON_ON_COLOR} />}
            </button>
          );
        })}
        {allowCustom && (
          <span className="relative inline-flex">
            <button
              type="button"
              role="radio"
              aria-checked={!!customColor}
              aria-label={customColor ? `${customLabel}: ${customColor}` : customLabel}
              title={customLabel}
              disabled={disabled}
              onClick={openCustom}
              className={swatchClass(!!customColor)}
              style={{ background: CONIC }}
              {...getItemProps(items.length)}
            >
              {customColor ? (
                <span
                  aria-hidden="true"
                  className="h-1/2 w-1/2 rounded-full border-2 border-white"
                  style={{ backgroundColor: customColor }}
                />
              ) : (
                <Plus aria-hidden="true" strokeWidth={3} className={ICON_ON_COLOR} />
              )}
            </button>
            <input
              ref={colorInputRef}
              type="color"
              tabIndex={-1}
              aria-hidden="true"
              disabled={disabled}
              value={customColor && HEX6.test(customColor) ? customColor : "#000000"}
              onChange={(event) => setSelected(event.target.value)}
              className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
            />
          </span>
        )}
      </div>
    </div>
  );
}
