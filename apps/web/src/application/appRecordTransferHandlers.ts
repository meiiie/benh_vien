import type { ClinicalApiClient } from "../api/clinicalApi.js";
import type { useInteroperabilityState } from "../features/interoperability/interoperabilityState.js";
import { buildRecordTransferHandlers } from "../features/record-transfers/recordTransferHandlers.js";
import type { Patient } from "../types/patientRegistry.js";

type InteroperabilityState = ReturnType<typeof useInteroperabilityState>;
type RecordTransferHandlerConfig =
  Parameters<typeof buildRecordTransferHandlers>[0];

type BuildAppRecordTransferHandlersInput = {
  readonly clinicalApi: ClinicalApiClient;
  readonly ensureSelectedPatientWritable: () => boolean;
  readonly interoperabilityState: InteroperabilityState;
  readonly loadRecordTransferDeliveryAttempts:
    RecordTransferHandlerConfig["loadRecordTransferDeliveryAttempts"];
  readonly loadRecordTransferFhirTaskPreview:
    RecordTransferHandlerConfig["loadRecordTransferFhirTaskPreview"];
  readonly loadRecordTransfers:
    RecordTransferHandlerConfig["loadRecordTransfers"];
  readonly selectedPatient: Patient | undefined;
  readonly setStatusMessage: (message: string) => void;
};

export function buildAppRecordTransferHandlers({
  clinicalApi,
  ensureSelectedPatientWritable,
  interoperabilityState,
  loadRecordTransferDeliveryAttempts,
  loadRecordTransferFhirTaskPreview,
  loadRecordTransfers,
  selectedPatient,
  setStatusMessage
}: BuildAppRecordTransferHandlersInput) {
  return buildRecordTransferHandlers({
    clinicalApi,
    ensureSelectedPatientWritable,
    ...interoperabilityState,
    loadRecordTransferDeliveryAttempts,
    loadRecordTransferFhirTaskPreview,
    loadRecordTransfers,
    selectedPatient,
    setStatusMessage
  });
}
