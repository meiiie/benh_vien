import type { FastifyInstance } from "fastify";
import { registerApiAuditRoutes } from "./api-audit-routes.js";
import { registerApiCareWorkflowRoutes } from "./api-care-workflow-routes.js";
import { registerApiClinicalRoutes } from "./api-clinical-routes.js";
import { registerApiDiagnosticRoutes } from "./api-diagnostic-routes.js";
import { registerApiDocumentRoutes } from "./api-document-routes.js";
import { registerApiIdentityRoutes } from "./api-identity-routes.js";
import { registerApiInteroperabilityRoutes } from "./api-interoperability-routes.js";
import { registerApiMedicationRoutes } from "./api-medication-routes.js";
import type { ApiRoutesDependencies } from "./api-route-dependencies.js";

export async function registerApiDomainRoutes(
  api: FastifyInstance,
  dependencies: ApiRoutesDependencies
): Promise<void> {
  await registerApiIdentityRoutes(api, dependencies);
  await registerApiInteroperabilityRoutes(api, dependencies);
  await registerApiClinicalRoutes(api, dependencies);
  await registerApiMedicationRoutes(api, dependencies);
  await registerApiCareWorkflowRoutes(api, dependencies);
  await registerApiDiagnosticRoutes(api, dependencies);
  await registerApiDocumentRoutes(api, dependencies);
  await registerApiAuditRoutes(api, dependencies);
}
