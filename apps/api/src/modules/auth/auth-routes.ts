import type { FastifyInstance } from "fastify";
import { LoginRequestSchema } from "@benh-vien-so/contracts";
import type { ActorRole } from "@benh-vien-so/domain";
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
  }
];

export async function registerAuthRoutes(
  app: FastifyInstance,
  options: {
    readonly loginRateLimiter?: LoginRateLimiter;
  } = {}
): Promise<void> {
  const loginRateLimiter = options.loginRateLimiter ?? createLoginRateLimiterFromEnv();

  app.addHook("onClose", async () => {
    await loginRateLimiter.close?.();
  });

  app.post("/auth/login", async (request, reply) => {
    const parsed = LoginRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    const rateLimitDecision = await loginRateLimiter.consume(
      createLoginRateLimitKey(request.ip, parsed.data.username)
    );

    if (rateLimitDecision.limited) {
      reply.header("Retry-After", String(rateLimitDecision.retryAfterSeconds));

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
      return reply.status(401).send({
        error: "INVALID_CREDENTIALS",
        message: "Tài khoản hoặc mật khẩu không hợp lệ.",
        requestId: request.id
      });
    }

    if (parsed.data.role && parsed.data.role !== account.role) {
      return reply.status(403).send({
        error: "ROLE_MISMATCH",
        message: "Vai trò yêu cầu không khớp với tài khoản đăng nhập.",
        requestId: request.id,
        expectedRole: account.role
      });
    }

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
      return reply.status(401).send({
        error: "UNAUTHENTICATED",
        message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
        requestId: request.id
      });
    }

    return session;
  });
}

function readBearerToken(value: string | string[] | undefined): string | undefined {
  const header = Array.isArray(value) ? value[0] : value;

  if (!header?.startsWith("Bearer ")) {
    return undefined;
  }

  return header.slice("Bearer ".length).trim();
}
