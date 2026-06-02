import { createClient } from "redis";
import type { ValkeyLoginRateLimitClient } from "./login-rate-limit.types.js";

export function createRedisLoginRateLimitClient(
  url: string | undefined
): ValkeyLoginRateLimitClient {
  const client = createClient({
    url
  });

  return {
    get isOpen() {
      return client.isOpen;
    },
    on(event, listener) {
      return client.on(event, listener);
    },
    async connect(): Promise<void> {
      await client.connect();
    },
    async ping(): Promise<unknown> {
      return client.ping();
    },
    async eval(
      script: string,
      options: {
        readonly keys: readonly string[];
        readonly arguments: readonly string[];
      }
    ): Promise<unknown> {
      return client.eval(script, {
        keys: [...options.keys],
        arguments: [...options.arguments]
      });
    },
    async quit(): Promise<unknown> {
      return client.quit();
    },
    async disconnect(): Promise<void> {
      await client.disconnect();
    }
  };
}
