import type { FormEvent } from "react";
import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type { AppRoute } from "../../types/appRuntime.js";
import type {
  NewMedicationAdministrationForm,
  NewMedicationDispenseForm,
  NewMedicationRequestForm
} from "../../types/medications.js";
import type { Patient } from "../../types/patientRegistry.js";

export type MedicationSubmitHandler = (
  event: FormEvent<HTMLFormElement>
) => Promise<void>;

export type EnsureSelectedWritablePatient = (
  emptyMessage: string
) => Patient | undefined;

export type MedicationHandlerConfig = {
  readonly clinicalApi: ClinicalApiClient;
  readonly ensureSelectedPatientWritable: () => boolean;
  readonly loadAuditEvents: (
    patientId: string,
    options?: { readonly silent?: boolean }
  ) => Promise<void>;
  readonly loadMedicationAdministrations: (
    patientId: string,
    nextSelectedMedicationAdministrationId?: string
  ) => Promise<void>;
  readonly loadMedicationDispenses: (
    patientId: string,
    nextSelectedMedicationDispenseId?: string
  ) => Promise<void>;
  readonly loadMedicationRequests: (
    patientId: string,
    nextSelectedMedicationRequestId?: string
  ) => Promise<void>;
  readonly loadPatientFhirBundlePreview: (patientId: string) => Promise<void>;
  readonly loadPatientFhirDocumentBundlePreview: (patientId: string) => Promise<void>;
  readonly medicationAdministrationForm: NewMedicationAdministrationForm;
  readonly medicationDispenseForm: NewMedicationDispenseForm;
  readonly medicationRequestForm: NewMedicationRequestForm;
  readonly selectedPatient: Patient | undefined;
  readonly setAppRoute: (route: AppRoute) => void;
  readonly setIsSubmittingMedicationAdministration: (isSubmitting: boolean) => void;
  readonly setIsSubmittingMedicationDispense: (isSubmitting: boolean) => void;
  readonly setIsSubmittingMedicationRequest: (isSubmitting: boolean) => void;
  readonly setStatusMessage: (message: string) => void;
};

export type MedicationHandlers = {
  readonly handleCreateMedicationAdministration: MedicationSubmitHandler;
  readonly handleCreateMedicationDispense: MedicationSubmitHandler;
  readonly handleCreateMedicationRequest: MedicationSubmitHandler;
};
