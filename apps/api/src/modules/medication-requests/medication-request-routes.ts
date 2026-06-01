import type { FastifyInstance } from "fastify";
import type {
  AuditEventRepository,
  ConditionRepository,
  EncounterRepository,
  MedicationRequestRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { registerMedicationRequestCreationRoutes } from "./medication-request-creation-routes.js";
import { registerMedicationRequestFhirRoutes } from "./medication-request-fhir-routes.js";
import { registerMedicationRequestQueryRoutes } from "./medication-request-query-routes.js";

export async function registerMedicationRequestRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  conditionRepository: ConditionRepository,
  medicationRequestRepository: MedicationRequestRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  await registerMedicationRequestQueryRoutes(
    app,
    patientRepository,
    medicationRequestRepository,
    providerDirectoryRepository,
    auditRepository
  );

  await registerMedicationRequestCreationRoutes(
    app,
    patientRepository,
    encounterRepository,
    conditionRepository,
    medicationRequestRepository,
    providerDirectoryRepository,
    auditRepository
  );

  await registerMedicationRequestFhirRoutes(
    app,
    patientRepository,
    medicationRequestRepository,
    providerDirectoryRepository,
    auditRepository
  );
}
