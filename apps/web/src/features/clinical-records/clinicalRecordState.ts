import { useClinicalRecordCollectionState } from "./clinicalRecordCollectionState.js";
import { useClinicalRecordFormState } from "./clinicalRecordFormState.js";
import { useClinicalRecordStatusState } from "./clinicalRecordStatusState.js";

export function useClinicalRecordState() {
  const collections = useClinicalRecordCollectionState();
  const forms = useClinicalRecordFormState();
  const statuses = useClinicalRecordStatusState();

  return {
    ...collections,
    ...forms,
    ...statuses
  };
}
