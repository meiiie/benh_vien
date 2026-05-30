import { createHash } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { LoginRequestSchema } from "@benh-vien-so/contracts";
import { AuditEvent } from "@benh-vien-so/domain";
import type { ActorRole, AuditEventRepository } from "@benh-vien-so/domain";
import { demoPasswordHash, dummyPasswordHash, verifyPassword } from "./auth-password.js";
import { createAccessToken, verifyAccessToken } from "./auth-session.js";
import {
  createLoginRateLimitKey,
  createLoginRateLimiterFromEnv,
  type LoginRateLimiter
} from "./login-rate-limit.js";

type DemoAccount = {
  readonly username: string;
  readonly passwordHash: string;
  readonly actorId: string;
  readonly displayName: string;
  readonly role: ActorRole;
};

const demoAccounts: readonly DemoAccount[] = [
  {
    username: "practitioner-demo-001",
    passwordHash: demoPasswordHash,
    actorId: "practitioner-demo-001",
    displayName: "Bác sĩ điều trị",
    role: "clinician"
  },
  {
    username: "nurse-demo-001",
    passwordHash: demoPasswordHash,
    actorId: "nurse-demo-001",
    displayName: "Điều dưỡng tiếp nhận",
    role: "nurse"
  },
  {
    username: "security-officer-demo",
    passwordHash: demoPasswordHash,
    actorId: "security-officer-demo",
    displayName: "Kiểm toán viên",
    role: "auditor"
  },
  {
    username: "admin-demo",
    passwordHash: demoPasswordHash,
    actorId: "admin-demo",
    displayName: "Quản trị hệ thống",
    role: "admin"
  },
  {
    username: "gateway-hai-phong-referral",
    passwordHash: demoPasswordHash,
    actorId: "system-hai-phong-referral-gateway",
    displayName: "Gateway liên thông BV tiếp nhận Hải Phòng",
    role: "integration"
  }
];

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

  app.get("/auth/session", async (request, reply) => {
    const token = readBearerToken(request.headers.authorization);
    const session = token ? verifyAccessToken(token) : undefined;

    if (!session) {
      reply.header("WWW-Authenticate", "Bearer");

      return reply.status(401).send({
        error: "UNAUTHENTICATED",
        message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
        requestId: request.id
      });
    }

    return session;
  });
}

async function recordLoginAuditEvent(
  auditRepository: AuditEventRepository | undefined,
  request: FastifyRequest,
  input: {
    readonly actorId: string;
    readonly action: "auth.login.success" | "auth.login.failure";
    readonly metadata: Record<string, unknown>;
  }
): Promise<void> {
  if (!auditRepository) {
    return;
  }

  await auditRepository.save(
    AuditEvent.record({
      actorId: input.actorId,
      action: input.action,
      resourceType: "AuditEvent",
      resourceId: "auth/login",
      purposeOfUse: "OPERATIONS",
      ipAddress: request.ip,
      userAgent: readHeader(request.headers["user-agent"]),
      metadata: {
        requestId: request.id,
        ...input.metadata
      }
    })
  );
}

function readUsernameHash(value: unknown): string | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  const username = (value as { readonly username?: unknown }).username;

  return typeof username === "string" ? hashLoginUsername(username) : undefined;
}

function hashLoginUsername(username: string): string {
  return createHash("sha256").update(username.trim().toLowerCase()).digest("hex");
}

function readHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function readBearerToken(value: string | string[] | undefined): string | undefined {
  const header = Array.isArray(value) ? value[0] : value;

  if (!header?.startsWith("Bearer ")) {
    return undefined;
  }

  return header.slice("Bearer ".length).trim();
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
