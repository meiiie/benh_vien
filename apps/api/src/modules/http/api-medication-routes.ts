import type { FastifyInstance } from "fastify";
import { registerMedicationAdministrationRoutes } from "../medication-administrations/medication-administration-routes.js";
import { registerMedicationDispenseRoutes } from "../medication-dispenses/medication-dispense-routes.js";
import { registerMedicationRequestRoutes } from "../medication-requests/medication-request-routes.js";
import type { ApiRoutesDependencies } from "./api-route-dependencies.js";

export async function registerApiMedicationRoutes(
  api: FastifyInstance,
  dependencies: ApiRoutesDependencies
): Promise<void> {
  await registerMedicationRequestRoutes(
    api,
    dependencies.patientRepository,
    dependencies.encounterRepository,
    dependencies.conditionRepository,
    dependencies.medicationRequestRepository,
    dependencies.providerDirectoryRepository,
    dependencies.auditEventRepository
  );
  await registerMedicationDispenseRoutes(
    api,
    dependencies.patientRepository,
    dependencies.encounterRepository,
    dependencies.medicationRequestRepository,
    dependencies.medicationDispenseRepository,
    dependencies.providerDirectoryRepository,
    dependencies.auditEventRepository
  );
  await registerMedicationAdministrationRoutes(
    api,
    dependencies.patientRepository,
    dependencies.encounterRepository,
    dependencies.conditionRepository,
    dependencies.medicationRequestRepository,
    dependencies.medicationAdministrationRepository,
    dependencies.providerDirectoryRepository,
    dependencies.auditEventRepository
  );
}
