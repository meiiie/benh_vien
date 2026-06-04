import type { FormEvent } from "react";
import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type { AppRoute } from "../../types/appRuntime.js";
import type {
  NewProcedureForm,
  NewServiceRequestForm
} from "../../types/careWorkflow.js";
import type {
  NewDiagnosticReportForm,
  NewImagingStudyForm
} from "../../types/diagnosticResults.js";
import type { Patient } from "../../types/patientRegistry.js";

export type CarePlanSubmitHandler = (
  event: FormEvent<HTMLFormElement>
) => Promise<void>;

export type EnsureSelectedWritablePatient = (
  emptyMessage: string
) => Patient | undefined;

export type CarePlanHandlerConfig = {
  readonly clinicalApi: ClinicalApiClient;
  readonly diagnosticReportForm: NewDiagnosticReportForm;
  readonly ensureSelectedPatientWritable: () => boolean;
  readonly imagingStudyForm: NewImagingStudyForm;
  readonly loadAuditEvents: (
    patientId: string,
    options?: { readonly silent?: boolean }
  ) => Promise<void>;
  readonly loadDiagnosticReports: (
    patientId: string,
    nextSelectedDiagnosticReportId?: string
  ) => Promise<void>;
  readonly loadImagingStudies: (
    patientId: string,
    nextSelectedImagingStudyId?: string
  ) => Promise<void>;
  readonly loadPatientFhirBundlePreview: (patientId: string) => Promise<void>;
  readonly loadPatientFhirDocumentBundlePreview: (patientId: string) => Promise<void>;
  readonly loadProcedures: (
    patientId: string,
    nextSelectedProcedureId?: string
  ) => Promise<void>;
  readonly loadServiceRequests: (
    patientId: string,
    nextSelectedServiceRequestId?: string
  ) => Promise<void>;
  readonly procedureForm: NewProcedureForm;
  readonly selectedPatient: Patient | undefined;
  readonly serviceRequestForm: NewServiceRequestForm;
  readonly setAppRoute: (route: AppRoute) => void;
  readonly setIsSubmittingDiagnosticReport: (isSubmitting: boolean) => void;
  readonly setIsSubmittingImagingStudy: (isSubmitting: boolean) => void;
  readonly setIsSubmittingProcedure: (isSubmitting: boolean) => void;
  readonly setIsSubmittingServiceRequest: (isSubmitting: boolean) => void;
  readonly setStatusMessage: (message: string) => void;
};

export type CarePlanHandlers = {
  readonly handleCreateDiagnosticReport: CarePlanSubmitHandler;
  readonly handleCreateImagingStudy: CarePlanSubmitHandler;
  readonly handleCreateProcedure: CarePlanSubmitHandler;
  readonly handleCreateServiceRequest: CarePlanSubmitHandler;
};
