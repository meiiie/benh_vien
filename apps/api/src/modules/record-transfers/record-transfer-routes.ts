import type { FastifyInstance } from "fastify";
import type {
  AuditEventRepository,
  ConsentRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  RecordTransferDeliveryAttemptRepository,
  RecordTransferRepository
} from "@benh-vien-so/domain";
import { registerRecordTransferAcknowledgementRoutes } from "./record-transfer-acknowledgement-routes.js";
import { registerRecordTransferCommandRoutes } from "./record-transfer-command-routes.js";
import { registerRecordTransferCreationRoutes } from "./record-transfer-creation-routes.js";
import { registerRecordTransferFhirRoutes } from "./record-transfer-fhir-routes.js";
import { registerRecordTransferQueryRoutes } from "./record-transfer-query-routes.js";

export async function registerRecordTransferRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  consentRepository: ConsentRepository,
  recordTransferRepository: RecordTransferRepository,
  deliveryAttemptRepository: RecordTransferDeliveryAttemptRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  await registerRecordTransferQueryRoutes(
    app,
    patientRepository,
    recordTransferRepository,
    deliveryAttemptRepository,
    providerDirectoryRepository,
    auditRepository
  );

  await registerRecordTransferCreationRoutes(
    app,
    patientRepository,
    consentRepository,
    recordTransferRepository,
    providerDirectoryRepository,
    auditRepository
  );

  await registerRecordTransferCommandRoutes(
    app,
    patientRepository,
    recordTransferRepository,
    deliveryAttemptRepository,
    providerDirectoryRepository,
    auditRepository
  );

  await registerRecordTransferAcknowledgementRoutes(
    app,
    recordTransferRepository,
    providerDirectoryRepository,
    auditRepository
  );

  await registerRecordTransferFhirRoutes(
    app,
    patientRepository,
    recordTransferRepository,
    providerDirectoryRepository,
    auditRepository
  );
}
