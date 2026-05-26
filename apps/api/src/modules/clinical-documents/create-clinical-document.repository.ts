import type { ClinicalDocumentRepository } from "@benh-vien-so/domain";
import {
  PostgresClinicalDocumentRepository,
  seedClinicalDocumentsIfEmpty
} from "../../infrastructure/postgres/postgres-clinical-document.repository.js";
import {
  InMemoryClinicalDocumentRepository,
  createSeedClinicalDocuments
} from "./in-memory-clinical-document.repository.js";

export async function createClinicalDocumentRepository(): Promise<ClinicalDocumentRepository> {
  const seedDocuments = createSeedClinicalDocuments();

  if (process.env.BVS_REPOSITORY === "postgres") {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required when BVS_REPOSITORY=postgres.");
    }

    const repository = new PostgresClinicalDocumentRepository(databaseUrl);
    await seedClinicalDocumentsIfEmpty(repository, seedDocuments);
    return repository;
  }

  return new InMemoryClinicalDocumentRepository(seedDocuments);
}
