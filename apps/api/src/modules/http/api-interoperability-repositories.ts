import { createConsentRepository } from "../consents/create-consent.repository.js";
import { createRecordTransferDeliveryAttemptRepository } from "../record-transfer-delivery-attempts/create-record-transfer-delivery-attempt.repository.js";
import { createRecordTransferRepository } from "../record-transfers/create-record-transfer.repository.js";
import type {
  ApiRepositories,
  ApiRepositoryOptions
} from "./api-repository.types.js";
import type { TrackRepository } from "./api-repository-lifecycle.js";

type InteroperabilityRepositories = Pick<
  ApiRepositories,
  | "consentRepository"
  | "recordTransferRepository"
  | "recordTransferDeliveryAttemptRepository"
>;

export async function createInteroperabilityRepositories(
  options: ApiRepositoryOptions,
  trackRepository: TrackRepository
): Promise<InteroperabilityRepositories> {
  return {
    consentRepository:
      options.consentRepository ?? trackRepository(await createConsentRepository()),
    recordTransferRepository:
      options.recordTransferRepository ??
      trackRepository(await createRecordTransferRepository()),
    recordTransferDeliveryAttemptRepository:
      options.recordTransferDeliveryAttemptRepository ??
      trackRepository(await createRecordTransferDeliveryAttemptRepository())
  };
}
