import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run database migrations.");
}

const currentDir = dirname(fileURLToPath(import.meta.url));
const migrationsDir = resolve(currentDir, "../../../migrations");
const client = new Client({ connectionString });

await client.connect();

try {
  await client.query("BEGIN");
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await client.query("COMMIT");

  const migrationFiles = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of migrationFiles) {
    const version = file.replace(/\.sql$/, "");
    const existed = await client.query(
      "SELECT 1 FROM schema_migrations WHERE version = $1",
      [version]
    );

    if (existed.rowCount && existed.rowCount > 0) {
      console.log(`skip ${version}`);
      continue;
    }

    const sql = await readFile(join(migrationsDir, file), "utf8");

    await client.query("BEGIN");
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations(version) VALUES ($1)", [
      version
    ]);
    await client.query("COMMIT");

    console.log(`applied ${version}`);
  }
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  throw error;
} finally {
  await client.end();
}

