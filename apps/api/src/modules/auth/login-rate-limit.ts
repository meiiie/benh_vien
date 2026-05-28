import { createHash } from "node:crypto";
import { createClient } from "redis";

export type LoginRateLimitDecision =
  | {
      readonly limited: false;
    }
  | {
      readonly limited: true;
      readonly retryAfterSeconds: number;
    };

export type LoginRateLimiter = {
  consume(key: string): Promise<LoginRateLimitDecision>;
  close?(): Promise<void>;
};

export type LoginRateLimitConfig = {
  readonly maxAttempts: number;
  readonly windowMs: number;
};

export type ValkeyLoginRateLimitClient = {
  readonly isOpen?: boolean;
  on?(event: "error", listener: (error: unknown) => void): unknown;
  connect(): Promise<unknown>;
  eval(
    script: string,
    options: {
      readonly keys: readonly string[];
      readonly arguments: readonly string[];
    }
  ): Promise<unknown>;
  quit?(): Promise<unknown>;
  disconnect?(): Promise<void>;
};

const DEFAULT_LOGIN_RATE_LIMIT_MAX = 20;
const DEFAULT_LOGIN_RATE_LIMIT_WINDOW_SECONDS = 60;
const DEFAULT_VALKEY_URL = "redis://valkey:6379";
const LOGIN_RATE_LIMIT_KEY_PREFIX = "wiiicare:nexus:auth:login-rate-limit";

const consumeAttemptScript = `
local attempts = redis.call("INCR", KEYS[1])
if attempts == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("PTTL", KEYS[1])
return { attempts, ttl }
`;

type MemoryLoginRateLimitEntry = {
  attempts: number;
  readonly resetAt: number;
};

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

export function createMemoryLoginRateLimiter(config: LoginRateLimitConfig): LoginRateLimiter {
  const entries = new Map<string, MemoryLoginRateLimitEntry>();

  return {
    async consume(key: string): Promise<LoginRateLimitDecision> {
      return consumeMemoryAttempt(entries, config, key);
    }
  };
}

export function createValkeyLoginRateLimiter(
  config: LoginRateLimitConfig,
  options: {
    readonly url?: string;
    readonly client?: ValkeyLoginRateLimitClient;
    readonly keyPrefix?: string;
  } = {}
): LoginRateLimiter {
  const client =
    options.client ??
    (createClient({
      url: options.url
    }) as unknown as ValkeyLoginRateLimitClient);
  const keyPrefix = options.keyPrefix ?? LOGIN_RATE_LIMIT_KEY_PREFIX;
  let connectPromise: Promise<unknown> | undefined;
  client.on?.("error", () => undefined);

  return {
    async consume(key: string): Promise<LoginRateLimitDecision> {
      await ensureValkeyConnected(client, () => {
        connectPromise ??= client.connect().catch((error: unknown) => {
          connectPromise = undefined;
          throw error;
        });
        return connectPromise;
      });

      const result = await client.eval(consumeAttemptScript, {
        keys: [`${keyPrefix}:${key}`],
        arguments: [String(config.windowMs)]
      });
      const [attempts, ttlMs] = parseValkeyAttemptResult(result);

      if (attempts > config.maxAttempts) {
        return {
          limited: true,
          retryAfterSeconds: Math.max(1, Math.ceil(ttlMs / 1000))
        };
      }

      return {
        limited: false
      };
    },
    async close(): Promise<void> {
      if (!client.isOpen) {
        return;
      }

      if (client.quit) {
        await client.quit();
        return;
      }

      await client.disconnect?.();
    }
  };
}

export function createLoginRateLimitKey(ipAddress: string, username: string): string {
  return createHash("sha256")
    .update(ipAddress)
    .update("\0")
    .update(username.trim().toLowerCase())
    .digest("hex");
}

function resolveLoginRateLimitConfig(): LoginRateLimitConfig {
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

async function ensureValkeyConnected(
  client: ValkeyLoginRateLimitClient,
  connect: () => Promise<unknown>
): Promise<void> {
  if (client.isOpen) {
    return;
  }

  await connect();
}

function parseValkeyAttemptResult(result: unknown): readonly [number, number] {
  if (!Array.isArray(result) || result.length < 2) {
    throw new Error("Unexpected Valkey rate limit response.");
  }

  const attempts = Number(result[0]);
  const ttlMs = Number(result[1]);

  if (!Number.isFinite(attempts) || attempts < 1 || !Number.isFinite(ttlMs)) {
    throw new Error("Invalid Valkey rate limit response.");
  }

  return [attempts, ttlMs > 0 ? ttlMs : 1000];
}

function readLoginRateLimitStore(): "memory" | "valkey" {
  const rawValue = process.env.BVS_RATE_LIMIT_STORE?.trim().toLowerCase();

  if (!rawValue) {
    return process.env.NODE_ENV === "production" ? "valkey" : "memory";
  }

  if (rawValue === "memory" || rawValue === "valkey") {
    return rawValue;
  }

  throw new Error("BVS_RATE_LIMIT_STORE must be either 'memory' or 'valkey'.");
}

function readValkeyUrl(): string {
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
