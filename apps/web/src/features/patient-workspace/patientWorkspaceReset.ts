import type { AllergyIntolerance } from "../../types/allergies.js";
import type {
  AuditEvent,
  AuditIntegrityReport
} from "../../types/audit.js";
import type {
  Procedure,
  ServiceRequest,
  WorkflowTask
} from "../../types/careWorkflow.js";
import type { ClinicalDocument } from "../../types/clinicalDocuments.js";
import type { Condition } from "../../types/conditions.js";
import type { Consent } from "../../types/consents.js";
import type {
  DiagnosticReport,
  ImagingStudy
} from "../../types/diagnosticResults.js";
import type { Encounter } from "../../types/encounters.js";
import type {
  MedicationAdministration,
  MedicationDispense,
  MedicationRequest
} from "../../types/medications.js";
import type { Observation } from "../../types/observations.js";
import type {
  RecordTransfer,
  RecordTransferDeliveryAttempt
} from "../../types/recordTransfers.js";

export type PatientWorkspaceResetConfig = {
  readonly setAllergyIntoleranceFhirPreview: (preview: unknown) => void;
  readonly setAllergyIntolerances: (
    items: readonly AllergyIntolerance[]
  ) => void;
  readonly setAuditEvents: (events: readonly AuditEvent[]) => void;
  readonly setAuditFhirBundlePreview: (preview: unknown) => void;
  readonly setAuditIntegrityReport: (
    report: AuditIntegrityReport | undefined
  ) => void;
  readonly setCapabilityStatementPreview: (preview: unknown) => void;
  readonly setClinicalDocuments: (documents: readonly ClinicalDocument[]) => void;
  readonly setConditionFhirPreview: (preview: unknown) => void;
  readonly setConditions: (conditions: readonly Condition[]) => void;
  readonly setConsentFhirPreview: (preview: unknown) => void;
  readonly setConsents: (consents: readonly Consent[]) => void;
  readonly setDiagnosticReportFhirPreview: (preview: unknown) => void;
  readonly setDiagnosticReports: (reports: readonly DiagnosticReport[]) => void;
  readonly setDocumentFhirPreview: (preview: unknown) => void;
  readonly setEncounterFhirPreview: (preview: unknown) => void;
  readonly setEncounters: (encounters: readonly Encounter[]) => void;
  readonly setImagingStudies: (studies: readonly ImagingStudy[]) => void;
  readonly setImagingStudyFhirPreview: (preview: unknown) => void;
  readonly setMedicationAdministrationFhirPreview: (preview: unknown) => void;
  readonly setMedicationAdministrations: (
    administrations: readonly MedicationAdministration[]
  ) => void;
  readonly setMedicationDispenseFhirPreview: (preview: unknown) => void;
  readonly setMedicationDispenses: (
    dispenses: readonly MedicationDispense[]
  ) => void;
  readonly setMedicationRequestFhirPreview: (preview: unknown) => void;
  readonly setMedicationRequests: (requests: readonly MedicationRequest[]) => void;
  readonly setObservationFhirPreview: (preview: unknown) => void;
  readonly setObservations: (observations: readonly Observation[]) => void;
  readonly setPatientFhirBundlePreview: (preview: unknown) => void;
  readonly setPatientFhirDocumentBundlePreview: (preview: unknown) => void;
  readonly setPatientFhirPreview: (preview: unknown) => void;
  readonly setProcedureFhirPreview: (preview: unknown) => void;
  readonly setProcedures: (procedures: readonly Procedure[]) => void;
  readonly setRecordTransferDeliveryAttempts: (
    attempts: readonly RecordTransferDeliveryAttempt[]
  ) => void;
  readonly setRecordTransferDeliveryAttemptWarning: (
    message: string | undefined
  ) => void;
  readonly setRecordTransferFhirTaskPreview: (preview: unknown) => void;
  readonly setRecordTransfers: (transfers: readonly RecordTransfer[]) => void;
  readonly setSelectedAllergyIntoleranceId: (id: string | undefined) => void;
  readonly setSelectedConditionId: (id: string | undefined) => void;
  readonly setSelectedDiagnosticReportId: (id: string | undefined) => void;
  readonly setSelectedDocumentId: (id: string | undefined) => void;
  readonly setSelectedEncounterId: (id: string | undefined) => void;
  readonly setSelectedImagingStudyId: (id: string | undefined) => void;
  readonly setSelectedMedicationAdministrationId: (
    id: string | undefined
  ) => void;
  readonly setSelectedMedicationDispenseId: (id: string | undefined) => void;
  readonly setSelectedMedicationRequestId: (id: string | undefined) => void;
  readonly setSelectedObservationId: (id: string | undefined) => void;
  readonly setSelectedProcedureId: (id: string | undefined) => void;
  readonly setSelectedRecordTransferId: (id: string | undefined) => void;
  readonly setSelectedServiceRequestId: (id: string | undefined) => void;
  readonly setSelectedWorkflowTaskId: (id: string | undefined) => void;
  readonly setServiceRequestFhirPreview: (preview: unknown) => void;
  readonly setServiceRequests: (requests: readonly ServiceRequest[]) => void;
  readonly setWorkflowTaskFhirPreview: (preview: unknown) => void;
  readonly setWorkflowTasks: (tasks: readonly WorkflowTask[]) => void;
};

