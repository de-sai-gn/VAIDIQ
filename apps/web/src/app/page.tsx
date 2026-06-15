import { APP_NAME, theme, USER_ROLES } from "@vaidiq/config";
import type { UserRole } from "@vaidiq/db";

// Token-driven utilities (bg-surface, bg-primary, rounded-card, text-sidebar, …)
// come from the @vaidiq/ui Tailwind preset, which reads @vaidiq/config — proving
// the shared design tokens flow end-to-end into the web app.
export default function Home() {
  const roles: readonly UserRole[] = USER_ROLES;

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-8 font-sans">
      <div className="w-full max-w-md rounded-card border border-border bg-white p-8 shadow-sm">
        <span className="inline-block rounded-button bg-primary px-3 py-1 text-sm font-medium text-white">
          {APP_NAME}
        </span>
        <h1 className="mt-4 text-2xl font-semibold text-sidebar">
          Monorepo foundation is live
        </h1>
        <p className="mt-2 text-muted">
          Shared design tokens, UI preset, and the typed Supabase layer are wired
          across web &amp; mobile.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {roles.map((role) => (
            <li
              key={role}
              className="rounded-button border border-border px-2 py-1 text-xs text-muted"
            >
              {role}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-muted">
          primary token →{" "}
          <code className="font-mono text-success">{theme.colors.primary}</code>
        </p>
      </div>
    </main>
  );
}
