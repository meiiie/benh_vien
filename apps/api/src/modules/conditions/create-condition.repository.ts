import type { ConditionRepository } from "@benh-vien-so/domain";
import {
  InMemoryConditionRepository,
  createSeedConditions
} from "./in-memory-condition.repository.js";
import {
  PostgresConditionRepository,
  seedConditionsIfEmpty
} from "../../infrastructure/postgres/postgres-condition.repository.js";

export async function createConditionRepository(): Promise<ConditionRepository> {
  const seedConditions = createSeedConditions();

  if (process.env.BVS_REPOSITORY === "postgres") {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required when BVS_REPOSITORY=postgres.");
    }

    const repository = new PostgresConditionRepository(databaseUrl);
    await seedConditionsIfEmpty(repository, seedConditions);
    return repository;
  }

  return new InMemoryConditionRepository(seedConditions);
}
