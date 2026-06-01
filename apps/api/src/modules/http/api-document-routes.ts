import type { FastifyInstance } from "fastify";
import { registerClinicalDocumentRoutes } from "../clinical-documents/clinical-document-routes.js";
import type { ApiRoutesDependencies } from "./api-route-dependencies.js";

export async function registerApiDocumentRoutes(
  api: FastifyInstance,
  dependencies: ApiRoutesDependencies
): Promise<void> {
  await registerClinicalDocumentRoutes(
    api,
    dependencies.patientRepository,
    dependencies.encounterRepository,
    dependencies.clinicalDocumentRepository,
    dependencies.providerDirectoryRepository,
    dependencies.auditEventRepository
  );
}
