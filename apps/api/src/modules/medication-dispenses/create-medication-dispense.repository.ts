import type { MedicationDispenseRepository } from "@benh-vien-so/domain";
import {
  PostgresMedicationDispenseRepository,
  seedMedicationDispensesIfEmpty
} from "../../infrastructure/postgres/postgres-medication-dispense.repository.js";
import {
  createSeedMedicationDispenses,
  InMemoryMedicationDispenseRepository
} from "./in-memory-medication-dispense.repository.js";

export async function createMedicationDispenseRepository(): Promise<MedicationDispenseRepository> {
  if (process.env.BVS_REPOSITORY === "postgres") {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL is required when BVS_REPOSITORY=postgres");
    }

    const repository = new PostgresMedicationDispenseRepository(connectionString);
    await seedMedicationDispensesIfEmpty(repository, createSeedMedicationDispenses());
    return repository;
  }

  return new InMemoryMedicationDispenseRepository(createSeedMedicationDispenses());
}
