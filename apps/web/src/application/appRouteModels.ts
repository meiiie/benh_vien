import type { ReactNode } from "react";

export type ReferenceSignal = {
  readonly name: string;
  readonly value: string;
};

export type AppRoutePanels = {
  readonly allergyIntolerance: () => ReactNode;
  readonly audit: () => ReactNode;
  readonly clinicalDocument: () => ReactNode;
  readonly condition: () => ReactNode;
  readonly consentInterop: () => ReactNode;
  readonly createPatient: () => ReactNode;
  readonly diagnosticReport: () => ReactNode;
  readonly encounter: () => ReactNode;
  readonly globalAudit: () => ReactNode;
  readonly imagingStudy: () => ReactNode;
  readonly medicationAdministration: () => ReactNode;
  readonly medicationDispense: () => ReactNode;
  readonly medicationRequest: () => ReactNode;
  readonly observation: () => ReactNode;
  readonly patientDetail: () => ReactNode;
  readonly patientList: () => ReactNode;
  readonly patientMerge: () => ReactNode;
  readonly procedure: () => ReactNode;
  readonly providerDirectory: () => ReactNode;
  readonly recordTransferInterop: () => ReactNode;
  readonly serviceRequest: () => ReactNode;
  readonly workflowTask: () => ReactNode;
};

export type FhirPreviewValues = {
  readonly allergyIntolerance: unknown;
  readonly capabilityStatement: unknown;
  readonly condition: unknown;
  readonly consent: unknown;
  readonly diagnosticReport: unknown;
  readonly document: unknown;
  readonly documentProvenance: unknown;
  readonly encounter: unknown;
  readonly imagingStudy: unknown;
  readonly medicationAdministration: unknown;
  readonly medicationDispense: unknown;
  readonly medicationRequest: unknown;
  readonly observation: unknown;
  readonly patient: unknown;
  readonly patientBundle: unknown;
  readonly patientDocumentBundle: unknown;
  readonly procedure: unknown;
  readonly providerDirectory: unknown;
  readonly recordTransferTask: unknown;
  readonly serviceRequest: unknown;
  readonly workflowTask: unknown;
};

export type AppRouteRuntimeContext = {
  readonly fhirPreviews: FhirPreviewValues;
  readonly latestEncounterServiceType?: string;
};
