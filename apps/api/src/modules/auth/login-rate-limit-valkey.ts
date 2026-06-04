import { loginRateLimitKeyPrefix } from "./login-rate-limit-config.js";
import type {
  LoginRateLimitConfig,
  LoginRateLimitDecision,
  LoginRateLimitHealth,
  LoginRateLimiter,
  ValkeyLoginRateLimitClient
} from "./login-rate-limit.types.js";
import { createRedisLoginRateLimitClient } from "./login-rate-limit-valkey-client.js";

const consumeAttemptScript = `
local attempts = redis.call("INCR", KEYS[1])
if attempts == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("PTTL", KEYS[1])
return { attempts, ttl }
`;

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
    createRedisLoginRateLimitClient(options.url);
  const keyPrefix = options.keyPrefix ?? loginRateLimitKeyPrefix;
  let connectPromise: Promise<unknown> | undefined;
  client.on?.("error", () => undefined);

  return {
    async consume(key: string): Promise<LoginRateLimitDecision> {
      await ensureValkeyConnected(client, () => connectValkey(client, connectPromise, (next) => {
        connectPromise = next;
      }));

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
    async check(): Promise<LoginRateLimitHealth> {
      try {
        await ensureValkeyConnected(client, () =>
          connectValkey(client, connectPromise, (next) => {
            connectPromise = next;
          })
        );
        await client.ping?.();

        return {
          status: "ok",
          store: "valkey"
        };
      } catch {
        return {
          status: "error",
          store: "valkey",
          message: "Valkey rate limit store is unavailable."
        };
      }
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

async function ensureValkeyConnected(
  client: ValkeyLoginRateLimitClient,
  connect: () => Promise<unknown>
): Promise<void> {
  if (client.isOpen) {
    return;
  }

  await connect();
}

function connectValkey(
  client: ValkeyLoginRateLimitClient,
  currentConnectPromise: Promise<unknown> | undefined,
  rememberConnectPromise: (connectPromise: Promise<unknown> | undefined) => void
): Promise<unknown> {
  if (currentConnectPromise) {
    return currentConnectPromise;
  }

  const connectPromise = client.connect().catch((error: unknown) => {
    rememberConnectPromise(undefined);
    throw error;
  });
  rememberConnectPromise(connectPromise);

  return connectPromise;
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
