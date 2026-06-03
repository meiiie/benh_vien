import type { FormEvent } from "react";
import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type { NewAllergyIntoleranceForm } from "../../types/allergies.js";
import type { AppRoute } from "../../types/appRuntime.js";
import type { NewConditionForm } from "../../types/conditions.js";
import type { NewObservationForm } from "../../types/observations.js";
import type { Patient } from "../../types/patientRegistry.js";

export type ClinicalEntrySubmitHandler = (
  event: FormEvent<HTMLFormElement>
) => Promise<void>;

export type EnsureSelectedWritablePatient = (
  emptyMessage: string
) => Patient | undefined;

export type ClinicalEntryHandlerConfig = {
  readonly allergyIntoleranceForm: NewAllergyIntoleranceForm;
  readonly clinicalApi: ClinicalApiClient;
  readonly conditionForm: NewConditionForm;
  readonly ensureSelectedPatientWritable: () => boolean;
  readonly loadAllergyIntolerances: (
    patientId: string,
    nextSelectedAllergyIntoleranceId?: string
  ) => Promise<void>;
  readonly loadAuditEvents: (
    patientId: string,
    options?: { readonly silent?: boolean }
  ) => Promise<void>;
  readonly loadConditions: (
    patientId: string,
    nextSelectedConditionId?: string
  ) => Promise<void>;
  readonly loadObservations: (
    patientId: string,
    nextSelectedObservationId?: string
  ) => Promise<void>;
  readonly loadPatientFhirBundlePreview: (patientId: string) => Promise<void>;
  readonly observationForm: NewObservationForm;
  readonly selectedPatient: Patient | undefined;
  readonly setAppRoute: (route: AppRoute) => void;
  readonly setIsSubmittingAllergyIntolerance: (isSubmitting: boolean) => void;
  readonly setIsSubmittingCondition: (isSubmitting: boolean) => void;
  readonly setIsSubmittingObservation: (isSubmitting: boolean) => void;
  readonly setStatusMessage: (message: string) => void;
};

export type ClinicalEntryHandlers = {
  readonly handleCreateAllergyIntolerance: ClinicalEntrySubmitHandler;
  readonly handleCreateCondition: ClinicalEntrySubmitHandler;
  readonly handleCreateObservation: ClinicalEntrySubmitHandler;
};
