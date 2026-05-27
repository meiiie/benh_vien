import type { ConsentRepository } from "@benh-vien-so/domain";
import {
  InMemoryConsentRepository,
  createSeedConsents
} from "./in-memory-consent.repository.js";
import {
  PostgresConsentRepository,
  seedConsentsIfEmpty
} from "../../infrastructure/postgres/postgres-consent.repository.js";

export async function createConsentRepository(): Promise<ConsentRepository> {
  const seedConsents = createSeedConsents();

  if (process.env.BVS_REPOSITORY === "postgres") {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required when BVS_REPOSITORY=postgres.");
    }

    const repository = new PostgresConsentRepository(databaseUrl);
    await seedConsentsIfEmpty(repository, seedConsents);
    return repository;
  }

  return new InMemoryConsentRepository(seedConsents);
}
