/**
 * VaidIQ Design Language — the single source of truth for design tokens.
 *
 * Consumed by:
 *  - Web  (Tailwind) via `@vaidiq/ui/tailwind-preset`
 *  - Mobile (Tamagui) via `@vaidiq/ui/tamagui-tokens`
 *
 * Treat this object as immutable. Never hardcode a hex/radius in an app —
 * import it from here so web and mobile stay perfectly in sync.
 */
export const theme = {
  colors: {
    primary: "#1D9E75",
    sidebar: "#042F26",
    surface: "#F6FAF8",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    white: "#FFFFFF",
    black: "#000000",
    border: "#E5E7EB",
    muted: "#6B7280",
  },
  radius: {
    card: 12,
    button: 8,
  },
  typography: {
    fontFamily: "Inter",
  },
} as const;

export type Theme = typeof theme;
export type ThemeColors = Theme["colors"];
export type ThemeColorToken = keyof ThemeColors;
export type ThemeRadiusToken = keyof Theme["radius"];
