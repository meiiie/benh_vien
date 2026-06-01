import type { FastifyInstance } from "fastify";
import type {
  AuditEventRepository,
  ConditionRepository,
  EncounterRepository,
  MedicationAdministrationRepository,
  MedicationRequestRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { registerMedicationAdministrationCreationRoutes } from "./medication-administration-creation-routes.js";
import { registerMedicationAdministrationFhirRoutes } from "./medication-administration-fhir-routes.js";
import { registerMedicationAdministrationQueryRoutes } from "./medication-administration-query-routes.js";

export async function registerMedicationAdministrationRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  conditionRepository: ConditionRepository,
  medicationRequestRepository: MedicationRequestRepository,
  medicationAdministrationRepository: MedicationAdministrationRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  await registerMedicationAdministrationQueryRoutes(
    app,
    patientRepository,
    medicationAdministrationRepository,
    providerDirectoryRepository,
    auditRepository
  );

  await registerMedicationAdministrationCreationRoutes(
    app,
    patientRepository,
    encounterRepository,
    conditionRepository,
    medicationRequestRepository,
    medicationAdministrationRepository,
    providerDirectoryRepository,
    auditRepository
  );

  await registerMedicationAdministrationFhirRoutes(
    app,
    patientRepository,
    medicationAdministrationRepository,
    providerDirectoryRepository,
    auditRepository
  );
}
