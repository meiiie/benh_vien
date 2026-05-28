import pg from "pg";

const { Pool } = pg;

const defaultRepositoryPoolMax = 2;
const productionCredentialPlaceholders = ["change-me", "dev_password"] as const;

export function createPostgresRepositoryPool(connectionString: string): pg.Pool {
  assertProductionConnectionString(connectionString);

  return new Pool({
    connectionString,
    max: readPoolMax()
  });
}

function assertProductionConnectionString(connectionString: string): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  if (hasPlaceholderCredential(connectionString)) {
    throw new Error("DATABASE_URL must not use placeholder credentials in production.");
  }
}

function hasPlaceholderCredential(connectionString: string): boolean {
  const valuesToInspect = [connectionString];

  try {
    const databaseUrl = new URL(connectionString);
    valuesToInspect.push(databaseUrl.username, safeDecodeURIComponent(databaseUrl.username));
    valuesToInspect.push(databaseUrl.password, safeDecodeURIComponent(databaseUrl.password));
  } catch {
    // Let pg surface the final URL parsing error; this guard only blocks known placeholders.
  }

  return valuesToInspect.some((value) => {
    const normalizedValue = value.toLowerCase();
    return productionCredentialPlaceholders.some((placeholder) =>
      normalizedValue.includes(placeholder)
    );
  });
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
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
