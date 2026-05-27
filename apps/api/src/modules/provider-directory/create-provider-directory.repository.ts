import type { ProviderDirectoryRepository } from "@benh-vien-so/domain";
import {
  PostgresProviderDirectoryRepository,
  seedProviderDirectoryIfEmpty
} from "../../infrastructure/postgres/postgres-provider-directory.repository.js";
import {
  InMemoryProviderDirectoryRepository,
  createSeedProviderDirectory
} from "./in-memory-provider-directory.repository.js";

export async function createProviderDirectoryRepository(): Promise<ProviderDirectoryRepository> {
  const seedDirectory = createSeedProviderDirectory();

  if (process.env.BVS_REPOSITORY === "postgres") {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required when BVS_REPOSITORY=postgres.");
    }

    const repository = new PostgresProviderDirectoryRepository(databaseUrl);
    await seedProviderDirectoryIfEmpty(repository, seedDirectory);
    return repository;
  }

  return new InMemoryProviderDirectoryRepository(seedDirectory);
}
