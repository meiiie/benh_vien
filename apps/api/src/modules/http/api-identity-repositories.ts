import { createPatientRepository } from "../patients/create-patient.repository.js";
import { createProviderDirectoryRepository } from "../provider-directory/create-provider-directory.repository.js";
import type {
  ApiRepositories,
  ApiRepositoryOptions
} from "./api-repository.types.js";
import type { TrackRepository } from "./api-repository-lifecycle.js";

type IdentityRepositories = Pick<
  ApiRepositories,
  "patientRepository" | "providerDirectoryRepository"
>;

export async function createIdentityRepositories(
  options: ApiRepositoryOptions,
  trackRepository: TrackRepository
): Promise<IdentityRepositories> {
  return {
    patientRepository:
      options.patientRepository ?? trackRepository(await createPatientRepository()),
    providerDirectoryRepository:
      options.providerDirectoryRepository ??
      trackRepository(await createProviderDirectoryRepository())
  };
}
