import type { RecordTransferDeliveryAttemptRepository } from "@benh-vien-so/domain";
import { PostgresRecordTransferDeliveryAttemptRepository } from "../../infrastructure/postgres/postgres-record-transfer-delivery-attempt.repository.js";
import { InMemoryRecordTransferDeliveryAttemptRepository } from "./in-memory-record-transfer-delivery-attempt.repository.js";

export async function createRecordTransferDeliveryAttemptRepository(): Promise<RecordTransferDeliveryAttemptRepository> {
  if (process.env.BVS_REPOSITORY === "postgres") {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required when BVS_REPOSITORY=postgres.");
    }

    return new PostgresRecordTransferDeliveryAttemptRepository(databaseUrl);
  }

  return new InMemoryRecordTransferDeliveryAttemptRepository();
}
