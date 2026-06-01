import type { ReactNode } from "react";
import type {
  ClinicalRecordCollections,
  ClinicalRecordSelectedIds,
  ClinicalRecordSelections
} from "./clinicalRecordPanelRendererDataTypes.js";
import type {
  ClinicalRecordForms,
  ClinicalRecordPanelHandlers
} from "./clinicalRecordPanelRendererCommandTypes.js";
import type {
  ClinicalRecordLoadingState,
  ClinicalRecordSubmittingState
} from "./clinicalRecordPanelRendererStatusTypes.js";

export type BuildClinicalRecordPanelRenderersOptions = {
  readonly collections: ClinicalRecordCollections;
  readonly forms: ClinicalRecordForms;
  readonly handlers: ClinicalRecordPanelHandlers;
  readonly isFinishingEncounter: boolean;
  readonly isWriteDisabled: boolean;
  readonly loading: ClinicalRecordLoadingState;
  readonly selectedIds: ClinicalRecordSelectedIds;
  readonly selections: ClinicalRecordSelections;
  readonly submitting: ClinicalRecordSubmittingState;
};

export type ClinicalRecordPanelRenderers = {
  readonly allergyIntolerance: () => ReactNode;
  readonly condition: () => ReactNode;
  readonly diagnosticReport: () => ReactNode;
  readonly encounter: () => ReactNode;
  readonly imagingStudy: () => ReactNode;
  readonly medicationAdministration: () => ReactNode;
  readonly medicationDispense: () => ReactNode;
  readonly medicationRequest: () => ReactNode;
  readonly observation: () => ReactNode;
  readonly procedure: () => ReactNode;
  readonly serviceRequest: () => ReactNode;
  readonly workflowTask: () => ReactNode;
};
