import type { ClinicalApiClient } from "../api/clinicalApi.js";
import type { useClinicalRecordState } from "../features/clinical-records/clinicalRecordState.js";
import { buildPatientWorkspaceCollectionLoaders } from "../features/patient-workspace/patientWorkspaceCollectionLoaders.js";

type ClinicalRecordState = ReturnType<typeof useClinicalRecordState>;

type BuildAppPatientWorkspaceLoadersInput = {
  readonly clinicalApi: ClinicalApiClient;
  readonly clinicalRecordState: ClinicalRecordState;
  readonly setStatusMessage: (message: string) => void;
};

export function buildAppPatientWorkspaceLoaders({
  clinicalApi,
  clinicalRecordState,
  setStatusMessage
}: BuildAppPatientWorkspaceLoadersInput) {
  return buildPatientWorkspaceCollectionLoaders({
    clinicalApi,
    ...clinicalRecordState,
    setStatusMessage
  });
}
