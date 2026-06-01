import { createAuditEventRepository } from "../audit-events/create-audit-event.repository.js";
import type {
  ApiRepositories,
  ApiRepositoryOptions
} from "./api-repository.types.js";
import type { TrackRepository } from "./api-repository-lifecycle.js";

type AuditRepositories = Pick<ApiRepositories, "auditEventRepository">;

export async function createAuditRepositories(
  options: ApiRepositoryOptions,
  trackRepository: TrackRepository
): Promise<AuditRepositories> {
  return {
    auditEventRepository:
      options.auditEventRepository ?? trackRepository(await createAuditEventRepository())
  };
}
