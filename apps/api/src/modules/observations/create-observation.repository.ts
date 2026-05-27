import type { ObservationRepository } from "@benh-vien-so/domain";
import {
  InMemoryObservationRepository,
  createSeedObservations
} from "./in-memory-observation.repository.js";
import {
  PostgresObservationRepository,
  seedObservationsIfEmpty
} from "../../infrastructure/postgres/postgres-observation.repository.js";

export async function createObservationRepository(): Promise<ObservationRepository> {
  const seedObservations = createSeedObservations();

  if (process.env.BVS_REPOSITORY === "postgres") {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required when BVS_REPOSITORY=postgres.");
    }

    const repository = new PostgresObservationRepository(databaseUrl);
    await seedObservationsIfEmpty(repository, seedObservations);
    return repository;
  }

  return new InMemoryObservationRepository(seedObservations);
}
