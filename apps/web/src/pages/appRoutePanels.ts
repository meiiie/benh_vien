import type { AuditPanelRenderers } from "../features/audit/auditPanelRenderers.js";
import type { ClinicalDocumentPanelRenderers } from "../features/clinical-documents/clinicalDocumentPanelRenderers.js";
import type { ClinicalRecordPanelRenderers } from "../features/clinical-records/clinicalRecordPanelRenderers.js";
import type { InteropPanelRenderers } from "../features/interoperability/interopPanelRenderers.js";
import type { PatientPanelRenderers } from "../features/patient-registry/patientPanelRenderers.js";
import type { AppRoutePanels } from "./AppRouteRenderer.js";

type BuildAppRoutePanelsOptions = {
  readonly auditPanels: AuditPanelRenderers;
  readonly clinicalDocumentPanels: ClinicalDocumentPanelRenderers;
  readonly clinicalRecordPanels: ClinicalRecordPanelRenderers;
  readonly interopPanels: InteropPanelRenderers;
  readonly patientPanels: PatientPanelRenderers;
};

export function buildAppRoutePanels({
  auditPanels,
  clinicalDocumentPanels,
  clinicalRecordPanels,
  interopPanels,
  patientPanels
}: BuildAppRoutePanelsOptions): AppRoutePanels {
  return {
    allergyIntolerance: clinicalRecordPanels.allergyIntolerance,
    audit: auditPanels.audit,
    clinicalDocument: clinicalDocumentPanels.clinicalDocument,
    condition: clinicalRecordPanels.condition,
    consentInterop: interopPanels.consentInterop,
    createPatient: patientPanels.createPatient,
    diagnosticReport: clinicalRecordPanels.diagnosticReport,
    encounter: clinicalRecordPanels.encounter,
    globalAudit: auditPanels.globalAudit,
    imagingStudy: clinicalRecordPanels.imagingStudy,
    medicationAdministration: clinicalRecordPanels.medicationAdministration,
    medicationDispense: clinicalRecordPanels.medicationDispense,
    medicationRequest: clinicalRecordPanels.medicationRequest,
    observation: clinicalRecordPanels.observation,
    patientDetail: patientPanels.patientDetail,
    patientList: patientPanels.patientList,
    patientMerge: patientPanels.patientMerge,
    procedure: clinicalRecordPanels.procedure,
    providerDirectory: interopPanels.providerDirectory,
    recordTransferInterop: interopPanels.recordTransferInterop,
    serviceRequest: clinicalRecordPanels.serviceRequest,
    workflowTask: clinicalRecordPanels.workflowTask
  };
}
