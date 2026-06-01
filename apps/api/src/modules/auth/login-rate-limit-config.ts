import type { LoginRateLimitConfig } from "./login-rate-limit.types.js";

const DEFAULT_LOGIN_RATE_LIMIT_MAX = 20;
const DEFAULT_LOGIN_RATE_LIMIT_WINDOW_SECONDS = 60;
const DEFAULT_VALKEY_URL = "redis://valkey:6379";

export const loginRateLimitKeyPrefix = "wiiicare:nexus:auth:login-rate-limit";

export function resolveLoginRateLimitConfig(): LoginRateLimitConfig {
  return {
    maxAttempts: readPositiveIntegerEnv(
      "BVS_AUTH_LOGIN_RATE_LIMIT_MAX",
      DEFAULT_LOGIN_RATE_LIMIT_MAX
    ),
    windowMs:
      readPositiveIntegerEnv(
        "BVS_AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS",
        DEFAULT_LOGIN_RATE_LIMIT_WINDOW_SECONDS
      ) * 1000
  };
}

export function readLoginRateLimitStore(): "memory" | "valkey" {
  const rawValue = process.env.BVS_RATE_LIMIT_STORE?.trim().toLowerCase();

  if (!rawValue) {
    return process.env.NODE_ENV === "production" ? "valkey" : "memory";
  }

  if (process.env.NODE_ENV === "production" && rawValue === "memory") {
    throw new Error("BVS_RATE_LIMIT_STORE must be 'valkey' in production.");
  }

  if (rawValue === "memory" || rawValue === "valkey") {
    return rawValue;
  }

  throw new Error("BVS_RATE_LIMIT_STORE must be either 'memory' or 'valkey'.");
}

export function readValkeyUrl(): string {
  const rawValue = process.env.BVS_VALKEY_URL?.trim();

  if (rawValue) {
    return rawValue;
  }

  if (process.env.NODE_ENV === "production") {
    return DEFAULT_VALKEY_URL;
  }

  throw new Error("BVS_VALKEY_URL must be set when BVS_RATE_LIMIT_STORE=valkey.");
}

function readPositiveIntegerEnv(name: string, fallback: number): number {
  const rawValue = process.env[name];

  if (!rawValue?.trim()) {
    return fallback;
  }

  const parsed = Number(rawValue);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return parsed;
}
