import type {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementType,
  HTMLAttributes,
  ReactElement,
} from "react";

/**
 * Props for a component that renders as `E` (via `as`), merging the component's
 * own props `P` with the props of `E` (own props win).
 *
 * @example <NavItem as={Link} href="/settings">Settings</NavItem>
 */
export type PolymorphicProps<E extends ElementType, P = object> = P & {
  /** Element or component to render, e.g. `"a"`, `"button"` or Next.js `Link`. */
  as?: E;
} & Omit<ComponentPropsWithoutRef<E>, keyof P | "as">;

/** Polymorphic props plus a `ref` typed for the rendered element. */
export type PolymorphicPropsWithRef<
  E extends ElementType,
  P = object,
> = PolymorphicProps<E, P> & { ref?: ComponentPropsWithRef<E>["ref"] };

/** Call signature of a forwardRef polymorphic component. */
export type PolymorphicComponent<
  DefaultE extends ElementType,
  P = object,
> = (<E extends ElementType = DefaultE>(
  props: PolymorphicPropsWithRef<E, P>
) => ReactElement | null) & { displayName?: string };

/** Loose props type used inside polymorphic implementations (internal). */
export type PolymorphicImplProps<P> = P & {
  as?: ElementType;
} & Omit<HTMLAttributes<HTMLElement>, keyof P>;
