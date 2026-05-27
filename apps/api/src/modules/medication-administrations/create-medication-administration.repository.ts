import type { MedicationAdministrationRepository } from "@benh-vien-so/domain";
import {
  PostgresMedicationAdministrationRepository,
  seedMedicationAdministrationsIfEmpty
} from "../../infrastructure/postgres/postgres-medication-administration.repository.js";
import {
  createSeedMedicationAdministrations,
  InMemoryMedicationAdministrationRepository
} from "./in-memory-medication-administration.repository.js";

export async function createMedicationAdministrationRepository(): Promise<MedicationAdministrationRepository> {
  if (process.env.BVS_REPOSITORY === "postgres") {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL is required when BVS_REPOSITORY=postgres");
    }

    const repository = new PostgresMedicationAdministrationRepository(connectionString);
    await seedMedicationAdministrationsIfEmpty(
      repository,
      createSeedMedicationAdministrations()
    );
    return repository;
  }

  return new InMemoryMedicationAdministrationRepository(
    createSeedMedicationAdministrations()
  );
}
