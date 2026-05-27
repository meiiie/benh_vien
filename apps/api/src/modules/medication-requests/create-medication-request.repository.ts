import type { MedicationRequestRepository } from "@benh-vien-so/domain";
import {
  PostgresMedicationRequestRepository,
  seedMedicationRequestsIfEmpty
} from "../../infrastructure/postgres/postgres-medication-request.repository.js";
import {
  createSeedMedicationRequests,
  InMemoryMedicationRequestRepository
} from "./in-memory-medication-request.repository.js";

export async function createMedicationRequestRepository(): Promise<MedicationRequestRepository> {
  if (process.env.BVS_REPOSITORY === "postgres") {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL is required when BVS_REPOSITORY=postgres");
    }

    const repository = new PostgresMedicationRequestRepository(connectionString);
    await seedMedicationRequestsIfEmpty(repository, createSeedMedicationRequests());
    return repository;
  }

  return new InMemoryMedicationRequestRepository(createSeedMedicationRequests());
}
