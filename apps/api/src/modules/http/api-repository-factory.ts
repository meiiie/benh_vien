import { createAuditRepositories } from "./api-audit-repositories.js";
import { createCareWorkflowRepositories } from "./api-care-workflow-repositories.js";
import { createClinicalRepositories } from "./api-clinical-repositories.js";
import { createDiagnosticRepositories } from "./api-diagnostic-repositories.js";
import { createIdentityRepositories } from "./api-identity-repositories.js";
import { createInteroperabilityRepositories } from "./api-interoperability-repositories.js";
import { createMedicationRepositories } from "./api-medication-repositories.js";
import { createRepositoryLifecycle } from "./api-repository-lifecycle.js";
import type {
  ApiRepositories,
  ApiRepositoryOptions,
  CreatedApiRepositories
} from "./api-repository.types.js";

export async function createApiRepositories(
  options: ApiRepositoryOptions = {}
): Promise<CreatedApiRepositories> {
  const lifecycle = createRepositoryLifecycle();
  const repositories: ApiRepositories = {
    ...(await createIdentityRepositories(options, lifecycle.track)),
    ...(await createClinicalRepositories(options, lifecycle.track)),
    ...(await createMedicationRepositories(options, lifecycle.track)),
    ...(await createCareWorkflowRepositories(options, lifecycle.track)),
    ...(await createDiagnosticRepositories(options, lifecycle.track)),
    ...(await createInteroperabilityRepositories(options, lifecycle.track)),
    ...(await createAuditRepositories(options, lifecycle.track))
  };

  return {
    repositories,
    close: lifecycle.close
  };
}
