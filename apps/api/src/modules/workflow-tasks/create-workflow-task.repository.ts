import type { WorkflowTaskRepository } from "@benh-vien-so/domain";
import {
  PostgresWorkflowTaskRepository,
  seedWorkflowTasksIfEmpty
} from "../../infrastructure/postgres/postgres-workflow-task.repository.js";
import {
  createSeedWorkflowTasks,
  InMemoryWorkflowTaskRepository
} from "./in-memory-workflow-task.repository.js";

export async function createWorkflowTaskRepository(): Promise<WorkflowTaskRepository> {
  if (process.env.BVS_REPOSITORY === "postgres") {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL is required when BVS_REPOSITORY=postgres");
    }

    const repository = new PostgresWorkflowTaskRepository(connectionString);
    await seedWorkflowTasksIfEmpty(repository, createSeedWorkflowTasks());
    return repository;
  }

  return new InMemoryWorkflowTaskRepository(createSeedWorkflowTasks());
}
