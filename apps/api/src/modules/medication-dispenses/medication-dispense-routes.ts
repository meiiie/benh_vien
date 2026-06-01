import type { FastifyInstance } from "fastify";
import type {
  AuditEventRepository,
  EncounterRepository,
  MedicationDispenseRepository,
  MedicationRequestRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { registerMedicationDispenseCreationRoutes } from "./medication-dispense-creation-routes.js";
import { registerMedicationDispenseFhirRoutes } from "./medication-dispense-fhir-routes.js";
import { registerMedicationDispenseQueryRoutes } from "./medication-dispense-query-routes.js";

export async function registerMedicationDispenseRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  medicationRequestRepository: MedicationRequestRepository,
  medicationDispenseRepository: MedicationDispenseRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  await registerMedicationDispenseQueryRoutes(
    app,
    patientRepository,
    medicationDispenseRepository,
    providerDirectoryRepository,
    auditRepository
  );

  await registerMedicationDispenseCreationRoutes(
    app,
    patientRepository,
    encounterRepository,
    medicationRequestRepository,
    medicationDispenseRepository,
    providerDirectoryRepository,
    auditRepository
  );

  await registerMedicationDispenseFhirRoutes(
    app,
    patientRepository,
    medicationDispenseRepository,
    providerDirectoryRepository,
    auditRepository
  );
}
