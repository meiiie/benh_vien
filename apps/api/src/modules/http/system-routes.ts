import type { FastifyInstance } from "fastify";
import { buildWiiiCareCapabilityStatement } from "@benh-vien-so/domain";
import type {
  ActorContext,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { readActorContext } from "../access-control/access-context.js";
import type { LoginRateLimiter } from "../auth/login-rate-limit.js";

export type SystemRoutesOptions = {
  readonly patientRepository: PatientRepository;
  readonly providerDirectoryRepository: ProviderDirectoryRepository;
  readonly loginRateLimiter: LoginRateLimiter;
};

export type ApiSystemRoutesOptions = {
  readonly apiVersion: string;
  readonly publicApiBaseUrl: string;
  readonly httpBodyLimitBytes: number;
  readonly apiDocsEnabled: boolean;
  readonly recordTransferDeliveryWorkerEnabled: boolean;
  readonly recordTransferRetryWorkerEnabled: boolean;
};

export function registerSystemRoutes(
  app: FastifyInstance,
  options: SystemRoutesOptions
): void {
  app.get("/health", async () => ({
    status: "ok",
    service: "benh-vien-so-api"
  }));

  app.get("/ready", async (_request, reply) => {
    const checkedAt = new Date().toISOString();
    const startedAt = Date.now();

    try {
      const [patients, providerDirectory, loginRateLimit] = await Promise.all([
        options.patientRepository.findAll(),
        options.providerDirectoryRepository.findDirectory(),
        options.loginRateLimiter.check()
      ]);
      const providerDirectorySnapshot = providerDirectory.toSnapshot();
      const checks = {
        patients: {
          status: "ok",
          count: patients.length
        },
        providerDirectory: {
          status: "ok",
          organizations: providerDirectorySnapshot.organizations.length,
          practitioners: providerDirectorySnapshot.practitioners.length,
          endpoints: providerDirectorySnapshot.endpoints.length
        },
        loginRateLimit
      };

      if (loginRateLimit.status !== "ok") {
        return reply.status(503).send({
          status: "not_ready",
          service: "benh-vien-so-api",
          repository: readRepositoryName(),
          checkedAt,
          latencyMs: Date.now() - startedAt,
          checks
        });
      }

      return {
        status: "ready",
        service: "benh-vien-so-api",
        repository: readRepositoryName(),
        checkedAt,
        latencyMs: Date.now() - startedAt,
        checks
      };
    } catch {
      return reply.status(503).send({
        status: "not_ready",
        service: "benh-vien-so-api",
        repository: readRepositoryName(),
        checkedAt,
        checks: {
          patients: {
            status: "unknown"
          },
          providerDirectory: {
            status: "unknown"
          },
          loginRateLimit: {
            status: "unknown"
          }
        }
      });
    }
  });
}

export function registerApiSystemRoutes(
  api: FastifyInstance,
  options: ApiSystemRoutesOptions
): void {
  api.get("/runtime", async (request) =>
    buildApiRuntimeInfo({
      ...options,
      actor: readActorContext(request)
    })
  );

  api.get("/fhir/metadata", async () =>
    buildWiiiCareCapabilityStatement({
      implementationUrl: options.publicApiBaseUrl
    })
  );
}

function buildApiRuntimeInfo(
  input: ApiSystemRoutesOptions & {
    readonly actor: ActorContext | undefined;
  }
) {
  const canReadDiagnostics = canReadRuntimeDiagnostics(input.actor);

  return {
    service: "benh-vien-so-api",
    product: "WiiiCare Nexus",
    version: input.apiVersion,
    publicApiBaseUrl: input.publicApiBaseUrl,
    checkedAt: new Date().toISOString(),
    operationalDiagnostics: canReadDiagnostics
      ? { available: true }
      : {
          available: false,
          reason: "Cần phiên admin/auditor với PurposeOfUse phù hợp để xem metadata vận hành."
        },
    features: {
      apiDocsEnabled: canReadDiagnostics ? input.apiDocsEnabled : null,
      recordTransferDeliveryAttempts: true,
      recordTransferDeliveryWorkerEnabled: canReadDiagnostics
        ? input.recordTransferDeliveryWorkerEnabled
        : null,
      recordTransferRetryWorkerEnabled: canReadDiagnostics
        ? input.recordTransferRetryWorkerEnabled
        : null
    },
    ...(canReadDiagnostics
      ? {
          repository: readRepositoryName(),
          nodeEnv: process.env.NODE_ENV ?? "development",
          httpBodyLimitBytes: input.httpBodyLimitBytes
        }
      : {})
  };
}

function canReadRuntimeDiagnostics(actor: ActorContext | undefined): boolean {
  if (!actor) {
    return false;
  }

  if (actor.role === "admin") {
    return actor.purposeOfUse === "OPERATIONS" || actor.purposeOfUse === "AUDIT";
  }

  return actor.role === "auditor" && actor.purposeOfUse === "AUDIT";
}

function readRepositoryName(): string {
  return process.env.BVS_REPOSITORY ?? "in-memory";
}
