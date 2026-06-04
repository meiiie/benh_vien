import { createAllergyIntoleranceRepository } from "../allergy-intolerances/create-allergy-intolerance.repository.js";
import { createClinicalDocumentRepository } from "../clinical-documents/create-clinical-document.repository.js";
import { createConditionRepository } from "../conditions/create-condition.repository.js";
import { createEncounterRepository } from "../encounters/create-encounter.repository.js";
import { createObservationRepository } from "../observations/create-observation.repository.js";
import type {
  ApiRepositories,
  ApiRepositoryOptions
} from "./api-repository.types.js";
import type { TrackRepository } from "./api-repository-lifecycle.js";

type ClinicalRepositories = Pick<
  ApiRepositories,
  | "encounterRepository"
  | "allergyIntoleranceRepository"
  | "conditionRepository"
  | "observationRepository"
  | "clinicalDocumentRepository"
>;

export async function createClinicalRepositories(
  options: ApiRepositoryOptions,
  trackRepository: TrackRepository
): Promise<ClinicalRepositories> {
  return {
    encounterRepository:
      options.encounterRepository ?? trackRepository(await createEncounterRepository()),
    allergyIntoleranceRepository:
      options.allergyIntoleranceRepository ??
      trackRepository(await createAllergyIntoleranceRepository()),
    conditionRepository:
      options.conditionRepository ?? trackRepository(await createConditionRepository()),
    observationRepository:
      options.observationRepository ?? trackRepository(await createObservationRepository()),
    clinicalDocumentRepository:
      options.clinicalDocumentRepository ??
      trackRepository(await createClinicalDocumentRepository())
  };
}
