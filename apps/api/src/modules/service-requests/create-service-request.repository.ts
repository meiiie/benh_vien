import type { ServiceRequestRepository } from "@benh-vien-so/domain";
import {
  PostgresServiceRequestRepository,
  seedServiceRequestsIfEmpty
} from "../../infrastructure/postgres/postgres-service-request.repository.js";
import {
  createSeedServiceRequests,
  InMemoryServiceRequestRepository
} from "./in-memory-service-request.repository.js";

export async function createServiceRequestRepository(): Promise<ServiceRequestRepository> {
  if (process.env.BVS_REPOSITORY === "postgres") {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL is required when BVS_REPOSITORY=postgres");
    }

    const repository = new PostgresServiceRequestRepository(connectionString);
    await seedServiceRequestsIfEmpty(repository, createSeedServiceRequests());
    return repository;
  }

  return new InMemoryServiceRequestRepository(createSeedServiceRequests());
}
