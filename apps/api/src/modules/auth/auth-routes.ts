import type { FastifyInstance } from "fastify";
import { LoginRequestSchema } from "@benh-vien-so/contracts";
import type { ActorRole } from "@benh-vien-so/domain";
import { createAccessToken, verifyAccessToken } from "./auth-session.js";

type DemoAccount = {
  readonly username: string;
  readonly password: string;
  readonly actorId: string;
  readonly displayName: string;
  readonly role: ActorRole;
};

type LoginRateLimitConfig = {
  readonly maxAttempts: number;
  readonly windowMs: number;
};

type LoginRateLimitEntry = {
  attempts: number;
  readonly resetAt: number;
};

type LoginRateLimitDecision =
  | {
      readonly limited: false;
    }
  | {
      readonly limited: true;
      readonly retryAfterSeconds: number;
    };

const DEFAULT_LOGIN_RATE_LIMIT_MAX = 20;
const DEFAULT_LOGIN_RATE_LIMIT_WINDOW_SECONDS = 60;

const demoAccounts: readonly DemoAccount[] = [
  {
    username: "practitioner-demo-001",
    password: "demo",
    actorId: "practitioner-demo-001",
    displayName: "Bác sĩ điều trị",
    role: "clinician"
  },
  {
    username: "nurse-demo-001",
    password: "demo",
    actorId: "nurse-demo-001",
    displayName: "Điều dưỡng tiếp nhận",
    role: "nurse"
  },
  {
    username: "security-officer-demo",
    password: "demo",
    actorId: "security-officer-demo",
    displayName: "Kiểm toán viên",
    role: "auditor"
  },
  {
    username: "admin-demo",
    password: "demo",
    actorId: "admin-demo",
    displayName: "Quản trị hệ thống",
    role: "admin"
  }
];

export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {
  const loginRateLimitConfig = resolveLoginRateLimitConfig();
  const loginRateLimitEntries = new Map<string, LoginRateLimitEntry>();

  app.post("/auth/login", async (request, reply) => {
    const parsed = LoginRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "INVALID_LOGIN_PAYLOAD",
        issues: parsed.error.issues
      });
    }

    const rateLimitDecision = consumeLoginRateLimitAttempt(
      loginRateLimitEntries,
      loginRateLimitConfig,
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

    if (!account || account.password !== parsed.data.password) {
      return reply.status(401).send({
        error: "INVALID_CREDENTIALS",
        message: "Tài khoản hoặc mật khẩu không hợp lệ."
      });
    }

    if (parsed.data.role && parsed.data.role !== account.role) {
      return reply.status(403).send({
        error: "ROLE_MISMATCH",
        message: "Vai trò yêu cầu không khớp với tài khoản đăng nhập.",
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
        message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn."
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

function consumeLoginRateLimitAttempt(
  entries: Map<string, LoginRateLimitEntry>,
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

  if (entry.attempts >= config.maxAttempts) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000))
    };
  }

  entry.attempts += 1;

  return {
    limited: false
  };
}

function createLoginRateLimitKey(ipAddress: string, username: string): string {
  return `${ipAddress}:${username.trim().toLowerCase()}`;
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
