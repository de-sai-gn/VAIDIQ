import type { Config } from "tailwindcss";
import { theme } from "@vaidiq/config";

/**
 * Tailwind preset that projects the VaidIQ design tokens onto Tailwind's theme,
 * keeping @vaidiq/config the single source of truth.
 *
 * Web (Tailwind v4) consumes it through a JS config loaded via the `@config`
 * directive in globals.css: `presets: [vaidiqPreset]`. Tailwind maps these into
 * its theme namespaces, so tokens become utilities — e.g. `bg-primary`,
 * `text-sidebar`, `rounded-card`, `rounded-button`, `font-sans`.
 */
export const vaidiqPreset = {
  theme: {
    extend: {
      colors: { ...theme.colors },
      borderRadius: {
        card: `${theme.radius.card}px`,
        button: `${theme.radius.button}px`,
      },
      fontFamily: {
        sans: [theme.typography.fontFamily, "system-ui", "sans-serif"],
      },
    },
  },
} satisfies Partial<Config>;
