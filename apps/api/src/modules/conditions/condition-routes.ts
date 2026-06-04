import type { FastifyInstance } from "fastify";
import type {
  AuditEventRepository,
  ConditionRepository,
  EncounterRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { registerConditionCreationRoutes } from "./condition-creation-routes.js";
import { registerConditionFhirRoutes } from "./condition-fhir-routes.js";
import { registerConditionQueryRoutes } from "./condition-query-routes.js";

export async function registerConditionRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  conditionRepository: ConditionRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  await registerConditionQueryRoutes(
    app,
    patientRepository,
    conditionRepository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerConditionCreationRoutes(
    app,
    patientRepository,
    encounterRepository,
    conditionRepository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerConditionFhirRoutes(
    app,
    patientRepository,
    conditionRepository,
    providerDirectoryRepository,
    auditRepository
  );
}
