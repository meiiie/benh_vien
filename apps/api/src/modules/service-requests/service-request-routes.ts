import type { FastifyInstance } from "fastify";
import type {
  AuditEventRepository,
  ConditionRepository,
  EncounterRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  ServiceRequestRepository,
} from "@benh-vien-so/domain";
import { registerServiceRequestCreationRoutes } from "./service-request-creation-routes.js";
import { registerServiceRequestFhirRoutes } from "./service-request-fhir-routes.js";
import { registerServiceRequestQueryRoutes } from "./service-request-query-routes.js";

export async function registerServiceRequestRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  conditionRepository: ConditionRepository,
  serviceRequestRepository: ServiceRequestRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  await registerServiceRequestQueryRoutes(
    app,
    patientRepository,
    serviceRequestRepository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerServiceRequestCreationRoutes(
    app,
    patientRepository,
    encounterRepository,
    conditionRepository,
    serviceRequestRepository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerServiceRequestFhirRoutes(
    app,
    patientRepository,
    serviceRequestRepository,
    providerDirectoryRepository,
    auditRepository
  );
}
