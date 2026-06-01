import type { FastifyInstance } from "fastify";
import type {
  AuditEventRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  RecordTransferDeliveryAttemptRepository,
  RecordTransferRepository
} from "@benh-vien-so/domain";
import { registerRecordTransferFailureRoutes } from "./record-transfer-failure-routes.js";
import { registerRecordTransferReceiveRoutes } from "./record-transfer-receive-routes.js";
import { registerRecordTransferSendRoutes } from "./record-transfer-send-routes.js";

export async function registerRecordTransferCommandRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  recordTransferRepository: RecordTransferRepository,
  deliveryAttemptRepository: RecordTransferDeliveryAttemptRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  await registerRecordTransferSendRoutes(
    app,
    patientRepository,
    recordTransferRepository,
    deliveryAttemptRepository,
    providerDirectoryRepository,
    auditRepository
  );

  await registerRecordTransferReceiveRoutes(
    app,
    patientRepository,
    recordTransferRepository,
    providerDirectoryRepository,
    auditRepository
  );

  await registerRecordTransferFailureRoutes(
    app,
    patientRepository,
    recordTransferRepository,
    providerDirectoryRepository,
    auditRepository
  );
}
