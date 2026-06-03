import Fastify, { type FastifyInstance } from "fastify";
import { expect } from "vitest";
import type {
  RecordTransferDeliveryAttempt,
  RecordTransferDeliveryAttemptRepository
} from "@benh-vien-so/domain";
import { registerAuthRoutes } from "./modules/auth/auth-routes.js";
import { createMemoryLoginRateLimiter } from "./modules/auth/login-rate-limit.js";
import {
  buildRecordTransferCallbackSignature,
  recordTransferCallbackKeyIdHeader,
  recordTransferCallbackSignatureHeader,
  recordTransferCallbackTimestampHeader
} from "./modules/record-transfers/record-transfer-callback-signature.js";
import { buildServer } from "./server.js";

export {
  recordTransferCallbackKeyIdHeader,
  recordTransferCallbackSignatureHeader,
  recordTransferCallbackTimestampHeader
};

export const authBoundaryTestSecret =
  "wiiicare-test-secret-at-least-32-characters";
export const recordTransferCallbackTestSecret =
  "wiiicare-record-transfer-callback-secret-for-tests";
export const recordTransferCallbackTestKeyId = "gateway-hai-phong-referral";
export const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const authBoundaryEnvNames = [
  "BVS_REPOSITORY",
  "BVS_AUTH_SECRET",
  "BVS_AUTH_TOKEN_TTL_SECONDS",
  "BVS_CORS_ORIGINS",
  "DATABASE_URL",
  "NODE_ENV",
  "BVS_PUBLIC_API_BASE_URL",
  "BVS_AUTH_LOGIN_RATE_LIMIT_MAX",
  "BVS_AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS",
  "BVS_RATE_LIMIT_STORE",
  "BVS_VALKEY_URL",
  "BVS_DEMO_AUTH_ENABLED",
  "BVS_RECORD_TRANSFER_RETRY_WORKER_ENABLED",
  "BVS_RECORD_TRANSFER_DELIVERY_WORKER_ENABLED",
  "BVS_RECORD_TRANSFER_CALLBACK_SECRET",
  "BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON",
  "BVS_API_DOCS_ENABLED",
  "BVS_HTTP_BODY_LIMIT_BYTES"
] as const;

type AuthBoundaryEnvName = (typeof authBoundaryEnvNames)[number];

export type AuthBoundaryEnvSnapshot = Readonly<
  Record<AuthBoundaryEnvName, string | undefined>
>;

export function captureAuthBoundaryEnv(): AuthBoundaryEnvSnapshot {
  const snapshot = {} as Record<AuthBoundaryEnvName, string | undefined>;

  for (const name of authBoundaryEnvNames) {
    snapshot[name] = process.env[name];
  }

  return snapshot;
}

export function applyDefaultAuthBoundaryEnv(): void {
  process.env.BVS_REPOSITORY = "in-memory";
  process.env.BVS_AUTH_SECRET = authBoundaryTestSecret;
  process.env.BVS_RECORD_TRANSFER_RETRY_WORKER_ENABLED = "false";
  process.env.BVS_RECORD_TRANSFER_DELIVERY_WORKER_ENABLED = "false";
}

export function restoreAuthBoundaryEnv(snapshot: AuthBoundaryEnvSnapshot): void {
  for (const name of authBoundaryEnvNames) {
    restoreEnv(name, snapshot[name]);
  }
}

export async function readyServer(
  options: Parameters<typeof buildServer>[0] = {}
): Promise<FastifyInstance> {
  const server = await buildServer({
    logger: false,
    ...options
  });
  await server.ready();
  return server;
}

export class FailingRecordTransferDeliveryAttemptRepository
  implements RecordTransferDeliveryAttemptRepository
{
  async findByRecordTransferId(): Promise<RecordTransferDeliveryAttempt[]> {
    return [];
  }

  async findQueued(): Promise<RecordTransferDeliveryAttempt[]> {
    return [];
  }

  async save(_attempt: RecordTransferDeliveryAttempt): Promise<void> {
    throw new Error("delivery attempt store unavailable");
  }
}

export async function readyAuthRouteServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger: false,
    requestIdHeader: "x-request-id"
  });
  await server.register(
    async (api) => {
      await registerAuthRoutes(api, {
        loginRateLimiter: createMemoryLoginRateLimiter({
          maxAttempts: 20,
          windowMs: 60_000
        })
      });
    },
    {
      prefix: "/api/v1"
    }
  );
  await server.ready();
  return server;
}

export async function login(
  app: FastifyInstance,
  payload: {
    readonly username: string;
    readonly password: string;
    readonly role: string;
  },
  headers: Record<string, string> = {}
) {
  return app.inject({
    method: "POST",
    url: "/api/v1/auth/login",
    headers: {
      ...headers,
      "content-type": "application/json"
    },
    payload
  });
}

export async function loginForToken(
  app: FastifyInstance,
  username: string,
  role: string
): Promise<string> {
  const response = await login(app, {
    username,
    password: "demo",
    role
  });

  expect(response.statusCode).toBe(200);

  return response.json().accessToken as string;
}

export function treatmentHeaders(accessToken: string): Record<string, string> {
  return {
    authorization: `Bearer ${accessToken}`,
    "x-purpose-of-use": "TREATMENT"
  };
}

export function operationsHeaders(accessToken: string): Record<string, string> {
  return {
    authorization: `Bearer ${accessToken}`,
    "x-purpose-of-use": "OPERATIONS"
  };
}

export function bundleTransferHeaders(accessToken: string): Record<string, string> {
  return {
    ...treatmentHeaders(accessToken),
    "x-consent-reference": "consent-demo-transfer-001",
    "x-recipient-organization-id": "hospital-hai-phong-referral"
  };
}

export function auditHeaders(accessToken: string): Record<string, string> {
  return {
    authorization: `Bearer ${accessToken}`,
    "x-purpose-of-use": "AUDIT"
  };
}

export function jsonRequestHeaders(
  headers: Record<string, string>
): Record<string, string> {
  return {
    ...headers,
    "content-type": "application/json"
  };
}

export function expectOperationOutcome(
  response: {
    readonly statusCode: number;
    readonly headers: Record<string, unknown>;
    json(): unknown;
  },
  expected: {
    readonly statusCode: number;
    readonly code: string;
    readonly detailsCode: string;
  }
): void {
  expect(response.statusCode).toBe(expected.statusCode);
  expect(String(response.headers["content-type"])).toContain("application/fhir+json");
  const body = response.json();
  expect(body).not.toHaveProperty("requestId");
  expect(body).toMatchObject({
    resourceType: "OperationOutcome",
    issue: [
      {
        severity: "error",
        code: expected.code,
        details: {
          coding: [
            {
              system: "urn:wiiicare:nexus:operation-outcome",
              code: expected.detailsCode
            }
          ]
        }
      }
    ]
  });
}

export function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}

export function signedRecordTransferCallbackHeaders(input: {
  readonly recordTransferId: string;
  readonly body: unknown;
}): Record<string, string> {
  const timestamp = new Date().toISOString();

  return {
    [recordTransferCallbackKeyIdHeader]: recordTransferCallbackTestKeyId,
    [recordTransferCallbackTimestampHeader]: timestamp,
    [recordTransferCallbackSignatureHeader]: buildRecordTransferCallbackSignature({
      secret: recordTransferCallbackTestSecret,
      timestamp,
      recordTransferId: input.recordTransferId,
      body: input.body
    })
  };
}
