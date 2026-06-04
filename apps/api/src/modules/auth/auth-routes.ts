import type { FastifyInstance } from "fastify";
import type { AuditEventRepository } from "@benh-vien-so/domain";
import { registerAuthLoginRoutes } from "./auth-login-routes.js";
import { registerAuthSessionRoutes } from "./auth-session-routes.js";
import { createLoginRateLimiterFromEnv, type LoginRateLimiter } from "./login-rate-limit.js";

export async function registerAuthRoutes(
  app: FastifyInstance,
  options: {
    readonly auditRepository?: AuditEventRepository;
    readonly loginRateLimiter?: LoginRateLimiter;
  } = {}
): Promise<void> {
  const loginRateLimiter = options.loginRateLimiter ?? createLoginRateLimiterFromEnv();
  const auditRepository = options.auditRepository;

  app.addHook("onClose", async () => {
    await loginRateLimiter.close?.();
  });

  await registerAuthLoginRoutes(app, {
    auditRepository,
    loginRateLimiter
  });
  await registerAuthSessionRoutes(app);
}
