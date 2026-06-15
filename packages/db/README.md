# @vaidiq/db

The VaidIQ data layer: typed schema, environment-specific Supabase clients, and SQL migrations.

## Entry points (subpath exports)

Platform clients are split so a bundler never pulls the other platform's native deps:

| Import | Use in | Notes |
| --- | --- | --- |
| `@vaidiq/db/server` | Next.js App Router (Server Components, Server Actions, Route Handlers) | `createDbServerClient()` — **async** (Next 15 `cookies()`); cookie-bound per request. |
| `@vaidiq/db/mobile` | Expo / React Native | `supabaseMobile` — sessions encrypted in Keychain/Keystore via a chunking SecureStore adapter. |
| `@vaidiq/db` or `@vaidiq/db/types` | anywhere | `Database`, `UserRole`, row aliases. |

## Environment variables

| Runtime | Variables |
| --- | --- |
| Web (Next.js) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Mobile (Expo) | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` |

Both are read via `requireEnv()` from `@vaidiq/config`, which fails fast with an
actionable message if missing. Key names live in `@vaidiq/config` (`ENV_KEYS`).

## Database workflow (requires the Supabase CLI on PATH)

```bash
# from packages/db
pnpm --filter @vaidiq/db db:start     # boot local stack (Docker)
pnpm --filter @vaidiq/db db:reset     # apply supabase/migrations/* to a fresh db
pnpm --filter @vaidiq/db gen:types    # regenerate src/types.ts from the live schema
```

## RLS verification

`supabase/tests/rls_isolation.test.sql` is a self-asserting tenant-isolation
suite (recursion-safety, `WITH CHECK`, anti-escalation, anon lockout). Run it
against an **ephemeral** Postgres only — it stubs/overrides Supabase auth objects.
