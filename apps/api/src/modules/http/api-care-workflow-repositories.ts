import { createProcedureRepository } from "../procedures/create-procedure.repository.js";
import { createServiceRequestRepository } from "../service-requests/create-service-request.repository.js";
import { createWorkflowTaskRepository } from "../workflow-tasks/create-workflow-task.repository.js";
import type {
  ApiRepositories,
  ApiRepositoryOptions
} from "./api-repository.types.js";
import type { TrackRepository } from "./api-repository-lifecycle.js";

type CareWorkflowRepositories = Pick<
  ApiRepositories,
  "serviceRequestRepository" | "workflowTaskRepository" | "procedureRepository"
>;

export async function createCareWorkflowRepositories(
  options: ApiRepositoryOptions,
  trackRepository: TrackRepository
): Promise<CareWorkflowRepositories> {
  return {
    serviceRequestRepository:
      options.serviceRequestRepository ??
      trackRepository(await createServiceRequestRepository()),
    workflowTaskRepository:
      options.workflowTaskRepository ?? trackRepository(await createWorkflowTaskRepository()),
    procedureRepository:
      options.procedureRepository ?? trackRepository(await createProcedureRepository())
  };
}
