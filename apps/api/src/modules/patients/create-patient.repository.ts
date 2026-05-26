import type { PatientRepository } from "@benh-vien-so/domain";
import {
  InMemoryPatientRepository,
  createSeedPatients
} from "./in-memory-patient.repository.js";
import {
  PostgresPatientRepository,
  seedPatientsIfEmpty
} from "../../infrastructure/postgres/postgres-patient.repository.js";

export async function createPatientRepository(): Promise<PatientRepository> {
  if (process.env.BVS_REPOSITORY === "postgres") {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required when BVS_REPOSITORY=postgres.");
    }

    const repository = new PostgresPatientRepository(databaseUrl);
    await seedPatientsIfEmpty(repository, createSeedPatients());
    return repository;
  }

  return new InMemoryPatientRepository(createSeedPatients());
}

