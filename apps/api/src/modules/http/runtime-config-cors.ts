import { isLocalOnlyHostname } from "../network/local-only-hostname.js";

export function resolveCorsOrigins(): boolean | string[] {
  const configuredOrigins = process.env.BVS_CORS_ORIGINS;

  if (configuredOrigins) {
    const origins = configuredOrigins
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);

    if (origins.length > 0) {
      if (process.env.NODE_ENV === "production") {
        assertProductionCorsOrigins(origins);
      }

      return origins;
    }
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("BVS_CORS_ORIGINS must be set in production.");
  }

  return true;
}

function assertProductionCorsOrigins(origins: readonly string[]): void {
  for (const origin of origins) {
    if (origin === "*") {
      throw new Error("BVS_CORS_ORIGINS must not include wildcard '*' in production.");
    }

    let parsedOrigin: URL;

    try {
      parsedOrigin = new URL(origin);
    } catch {
      throw new Error("BVS_CORS_ORIGINS must contain valid URL origins in production.");
    }

    if (parsedOrigin.origin !== origin || parsedOrigin.protocol !== "https:") {
      throw new Error(
        "BVS_CORS_ORIGINS must contain canonical HTTPS origins in production."
      );
    }

    if (isLocalOnlyHostname(parsedOrigin.hostname)) {
      throw new Error(
        "BVS_CORS_ORIGINS must not contain localhost, loopback, private or link-local origins in production."
      );
    }
  }
}
