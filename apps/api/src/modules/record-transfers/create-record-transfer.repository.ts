import type { RecordTransferRepository } from "@benh-vien-so/domain";
import {
  createSeedRecordTransfers,
  InMemoryRecordTransferRepository
} from "./in-memory-record-transfer.repository.js";
import {
  PostgresRecordTransferRepository,
  seedRecordTransfersIfEmpty
} from "../../infrastructure/postgres/postgres-record-transfer.repository.js";

export async function createRecordTransferRepository(): Promise<RecordTransferRepository> {
  const seedRecordTransfers = createSeedRecordTransfers();

  if (process.env.BVS_REPOSITORY === "postgres") {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required when BVS_REPOSITORY=postgres.");
    }

    const repository = new PostgresRecordTransferRepository(databaseUrl);
    await seedRecordTransfersIfEmpty(repository, seedRecordTransfers);
    return repository;
  }

  return new InMemoryRecordTransferRepository(seedRecordTransfers);
}
