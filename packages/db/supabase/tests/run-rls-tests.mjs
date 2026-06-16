// Boots an ephemeral PostgreSQL (via embedded-postgres — no Docker required),
// applies the local Supabase stub -> migration -> RLS isolation harness, and
// asserts the pass marker. Run with: pnpm --filter @vaidiq/db test:rls
//
// Exit 0 = all tenant-isolation invariants held; exit 1 = a failure (or setup error).
import EmbeddedPostgres from "embedded-postgres";
import pg from "pg";
import { readFileSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const sql = (p) => readFileSync(p, "utf8");
const stub = sql(join(here, "_local_supabase_stub.sql"));
const migration = sql(join(here, "..", "migrations", "00001_init.sql"));
const harness = sql(join(here, "rls_isolation.test.sql"));

const dataDir = mkdtempSync(join(tmpdir(), "vaidiq-rls-"));
const port = 50000 + Math.floor(Math.random() * 5000);

const epg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "postgres",
  password: "postgres",
  port,
  persistent: false,
});

let failed = false;
const notices = [];

await epg.initialise();
await epg.start();

const client = new pg.Client({
  host: "localhost",
  port,
  user: "postgres",
  password: "postgres",
  database: "postgres",
});
client.on("notice", (n) => notices.push(n.message));
await client.connect();

try {
  console.log(`▸ PostgreSQL ${(await client.query("show server_version")).rows[0].server_version} (ephemeral, port ${port})`);
  console.log("▸ applying local Supabase stub …");
  await client.query(stub);
  console.log("▸ applying migration 00001_init.sql …");
  await client.query(migration);
  console.log("▸ running RLS isolation harness …");
  await client.query(harness);

  if (notices.some((m) => m.includes("ALL RLS ISOLATION TESTS PASSED"))) {
    console.log("\n✓ ALL RLS ISOLATION TESTS PASSED");
  } else {
    failed = true;
    console.error("\n✗ pass marker not emitted. Notices:", notices);
  }
} catch (err) {
  failed = true;
  console.error("\n✗ RLS TEST FAILED");
  console.error("  message :", err.message);
  if (err.code) console.error("  sqlstate:", err.code);
  if (err.where) console.error("  where   :", err.where);
} finally {
  await client.end();
  await epg.stop();
  rmSync(dataDir, { recursive: true, force: true });
}

process.exit(failed ? 1 : 0);
