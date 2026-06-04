import type { FastifyInstance } from "fastify";
import type {
  AllergyIntoleranceRepository,
  AuditEventRepository,
  EncounterRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { registerAllergyIntoleranceCreationRoutes } from "./allergy-intolerance-creation-routes.js";
import { registerAllergyIntoleranceFhirRoutes } from "./allergy-intolerance-fhir-routes.js";
import { registerAllergyIntoleranceQueryRoutes } from "./allergy-intolerance-query-routes.js";

export async function registerAllergyIntoleranceRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  allergyIntoleranceRepository: AllergyIntoleranceRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  await registerAllergyIntoleranceQueryRoutes(
    app,
    patientRepository,
    allergyIntoleranceRepository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerAllergyIntoleranceCreationRoutes(
    app,
    patientRepository,
    encounterRepository,
    allergyIntoleranceRepository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerAllergyIntoleranceFhirRoutes(
    app,
    patientRepository,
    allergyIntoleranceRepository,
    providerDirectoryRepository,
    auditRepository
  );
}
