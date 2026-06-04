const defaultTokenTtlSeconds = 60 * 60 * 8;
const minTokenTtlSeconds = 60 * 5;
export const maxAuthTokenTtlSeconds = 60 * 60 * 8;

export function getAuthSecret(): string {
  const secret = process.env.BVS_AUTH_SECRET;

  if (secret && secret.length >= 32) {
    if (process.env.NODE_ENV === "production" && isPlaceholderSecret(secret)) {
      throw new Error("BVS_AUTH_SECRET must not use placeholder values in production.");
    }

    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("BVS_AUTH_SECRET must be set to at least 32 characters in production.");
  }

  return "wiiicare-dev-only-auth-secret-change-before-production";
}

export function assertAuthConfiguration(): void {
  getAuthSecret();
  getAuthTokenTtlSeconds();
}

export function getAuthTokenTtlSeconds(): number {
  const rawValue = process.env.BVS_AUTH_TOKEN_TTL_SECONDS;

  if (!rawValue?.trim()) {
    return defaultTokenTtlSeconds;
  }

  const parsed = Number(rawValue);

  if (
    !Number.isInteger(parsed) ||
    parsed < minTokenTtlSeconds ||
    parsed > maxAuthTokenTtlSeconds
  ) {
    throw new Error(
      `BVS_AUTH_TOKEN_TTL_SECONDS must be an integer between ${minTokenTtlSeconds} and ${maxAuthTokenTtlSeconds}.`
    );
  }

  return parsed;
}

function isPlaceholderSecret(secret: string): boolean {
  const normalizedSecret = secret.toLowerCase();

  return normalizedSecret.includes("change-me") || normalizedSecret.includes("dev-only");
}
