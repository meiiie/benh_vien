import type { FastifyInstance } from "fastify";
import type { PatientRepository, ProviderDirectoryRepository } from "@benh-vien-so/domain";
import type { LoginRateLimiter } from "../auth/login-rate-limit.js";
import { readRepositoryName } from "./system-runtime-info.js";

export type SystemRoutesOptions = {
  readonly patientRepository: PatientRepository;
  readonly providerDirectoryRepository: ProviderDirectoryRepository;
  readonly loginRateLimiter: LoginRateLimiter;
};

export function registerReadinessRoutes(
  app: FastifyInstance,
  options: SystemRoutesOptions
): void {
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
