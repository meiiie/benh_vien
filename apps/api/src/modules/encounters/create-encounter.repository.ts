import type { EncounterRepository } from "@benh-vien-so/domain";
import {
  PostgresEncounterRepository,
  seedEncountersIfEmpty
} from "../../infrastructure/postgres/postgres-encounter.repository.js";
import {
  InMemoryEncounterRepository,
  createSeedEncounters
} from "./in-memory-encounter.repository.js";

export async function createEncounterRepository(): Promise<EncounterRepository> {
  const seedEncounters = createSeedEncounters();

  if (process.env.BVS_REPOSITORY === "postgres") {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required when BVS_REPOSITORY=postgres.");
    }

    const repository = new PostgresEncounterRepository(databaseUrl);
    await seedEncountersIfEmpty(repository, seedEncounters);
    return repository;
  }

  return new InMemoryEncounterRepository(seedEncounters);
}
