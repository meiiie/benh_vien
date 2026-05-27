import type { ImagingStudyRepository } from "@benh-vien-so/domain";
import {
  PostgresImagingStudyRepository,
  seedImagingStudiesIfEmpty
} from "../../infrastructure/postgres/postgres-imaging-study.repository.js";
import {
  InMemoryImagingStudyRepository,
  createSeedImagingStudies
} from "./in-memory-imaging-study.repository.js";

export async function createImagingStudyRepository(): Promise<ImagingStudyRepository> {
  const seedImagingStudies = createSeedImagingStudies();

  if (process.env.BVS_REPOSITORY === "postgres") {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required when BVS_REPOSITORY=postgres.");
    }

    const repository = new PostgresImagingStudyRepository(databaseUrl);
    await seedImagingStudiesIfEmpty(repository, seedImagingStudies);
    return repository;
  }

  return new InMemoryImagingStudyRepository(seedImagingStudies);
}
