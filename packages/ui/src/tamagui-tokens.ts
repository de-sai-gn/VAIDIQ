import { theme } from "@vaidiq/config";

/**
 * Framework-neutral token maps for Tamagui, derived from the same single source
 * of truth (@vaidiq/config) as the web Tailwind preset.
 *
 * Wired in apps/mobile once Tamagui is installed:
 *   import { createTokens } from "@tamagui/core";
 *   const tokens = createTokens({ color: tamaguiColorTokens, radius: tamaguiRadiusTokens, ... });
 *
 * Kept dependency-free here so the design-system base doesn't pull in
 * @tamagui/core until the app actually needs it ("prepare for setup").
 */
export const tamaguiColorTokens = { ...theme.colors };

export const tamaguiRadiusTokens = {
  card: theme.radius.card,
  button: theme.radius.button,
} as const;

export const tamaguiFontFamily = theme.typography.fontFamily;
