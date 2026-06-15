import type { Config } from "tailwindcss";
import { vaidiqPreset } from "@vaidiq/ui/tailwind-preset";

/**
 * Loaded by Tailwind v4 via the `@config` directive in src/app/globals.css.
 * The VaidIQ design tokens come in through `presets: [vaidiqPreset]`, which is
 * derived from @vaidiq/config — the single source of truth.
 */
const config: Config = {
  presets: [vaidiqPreset],
  content: [
    "./src/**/*.{ts,tsx,mdx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
};

export default config;
