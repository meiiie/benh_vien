import type { FastifyInstance } from "fastify";
import { LoginRequestSchema } from "@benh-vien-so/contracts";
import type { AuditEventRepository } from "@benh-vien-so/domain";
import { dummyPasswordHash, verifyPassword } from "./auth-password.js";
import { demoAccounts } from "./auth-demo-accounts.js";
import {
  hashLoginUsername,
  readUsernameHash,
  recordLoginAuditEvent
} from "./auth-login-audit.js";
import { createAccessToken } from "./auth-session.js";
import { createLoginRateLimitKey, type LoginRateLimiter } from "./login-rate-limit.js";

export async function registerAuthLoginRoutes(
  app: FastifyInstance,
  options: {
    readonly auditRepository?: AuditEventRepository;
    readonly loginRateLimiter: LoginRateLimiter;
  }
): Promise<void> {
  const { auditRepository, loginRateLimiter } = options;

  app.post("/auth/login", async (request, reply) => {
    if (!isDemoAuthEnabled()) {
      await recordLoginAuditEvent(auditRepository, request, {
        actorId: "anonymous",
        action: "auth.login.failure",
        metadata: {
          reason: "DEMO_AUTH_DISABLED",
          usernameHash: readUsernameHash(request.body)
        }
      });

      return reply.status(403).send({
        error: "DEMO_AUTH_DISABLED",
        message:
          "Đăng nhập demo đã bị tắt trong môi trường production. Hãy tích hợp IAM/SSO hoặc bật BVS_DEMO_AUTH_ENABLED=true cho phiên demo có kiểm soát.",
        requestId: request.id
      });
    }

    const parsed = LoginRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      await recordLoginAuditEvent(auditRepository, request, {
        actorId: "anonymous",
        action: "auth.login.failure",
        metadata: {
          reason: "VALIDATION_ERROR",
          usernameHash: readUsernameHash(request.body)
        }
      });

      throw parsed.error;
    }

    const usernameHash = hashLoginUsername(parsed.data.username);
    const rateLimitDecision = await loginRateLimiter.consume(
      createLoginRateLimitKey(request.ip, parsed.data.username)
    );

    if (rateLimitDecision.limited) {
      reply.header("Retry-After", String(rateLimitDecision.retryAfterSeconds));
      await recordLoginAuditEvent(auditRepository, request, {
        actorId: "anonymous",
        action: "auth.login.failure",
        metadata: {
          reason: "AUTH_RATE_LIMITED",
          requestedRole: parsed.data.role,
          retryAfterSeconds: rateLimitDecision.retryAfterSeconds,
          usernameHash
        }
      });

      return reply.status(429).send({
        error: "AUTH_RATE_LIMITED",
        message: "Quá nhiều lần đăng nhập. Vui lòng thử lại sau.",
        requestId: request.id,
        retryAfterSeconds: rateLimitDecision.retryAfterSeconds
      });
    }

    const account = demoAccounts.find((item) => item.username === parsed.data.username);
    const passwordMatches = await verifyPassword(
      parsed.data.password,
      account?.passwordHash ?? dummyPasswordHash
    );

    if (!account || !passwordMatches) {
      await recordLoginAuditEvent(auditRepository, request, {
        actorId: account?.actorId ?? "anonymous",
        action: "auth.login.failure",
        metadata: {
          reason: "INVALID_CREDENTIALS",
          requestedRole: parsed.data.role,
          usernameHash
        }
      });

      return reply.status(401).send({
        error: "INVALID_CREDENTIALS",
        message: "Tài khoản hoặc mật khẩu không hợp lệ.",
        requestId: request.id
      });
    }

    if (parsed.data.role && parsed.data.role !== account.role) {
      await recordLoginAuditEvent(auditRepository, request, {
        actorId: account.actorId,
        action: "auth.login.failure",
        metadata: {
          reason: "ROLE_MISMATCH",
          expectedRole: account.role,
          requestedRole: parsed.data.role,
          usernameHash
        }
      });

      return reply.status(403).send({
        error: "ROLE_MISMATCH",
        message: "Vai trò yêu cầu không khớp với tài khoản đăng nhập.",
        requestId: request.id,
        expectedRole: account.role
      });
    }

    await recordLoginAuditEvent(auditRepository, request, {
      actorId: account.actorId,
      action: "auth.login.success",
      metadata: {
        actorRole: account.role,
        usernameHash
      }
    });

    return createAccessToken({
      actorId: account.actorId,
      displayName: account.displayName,
      role: account.role
    });
  });
}

function isDemoAuthEnabled(): boolean {
  const rawValue = process.env.BVS_DEMO_AUTH_ENABLED?.trim().toLowerCase();

  if (rawValue === "true") {
    return true;
  }

  if (rawValue === "false") {
    return false;
  }

  return process.env.NODE_ENV !== "production";
}
