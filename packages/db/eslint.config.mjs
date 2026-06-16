import { config } from "@vaidiq/eslint-config/base";

/** @type {import("eslint").Linter.Config[]} */
export default [
  // SQL migrations/tests + the embedded-postgres test runner are not app code.
  { ignores: ["supabase/**"] },
  ...config,
];
