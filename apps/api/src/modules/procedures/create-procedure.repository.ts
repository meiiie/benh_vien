import type { ProcedureRepository } from "@benh-vien-so/domain";
import {
  PostgresProcedureRepository,
  seedProceduresIfEmpty
} from "../../infrastructure/postgres/postgres-procedure.repository.js";
import {
  createSeedProcedures,
  InMemoryProcedureRepository
} from "./in-memory-procedure.repository.js";

export async function createProcedureRepository(): Promise<ProcedureRepository> {
  if (process.env.BVS_REPOSITORY === "postgres") {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL is required when BVS_REPOSITORY=postgres");
    }

    const repository = new PostgresProcedureRepository(connectionString);
    await seedProceduresIfEmpty(repository, createSeedProcedures());
    return repository;
  }

  return new InMemoryProcedureRepository(createSeedProcedures());
}
