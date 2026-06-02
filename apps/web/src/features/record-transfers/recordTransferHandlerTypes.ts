import type { Patient } from "../../types/patientRegistry.js";
import type {
  GatewayAcknowledgementForm,
  NewRecordTransferForm,
  RecordTransfer
} from "../../types/recordTransfers.js";
import type { ClinicalApiClient } from "../../api/clinicalApi.js";

export type RecordTransferHandlerConfig = {
  readonly clinicalApi: ClinicalApiClient;
  readonly ensureSelectedPatientWritable: () => boolean;
  readonly gatewayAcknowledgementForm: GatewayAcknowledgementForm;
  readonly loadRecordTransferDeliveryAttempts: (
    recordTransferId: string
  ) => Promise<void>;
  readonly loadRecordTransferFhirTaskPreview: (
    recordTransferId: string
  ) => Promise<void>;
  readonly loadRecordTransfers: (
    patientId: string,
    nextSelectedRecordTransferId?: string
  ) => Promise<void>;
  readonly recordTransferForm: NewRecordTransferForm;
  readonly selectedPatient: Patient | undefined;
  readonly setGatewayAcknowledgementResult: (
    recordTransfer: RecordTransfer | undefined
  ) => void;
  readonly setIsSubmittingGatewayAcknowledgement: (isSubmitting: boolean) => void;
  readonly setIsSubmittingRecordTransfer: (isSubmitting: boolean) => void;
  readonly setStatusMessage: (message: string) => void;
  readonly setTransitioningRecordTransferId: (
    recordTransferId: string | undefined
  ) => void;
};

export type EnsureSelectedWritablePatient = (
  emptyMessage: string
) => Patient | undefined;

export type RefreshSelectedTransfer = (
  selectedPatient: Patient,
  recordTransferId: string
) => Promise<void>;
