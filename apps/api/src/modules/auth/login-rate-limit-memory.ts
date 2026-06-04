import type {
  LoginRateLimitConfig,
  LoginRateLimitDecision,
  LoginRateLimiter
} from "./login-rate-limit.types.js";

type MemoryLoginRateLimitEntry = {
  attempts: number;
  readonly resetAt: number;
};

export function createMemoryLoginRateLimiter(config: LoginRateLimitConfig): LoginRateLimiter {
  const entries = new Map<string, MemoryLoginRateLimitEntry>();

  return {
    async consume(key: string): Promise<LoginRateLimitDecision> {
      return consumeMemoryAttempt(entries, config, key);
    },
    async check() {
      return {
        status: "ok",
        store: "memory"
      };
    }
  };
}

function consumeMemoryAttempt(
  entries: Map<string, MemoryLoginRateLimitEntry>,
  config: LoginRateLimitConfig,
  key: string,
  now = Date.now()
): LoginRateLimitDecision {
  let entry = entries.get(key);

  if (!entry || entry.resetAt <= now) {
    entry = {
      attempts: 0,
      resetAt: now + config.windowMs
    };
    entries.set(key, entry);
  }

  entry.attempts += 1;

  if (entry.attempts > config.maxAttempts) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000))
    };
  }

  return {
    limited: false
  };
}
