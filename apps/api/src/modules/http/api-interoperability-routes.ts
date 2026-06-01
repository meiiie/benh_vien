import type { FastifyInstance } from "fastify";
import { registerConsentRoutes } from "../consents/consent-routes.js";
import { registerRecordTransferRoutes } from "../record-transfers/record-transfer-routes.js";
import type { ApiRoutesDependencies } from "./api-route-dependencies.js";

export async function registerApiInteroperabilityRoutes(
  api: FastifyInstance,
  dependencies: ApiRoutesDependencies
): Promise<void> {
  await registerConsentRoutes(
    api,
    dependencies.patientRepository,
    dependencies.consentRepository,
    dependencies.providerDirectoryRepository,
    dependencies.auditEventRepository
  );
  await registerRecordTransferRoutes(
    api,
    dependencies.patientRepository,
    dependencies.consentRepository,
    dependencies.recordTransferRepository,
    dependencies.recordTransferDeliveryAttemptRepository,
    dependencies.providerDirectoryRepository,
    dependencies.auditEventRepository
  );
}