export function clearPatientWorkspaceState(
  config: PatientWorkspaceResetConfig
) {
  config.setPatientFhirPreview(undefined);
  config.setPatientFhirBundlePreview(undefined);
  config.setPatientFhirDocumentBundlePreview(undefined);
  config.setCapabilityStatementPreview(undefined);
  config.setConsentFhirPreview(undefined);
  config.setEncounterFhirPreview(undefined);
  config.setRecordTransferFhirTaskPreview(undefined);
  config.setDocumentFhirPreview(undefined);
  config.setAllergyIntoleranceFhirPreview(undefined);
  config.setConditionFhirPreview(undefined);
  config.setObservationFhirPreview(undefined);
  config.setMedicationRequestFhirPreview(undefined);
  config.setMedicationDispenseFhirPreview(undefined);
  config.setMedicationAdministrationFhirPreview(undefined);
  config.setServiceRequestFhirPreview(undefined);
  config.setWorkflowTaskFhirPreview(undefined);
  config.setProcedureFhirPreview(undefined);
  config.setDiagnosticReportFhirPreview(undefined);
  config.setImagingStudyFhirPreview(undefined);
  config.setEncounters([]);
  config.setClinicalDocuments([]);
  config.setAllergyIntolerances([]);
  config.setConditions([]);
  config.setObservations([]);
  config.setMedicationRequests([]);
  config.setMedicationDispenses([]);
  config.setMedicationAdministrations([]);
  config.setServiceRequests([]);
  config.setWorkflowTasks([]);
  config.setProcedures([]);
  config.setDiagnosticReports([]);
  config.setImagingStudies([]);
  config.setAuditEvents([]);
  config.setAuditIntegrityReport(undefined);
  config.setAuditFhirBundlePreview(undefined);
  config.setConsents([]);
  config.setRecordTransfers([]);
  config.setRecordTransferDeliveryAttempts([]);
  config.setRecordTransferDeliveryAttemptWarning(undefined);
  config.setSelectedEncounterId(undefined);
  config.setSelectedDocumentId(undefined);
  config.setSelectedAllergyIntoleranceId(undefined);
  config.setSelectedConditionId(undefined);
  config.setSelectedObservationId(undefined);
  config.setSelectedMedicationRequestId(undefined);
  config.setSelectedMedicationDispenseId(undefined);
  config.setSelectedMedicationAdministrationId(undefined);
  config.setSelectedServiceRequestId(undefined);
  config.setSelectedWorkflowTaskId(undefined);
  config.setSelectedProcedureId(undefined);
  config.setSelectedDiagnosticReportId(undefined);
  config.setSelectedImagingStudyId(undefined);
  config.setSelectedRecordTransferId(undefined);
}
