import pg from "pg";

const { Pool } = pg;

const defaultRepositoryPoolMax = 2;

export function createPostgresRepositoryPool(connectionString: string): pg.Pool {
  return new Pool({
    connectionString,
    max: readPoolMax()
  });
}

function readPoolMax(): number {
  const rawValue = process.env.BVS_POSTGRES_REPOSITORY_POOL_MAX;

  if (!rawValue) {
    return defaultRepositoryPoolMax;
  }

  const poolMax = Number(rawValue);

  if (!Number.isInteger(poolMax) || poolMax < 1) {
    throw new Error("BVS_POSTGRES_REPOSITORY_POOL_MAX must be a positive integer.");
  }

  return poolMax;
}
