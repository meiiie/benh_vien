import type { FastifyInstance } from "fastify";
import type {
  AuditEventRepository,
  ProviderDirectoryRepository,
  RecordTransferRepository
} from "@benh-vien-so/domain";
import { handleRecordTransferAcknowledgementCallback } from "./record-transfer-acknowledgement-handler.js";
import type { RecordTransferAcknowledgementRouteDependencies } from "./record-transfer-acknowledgement-route-dependencies.js";

export async function registerRecordTransferAcknowledgementRoutes(
  app: FastifyInstance,
  recordTransferRepository: RecordTransferRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  const dependencies: RecordTransferAcknowledgementRouteDependencies = {
    recordTransferRepository,
    providerDirectoryRepository,
    auditRepository
  };

  app.post("/record-transfers/:id/acknowledgement-callback", (request, reply) =>
    handleRecordTransferAcknowledgementCallback(request, reply, dependencies)
  );
}
