export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

export interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
  /** Themes `cycleTheme` steps through, in order (excludes "system" when `enableSystem` is false). */
  themes?: readonly Theme[];
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystem?: boolean;
  attribute?: string;
  onThemeChange?: (theme: Theme) => void;
}

export interface ThemeScriptProps {
  storageKey?: string;
  defaultTheme?: Theme;
  attribute?: string;
  nonce?: string;
}
