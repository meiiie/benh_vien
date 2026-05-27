import type { AllergyIntoleranceRepository } from "@benh-vien-so/domain";
import {
  PostgresAllergyIntoleranceRepository,
  seedAllergyIntolerancesIfEmpty
} from "../../infrastructure/postgres/postgres-allergy-intolerance.repository.js";
import {
  createSeedAllergyIntolerances,
  InMemoryAllergyIntoleranceRepository
} from "./in-memory-allergy-intolerance.repository.js";

export async function createAllergyIntoleranceRepository(): Promise<AllergyIntoleranceRepository> {
  if (process.env.BVS_REPOSITORY === "postgres") {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL is required when BVS_REPOSITORY=postgres");
    }

    const repository = new PostgresAllergyIntoleranceRepository(connectionString);
    await seedAllergyIntolerancesIfEmpty(repository, createSeedAllergyIntolerances());
    return repository;
  }

  return new InMemoryAllergyIntoleranceRepository(createSeedAllergyIntolerances());
}
