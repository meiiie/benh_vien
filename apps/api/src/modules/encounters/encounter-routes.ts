import type { FastifyInstance } from "fastify";
import type {
  AuditEventRepository,
  EncounterRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { registerEncounterCommandRoutes } from "./encounter-command-routes.js";
import { registerEncounterCreationRoutes } from "./encounter-creation-routes.js";
import { registerEncounterFhirRoutes } from "./encounter-fhir-routes.js";
import { registerEncounterQueryRoutes } from "./encounter-query-routes.js";

export async function registerEncounterRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  await registerEncounterQueryRoutes(
    app,
    patientRepository,
    encounterRepository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerEncounterCreationRoutes(
    app,
    patientRepository,
    encounterRepository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerEncounterCommandRoutes(
    app,
    patientRepository,
    encounterRepository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerEncounterFhirRoutes(
    app,
    patientRepository,
    encounterRepository,
    providerDirectoryRepository,
    auditRepository
  );
}
