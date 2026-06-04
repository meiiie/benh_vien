import { createMedicationAdministrationRepository } from "../medication-administrations/create-medication-administration.repository.js";
import { createMedicationDispenseRepository } from "../medication-dispenses/create-medication-dispense.repository.js";
import { createMedicationRequestRepository } from "../medication-requests/create-medication-request.repository.js";
import type {
  ApiRepositories,
  ApiRepositoryOptions
} from "./api-repository.types.js";
import type { TrackRepository } from "./api-repository-lifecycle.js";

type MedicationRepositories = Pick<
  ApiRepositories,
  | "medicationRequestRepository"
  | "medicationDispenseRepository"
  | "medicationAdministrationRepository"
>;

export async function createMedicationRepositories(
  options: ApiRepositoryOptions,
  trackRepository: TrackRepository
): Promise<MedicationRepositories> {
  return {
    medicationRequestRepository:
      options.medicationRequestRepository ??
      trackRepository(await createMedicationRequestRepository()),
    medicationDispenseRepository:
      options.medicationDispenseRepository ??
      trackRepository(await createMedicationDispenseRepository()),
    medicationAdministrationRepository:
      options.medicationAdministrationRepository ??
      trackRepository(await createMedicationAdministrationRepository())
  };
}
