import type { FastifyInstance } from "fastify";
import { registerAllergyIntoleranceRoutes } from "../allergy-intolerances/allergy-intolerance-routes.js";
import { registerConditionRoutes } from "../conditions/condition-routes.js";
import { registerEncounterRoutes } from "../encounters/encounter-routes.js";
import { registerObservationRoutes } from "../observations/observation-routes.js";
import type { ApiRoutesDependencies } from "./api-route-dependencies.js";

export async function registerApiClinicalRoutes(
  api: FastifyInstance,
  dependencies: ApiRoutesDependencies
): Promise<void> {
  await registerEncounterRoutes(
    api,
    dependencies.patientRepository,
    dependencies.encounterRepository,
    dependencies.providerDirectoryRepository,
    dependencies.auditEventRepository
  );
  await registerAllergyIntoleranceRoutes(
    api,
    dependencies.patientRepository,
    dependencies.encounterRepository,
    dependencies.allergyIntoleranceRepository,
    dependencies.providerDirectoryRepository,
    dependencies.auditEventRepository
  );
  await registerConditionRoutes(
    api,
    dependencies.patientRepository,
    dependencies.encounterRepository,
    dependencies.conditionRepository,
    dependencies.providerDirectoryRepository,
    dependencies.auditEventRepository
  );
  await registerObservationRoutes(
    api,
    dependencies.patientRepository,
    dependencies.encounterRepository,
    dependencies.observationRepository,
    dependencies.providerDirectoryRepository,
    dependencies.auditEventRepository
  );
}
