import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const testBudgets = [
  {
    path: "apps/api/src/server.auth.test.ts",
    maxLines: 3900,
    role: "API auth/RBAC integration scenarios outside login boundary"
  },
  {
    path: "apps/api/src/server.auth.login.test.ts",
    maxLines: 550,
    role: "API login and token boundary scenarios"
  },
  {
    path: "apps/api/src/server.runtime.test.ts",
    maxLines: 520,
    role: "API runtime, readiness and HTTP envelope scenarios"
  },
  {
    path: "apps/api/src/server.startup-config.test.ts",
    maxLines: 260,
    role: "API startup and production configuration scenarios"
  },
  {
    path: "apps/api/src/server.auth.test-support.ts",
    maxLines: 320,
    role: "Shared API auth boundary test support"
  }
];

const authBoundaryPath = resolve("apps/api/src/server.auth.test.ts");
const loginBoundaryPath = resolve("apps/api/src/server.auth.login.test.ts");
const runtimeBoundaryPath = resolve("apps/api/src/server.runtime.test.ts");
const startupConfigBoundaryPath = resolve("apps/api/src/server.startup-config.test.ts");

const forbiddenAuthBoundaryPatterns = [
  {
    pattern: /\breadyAuthRouteServer\b/,
    message:
      "Auth route-only fixture belongs in server.auth.login.test.ts, not the broader server.auth.test.ts suite."
  },
  {
    pattern: /returns a signed demo session|rate limits repeated login attempts/,
    message:
      "Login and token boundary scenarios belong in server.auth.login.test.ts."
  },
  {
    pattern: /returns readiness checks|sets baseline HTTP security headers|returns redacted runtime metadata/,
    message:
      "Runtime, readiness and HTTP envelope scenarios belong in server.runtime.test.ts."
  },
  {
    pattern: /requires explicit CORS origins|rejects unsafe CORS origins|requires PostgreSQL repositories|rejects local-only public API base URLs/,
    message:
      "Startup and production configuration scenarios belong in server.startup-config.test.ts."
  }
];

const requiredLoginBoundaryPatterns = [
  /returns a signed demo session/,
  /uses the configured auth token TTL/,
  /rate limits repeated login attempts/,
  /rejects invalid purpose-of-use headers/
];
const requiredRuntimeBoundaryPatterns = [
  /returns readiness checks/,
  /returns redacted runtime metadata/,
  /sets baseline HTTP security headers/,
  /returns a safe validation error envelope/
];
const requiredStartupConfigBoundaryPatterns = [
  /requires explicit CORS origins/,
  /rejects unsafe CORS origins/,
  /requires PostgreSQL repositories/,
  /rejects local-only public API base URLs/
];

const testReports = [];

for (const budget of testBudgets) {
  const absolutePath = resolve(budget.path);
  await stat(absolutePath);
  const source = await readFile(absolutePath, "utf8");
  const lineCount = source.split(/\r?\n/).length;

  if (lineCount > budget.maxLines) {
    throw new Error(
      `${budget.path} has ${lineCount} lines; keep it at or below ${budget.maxLines} so ${budget.role} does not become a maintenance bottleneck.`
    );
  }

  testReports.push({
    path: budget.path,
    lineCount,
    maxLines: budget.maxLines,
    role: budget.role
  });
}

const authBoundarySource = await readFile(authBoundaryPath, "utf8");
const loginBoundarySource = await readFile(loginBoundaryPath, "utf8");
const runtimeBoundarySource = await readFile(runtimeBoundaryPath, "utf8");
const startupConfigBoundarySource = await readFile(startupConfigBoundaryPath, "utf8");

for (const forbidden of forbiddenAuthBoundaryPatterns) {
  if (forbidden.pattern.test(authBoundarySource)) {
    throw new Error(forbidden.message);
  }
}

for (const required of requiredLoginBoundaryPatterns) {
  if (!required.test(loginBoundarySource)) {
    throw new Error(
      "server.auth.login.test.ts must keep core login, token, rate-limit and purpose-of-use boundary scenarios."
    );
  }
}

for (const required of requiredRuntimeBoundaryPatterns) {
  if (!required.test(runtimeBoundarySource)) {
    throw new Error(
      "server.runtime.test.ts must keep core readiness, runtime metadata, security header and safe error envelope scenarios."
    );
  }
}

for (const required of requiredStartupConfigBoundaryPatterns) {
  if (!required.test(startupConfigBoundarySource)) {
    throw new Error(
      "server.startup-config.test.ts must keep core CORS, repository, public API URL and production startup validation scenarios."
    );
  }
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "API test composition budget",
      testReports
    },
    null,
    2
  )
);
