import {
  readLoginRateLimitStore,
  readValkeyUrl,
  resolveLoginRateLimitConfig
} from "./login-rate-limit-config.js";
import { createMemoryLoginRateLimiter } from "./login-rate-limit-memory.js";
import { createValkeyLoginRateLimiter } from "./login-rate-limit-valkey.js";
import type { LoginRateLimiter } from "./login-rate-limit.types.js";

export function createLoginRateLimiterFromEnv(): LoginRateLimiter {
  const config = resolveLoginRateLimitConfig();
  const store = readLoginRateLimitStore();

  if (store === "memory") {
    return createMemoryLoginRateLimiter(config);
  }

  return createValkeyLoginRateLimiter(config, {
    url: readValkeyUrl()
  });
}
