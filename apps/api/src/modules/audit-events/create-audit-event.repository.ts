import type { AuditEventRepository } from "@benh-vien-so/domain";
import { PostgresAuditEventRepository } from "../../infrastructure/postgres/postgres-audit-event.repository.js";
import { InMemoryAuditEventRepository } from "./in-memory-audit-event.repository.js";

export async function createAuditEventRepository(): Promise<AuditEventRepository> {
  if (process.env.BVS_REPOSITORY === "postgres") {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required when BVS_REPOSITORY=postgres.");
    }

    return new PostgresAuditEventRepository(databaseUrl);
  }

  return new InMemoryAuditEventRepository();
}
