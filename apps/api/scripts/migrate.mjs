import { createHash } from "node:crypto";
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
      checksum_sha256 text,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await client.query(`
    ALTER TABLE schema_migrations
    ADD COLUMN IF NOT EXISTS checksum_sha256 text
  `);
  await client.query("COMMIT");

  const migrationFiles = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of migrationFiles) {
    const version = file.replace(/\.sql$/, "");
    const sql = await readFile(join(migrationsDir, file), "utf8");
    const checksum = createSha256Checksum(sql);
    const existed = await client.query(
      "SELECT checksum_sha256 FROM schema_migrations WHERE version = $1",
      [version]
    );

    if (existed.rowCount && existed.rowCount > 0) {
      const appliedChecksum = existed.rows[0].checksum_sha256;

      if (appliedChecksum && appliedChecksum !== checksum) {
        throw new Error(
          `Migration checksum mismatch for ${version}. Expected ${appliedChecksum}, current file is ${checksum}.`
        );
      }

      if (!appliedChecksum) {
        await client.query(
          "UPDATE schema_migrations SET checksum_sha256 = $2 WHERE version = $1",
          [version, checksum]
        );
        console.log(`recorded checksum ${version}`);
      }

      console.log(`skip ${version}`);
      continue;
    }

    await client.query("BEGIN");
    await client.query(sql);
    await client.query(
      "INSERT INTO schema_migrations(version, checksum_sha256) VALUES ($1, $2)",
      [version, checksum]
    );
    await client.query("COMMIT");

    console.log(`applied ${version}`);
  }
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  throw error;
} finally {
  await client.end();
}

function createSha256Checksum(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}
