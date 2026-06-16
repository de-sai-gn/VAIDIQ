import { createTamagui } from "tamagui";
import { defaultConfig } from "@tamagui/config/v4";

/**
 * Tamagui configuration for the VaidIQ mobile app.
 *
 * Built on Tamagui's v4 default config (system fonts + the React Native animation
 * driver — no reanimated babel plugin required). VaidIQ brand tokens from
 * @vaidiq/ui (`tamagui*Tokens`, sourced from @vaidiq/config) are applied at the
 * component level so the design tokens stay the single source of truth across
 * web (Tailwind) and mobile (Tamagui).
 *
 * To enable the optimizing compiler later, uncomment @tamagui/babel-plugin in
 * babel.config.js — Tamagui runs without it, just less optimized.
 */
export const tamaguiConfig = createTamagui(defaultConfig);

export type TamaguiConf = typeof tamaguiConfig;

// NOTE: the `declare module "tamagui" { interface TamaguiCustomConfig extends
// TamaguiConf {} }` augmentation (which adds token autocomplete to style props)
// is intentionally omitted for now — under Tamagui 2.3 + React 19 types it makes
// raw number/hex style props fail to type-check. Re-enable it once you switch to
// token-based style props throughout (e.g. padding="$4", backgroundColor="$primary").

export default tamaguiConfig;
