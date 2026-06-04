import type { FastifyInstance } from "fastify";
import type {
  AuditEventRepository,
  EncounterRepository,
  ObservationRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { registerObservationCreationRoutes } from "./observation-creation-routes.js";
import { registerObservationFhirRoutes } from "./observation-fhir-routes.js";
import { registerObservationQueryRoutes } from "./observation-query-routes.js";

export async function registerObservationRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  observationRepository: ObservationRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  await registerObservationQueryRoutes(
    app,
    patientRepository,
    observationRepository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerObservationCreationRoutes(
    app,
    patientRepository,
    encounterRepository,
    observationRepository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerObservationFhirRoutes(
    app,
    patientRepository,
    observationRepository,
    providerDirectoryRepository,
    auditRepository
  );
}
