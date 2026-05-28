import { afterEach, describe, expect, it } from "vitest";
import { createPostgresRepositoryPool } from "./postgres-pool.js";

const originalPoolMax = process.env.BVS_POSTGRES_REPOSITORY_POOL_MAX;

describe("createPostgresRepositoryPool", () => {
  afterEach(() => {
    if (originalPoolMax === undefined) {
      delete process.env.BVS_POSTGRES_REPOSITORY_POOL_MAX;
      return;
    }

    process.env.BVS_POSTGRES_REPOSITORY_POOL_MAX = originalPoolMax;
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
});

function readPoolMax(pool: unknown): number {
  return (pool as { readonly options: { readonly max: number } }).options.max;
}
