import { afterEach, describe, expect, it } from "vitest";
import {
  createLoginRateLimiterFromEnv,
  createLoginRateLimitKey,
  createMemoryLoginRateLimiter,
  createValkeyLoginRateLimiter,
  type ValkeyLoginRateLimitClient
} from "./login-rate-limit.js";

const originalNodeEnv = process.env.NODE_ENV;
const originalRateLimitStore = process.env.BVS_RATE_LIMIT_STORE;

describe("login rate limiting", () => {
  afterEach(() => {
    restoreEnv("NODE_ENV", originalNodeEnv);
    restoreEnv("BVS_RATE_LIMIT_STORE", originalRateLimitStore);
  });

  it("limits memory attempts after the configured threshold", async () => {
    const limiter = createMemoryLoginRateLimiter({
      maxAttempts: 2,
      windowMs: 60_000
    });
    const key = createLoginRateLimitKey("127.0.0.1", "PRACTITIONER-DEMO-001");

    await expect(limiter.consume(key)).resolves.toMatchObject({
      limited: false
    });
    await expect(limiter.consume(key)).resolves.toMatchObject({
      limited: false
    });
    await expect(limiter.consume(key)).resolves.toMatchObject({
      limited: true,
      retryAfterSeconds: expect.any(Number)
    });
  });

  it("uses a hashed key instead of storing raw username material", () => {
    const key = createLoginRateLimitKey("127.0.0.1", "practitioner-demo-001");

    expect(key).toEqual(expect.stringMatching(/^[a-f0-9]{64}$/));
    expect(key).not.toContain("practitioner");
    expect(key).not.toContain("127.0.0.1");
  });

  it("uses Valkey-compatible atomic counters for shared rate limits", async () => {
    const client = new FakeValkeyRateLimitClient();
    const limiter = createValkeyLoginRateLimiter(
      {
        maxAttempts: 2,
        windowMs: 60_000
      },
      {
        client,
        keyPrefix: "test:login-rate-limit"
      }
    );
    const key = createLoginRateLimitKey("10.0.0.10", "practitioner-demo-001");

    await expect(limiter.consume(key)).resolves.toMatchObject({
      limited: false
    });
    await expect(limiter.consume(key)).resolves.toMatchObject({
      limited: false
    });
    await expect(limiter.consume(key)).resolves.toMatchObject({
      limited: true,
      retryAfterSeconds: 60
    });

    expect(client.connectCount).toBe(1);
    expect(client.keys()).toEqual([`test:login-rate-limit:${key}`]);

    await limiter.close?.();

    expect(client.quitCount).toBe(1);
  });

  it("rejects memory store in production", () => {
    process.env.NODE_ENV = "production";
    process.env.BVS_RATE_LIMIT_STORE = "memory";

    expect(() => createLoginRateLimiterFromEnv()).toThrow(
      "BVS_RATE_LIMIT_STORE must be 'valkey' in production."
    );
  });
});

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}

class FakeValkeyRateLimitClient implements ValkeyLoginRateLimitClient {
  isOpen = false;
  connectCount = 0;
  quitCount = 0;

  private readonly attempts = new Map<
    string,
    {
      count: number;
      expiresAt: number;
    }
  >();

  async connect(): Promise<void> {
    this.connectCount += 1;
    this.isOpen = true;
  }

  async eval(
    _script: string,
    options: {
      readonly keys: readonly string[];
      readonly arguments: readonly string[];
    }
  ): Promise<readonly [number, number]> {
    const [key] = options.keys;
    const [windowMsRaw] = options.arguments;

    if (!key || !windowMsRaw) {
      throw new Error("Missing fake Valkey rate limit arguments.");
    }

    const windowMs = Number(windowMsRaw);
    const now = 1_000;
    const entry = this.attempts.get(key);
    const nextEntry =
      !entry || entry.expiresAt <= now
        ? {
            count: 1,
            expiresAt: now + windowMs
          }
        : {
            count: entry.count + 1,
            expiresAt: entry.expiresAt
          };

    this.attempts.set(key, nextEntry);

    return [nextEntry.count, nextEntry.expiresAt - now];
  }

  async quit(): Promise<void> {
    this.quitCount += 1;
    this.isOpen = false;
  }

  keys(): readonly string[] {
    return [...this.attempts.keys()];
  }
}
