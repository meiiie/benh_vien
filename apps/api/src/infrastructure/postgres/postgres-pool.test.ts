import { afterEach, describe, expect, it } from "vitest";
import { createPostgresRepositoryPool } from "./postgres-pool.js";

const originalPoolMax = process.env.BVS_POSTGRES_REPOSITORY_POOL_MAX;
const originalNodeEnv = process.env.NODE_ENV;

describe("createPostgresRepositoryPool", () => {
  afterEach(() => {
    restoreEnv("BVS_POSTGRES_REPOSITORY_POOL_MAX", originalPoolMax);
    restoreEnv("NODE_ENV", originalNodeEnv);
  });

  it("uses a conservative default pool limit for each repository", async () => {
    delete process.env.BVS_POSTGRES_REPOSITORY_POOL_MAX;

    const pool = createPostgresRepositoryPool("postgresql://bvs:bvs@localhost:5432/bvs");

    try {
      expect(readPoolMax(pool)).toBe(2);
    } finally {
      await pool.end();
    }
  });

  it("rejects invalid pool limits before creating a pool", () => {
    process.env.BVS_POSTGRES_REPOSITORY_POOL_MAX = "0";

    expect(() =>
      createPostgresRepositoryPool("postgresql://bvs:bvs@localhost:5432/bvs")
    ).toThrow("BVS_POSTGRES_REPOSITORY_POOL_MAX must be a positive integer.");
  });

  it("rejects placeholder database credentials in production", () => {
    process.env.NODE_ENV = "production";

    expect(() =>
      createPostgresRepositoryPool(
        "postgresql://bvs:change-me-with-a-strong-password@postgres:5432/benh_vien_so"
      )
    ).toThrow("DATABASE_URL must not use placeholder credentials in production.");

    expect(() =>
      createPostgresRepositoryPool(
        "postgresql://bvs:bvs_dev_password@postgres:5432/benh_vien_so"
      )
    ).toThrow("DATABASE_URL must not use placeholder credentials in production.");

    expect(() =>
      createPostgresRepositoryPool(
        "postgresql://bvs:change%2Dme%2Dwith%2Da%2Dstrong%2Dpassword@postgres:5432/benh_vien_so"
      )
    ).toThrow("DATABASE_URL must not use placeholder credentials in production.");
  });
});

function readPoolMax(pool: unknown): number {
  return (pool as { readonly options: { readonly max: number } }).options.max;
}

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
