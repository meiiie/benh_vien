import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import { exportPatientAuditFhirBundle } from "../audit/auditApi.js";
import {
  exportClinicalDocumentFhir,
  exportClinicalDocumentProvenanceFhir
} from "../clinical-documents/clinicalDocumentApi.js";
import {
  exportAllergyIntoleranceFhir,
  exportConditionFhir,
  exportDiagnosticReportFhir,
  exportEncounterFhir,
  exportImagingStudyFhir,
  exportMedicationAdministrationFhir,
  exportMedicationDispenseFhir,
  exportMedicationRequestFhir,
  exportObservationFhir,
  exportProcedureFhir,
  exportServiceRequestFhir,
  exportWorkflowTaskFhir
} from "../clinical-records/clinicalRecordApi.js";
import { exportConsentFhir } from "../consents/consentApi.js";
import {
  exportPatientFhir,
  exportPatientFhirBundle,
  exportPatientFhirDocumentBundle
} from "../patient-registry/patientRegistryApi.js";
import { exportProviderDirectoryFhir } from "../provider-directory/providerDirectoryApi.js";
import { exportRecordTransferFhirTask } from "../record-transfers/recordTransferApi.js";
import { loadFhirPreview } from "../../lib/fhirPreviewLoader.js";

type SetPreview = (preview: unknown) => void;

type FhirPreviewLoaderConfig = {
  readonly canReadAudit: boolean;
  readonly clinicalApi: ClinicalApiClient;
  readonly isAuditOnlySession: boolean;
  readonly setAllergyIntoleranceFhirPreview: SetPreview;
  readonly setAuditFhirBundlePreview: SetPreview;
  readonly setConditionFhirPreview: SetPreview;
  readonly setConsentFhirPreview: SetPreview;
  readonly setDiagnosticReportFhirPreview: SetPreview;
  readonly setDocumentFhirPreview: SetPreview;
  readonly setDocumentProvenanceFhirPreview: SetPreview;
  readonly setEncounterFhirPreview: SetPreview;
  readonly setImagingStudyFhirPreview: SetPreview;
  readonly setIsExportingAuditFhir: (isExporting: boolean) => void;
  readonly setMedicationAdministrationFhirPreview: SetPreview;
  readonly setMedicationDispenseFhirPreview: SetPreview;
  readonly setMedicationRequestFhirPreview: SetPreview;
  readonly setObservationFhirPreview: SetPreview;
  readonly setPatientFhirBundlePreview: SetPreview;
  readonly setPatientFhirDocumentBundlePreview: SetPreview;
  readonly setPatientFhirPreview: SetPreview;
  readonly setProcedureFhirPreview: SetPreview;
  readonly setProviderDirectoryFhirPreview: SetPreview;
  readonly setRecordTransferFhirTaskPreview: SetPreview;
  readonly setServiceRequestFhirPreview: SetPreview;
  readonly setStatusMessage: (message: string) => void;
  readonly setWorkflowTaskFhirPreview: SetPreview;
};

export function buildFhirPreviewLoaders(config: FhirPreviewLoaderConfig) {
  return {
    loadAllergyIntoleranceFhirPreview: (allergyIntoleranceId: string) =>
      loadFhirPreview({
        errorMessage: "Không thể xuất FHIR AllergyIntolerance",
        exportPreview: () =>
          exportAllergyIntoleranceFhir(config.clinicalApi, allergyIntoleranceId),
        setPreview: config.setAllergyIntoleranceFhirPreview
      }),
    loadAuditFhirBundle: async (patientId: string) => {
      if (!config.canReadAudit) {
        config.setAuditFhirBundlePreview(undefined);
        config.setStatusMessage(
          "Xuất FHIR AuditEvent chỉ mở cho vai trò kiểm toán hoặc quản trị."
        );
        return;
      }

      config.setIsExportingAuditFhir(true);

      try {
        config.setAuditFhirBundlePreview(
          await exportPatientAuditFhirBundle(config.clinicalApi, patientId)
        );
        config.setStatusMessage(
          "Đã xuất FHIR AuditEvent Bundle cho nhật ký kiểm toán."
        );
      } catch (error) {
        config.setAuditFhirBundlePreview({
          error:
            error instanceof Error
              ? `Không thể xuất FHIR AuditEvent Bundle: ${error.message}`
              : "Không thể xuất FHIR AuditEvent Bundle."
        });
      } finally {
        config.setIsExportingAuditFhir(false);
      }
    },
    loadConditionFhirPreview: (conditionId: string) =>
      loadFhirPreview({
        errorMessage: "Không thể xuất FHIR Condition",
        exportPreview: () => exportConditionFhir(config.clinicalApi, conditionId),
        setPreview: config.setConditionFhirPreview
      }),
    loadConsentFhirPreview: (consentId: string) =>
      loadFhirPreview({
        errorMessage: "Không thể xuất FHIR Consent",
        exportPreview: () => exportConsentFhir(config.clinicalApi, consentId),
        setPreview: config.setConsentFhirPreview
      }),
    loadDiagnosticReportFhirPreview: (diagnosticReportId: string) =>
      loadFhirPreview({
        errorMessage: "Không thể xuất FHIR DiagnosticReport",
        exportPreview: () =>
          exportDiagnosticReportFhir(config.clinicalApi, diagnosticReportId),
        setPreview: config.setDiagnosticReportFhirPreview
      }),
    loadDocumentFhirPreview: (documentId: string) =>
      loadFhirPreview({
        errorMessage: "Không thể xuất FHIR DocumentReference",
        exportPreview: () => exportClinicalDocumentFhir(config.clinicalApi, documentId),
        setPreview: config.setDocumentFhirPreview
      }),
    loadDocumentProvenanceFhirPreview: (documentId: string) =>
      loadFhirPreview({
        errorMessage: "Không thể xuất FHIR Provenance",
        exportPreview: () =>
          exportClinicalDocumentProvenanceFhir(config.clinicalApi, documentId),
        setPreview: config.setDocumentProvenanceFhirPreview
      }),
    loadEncounterFhirPreview: (encounterId: string) =>
      loadFhirPreview({
        errorMessage: "Không thể xuất FHIR Encounter",
        exportPreview: () => exportEncounterFhir(config.clinicalApi, encounterId),
        setPreview: config.setEncounterFhirPreview
      }),
    loadImagingStudyFhirPreview: (imagingStudyId: string) =>
      loadFhirPreview({
        errorMessage: "Không thể xuất FHIR ImagingStudy",
        exportPreview: () => exportImagingStudyFhir(config.clinicalApi, imagingStudyId),
        setPreview: config.setImagingStudyFhirPreview
      }),
    loadMedicationAdministrationFhirPreview: (medicationAdministrationId: string) =>
      loadFhirPreview({
        errorMessage: "Không thể xuất FHIR MedicationAdministration",
        exportPreview: () =>
          exportMedicationAdministrationFhir(
            config.clinicalApi,
            medicationAdministrationId
          ),
        setPreview: config.setMedicationAdministrationFhirPreview
      }),
    loadMedicationDispenseFhirPreview: (medicationDispenseId: string) =>
      loadFhirPreview({
        errorMessage: "Không thể xuất FHIR MedicationDispense",
        exportPreview: () =>
          exportMedicationDispenseFhir(config.clinicalApi, medicationDispenseId),
        setPreview: config.setMedicationDispenseFhirPreview
      }),
    loadMedicationRequestFhirPreview: (medicationRequestId: string) =>
      loadFhirPreview({
        errorMessage: "Không thể xuất FHIR MedicationRequest",
        exportPreview: () =>
          exportMedicationRequestFhir(config.clinicalApi, medicationRequestId),
        setPreview: config.setMedicationRequestFhirPreview
      }),
    loadObservationFhirPreview: (observationId: string) =>
      loadFhirPreview({
        errorMessage: "Không thể xuất FHIR Observation",
        exportPreview: () => exportObservationFhir(config.clinicalApi, observationId),
        setPreview: config.setObservationFhirPreview
      }),
    loadPatientFhirBundlePreview: (patientId: string) =>
      loadFhirPreview({
        errorMessage: "Không thể xuất FHIR Bundle",
        exportPreview: () => exportPatientFhirBundle(config.clinicalApi, patientId),
        setPreview: config.setPatientFhirBundlePreview
      }),
    loadPatientFhirDocumentBundlePreview: (patientId: string) =>
      loadFhirPreview({
        errorMessage: "Không thể xuất FHIR document Bundle",
        exportPreview: () =>
          exportPatientFhirDocumentBundle(config.clinicalApi, patientId),
        setPreview: config.setPatientFhirDocumentBundlePreview
      }),
    loadPatientFhirPreview: (patientId: string) =>
      loadFhirPreview({
        errorMessage: "Không thể xuất FHIR Patient",
        exportPreview: () =>
          exportPatientFhir(
            config.clinicalApi,
            patientId,
            config.isAuditOnlySession ? "AUDIT" : "TREATMENT"
          ),
        setPreview: config.setPatientFhirPreview
      }),
    loadProcedureFhirPreview: (procedureId: string) =>
      loadFhirPreview({
        errorMessage: "Không thể xuất FHIR Procedure",
        exportPreview: () => exportProcedureFhir(config.clinicalApi, procedureId),
        setPreview: config.setProcedureFhirPreview
      }),
    loadProviderDirectoryFhirPreview: () =>
      loadFhirPreview({
        errorMessage: "Không thể xuất FHIR Provider Directory",
        exportPreview: () => exportProviderDirectoryFhir(config.clinicalApi),
        setPreview: config.setProviderDirectoryFhirPreview
      }),
    loadRecordTransferFhirTaskPreview: (recordTransferId: string) =>
      loadFhirPreview({
        errorMessage: "Không thể xuất FHIR Task của gói chuyển",
        exportPreview: () =>
          exportRecordTransferFhirTask(config.clinicalApi, recordTransferId),
        setPreview: config.setRecordTransferFhirTaskPreview
      }),
    loadServiceRequestFhirPreview: (serviceRequestId: string) =>
      loadFhirPreview({
        errorMessage: "Không thể xuất FHIR ServiceRequest",
        exportPreview: () =>
          exportServiceRequestFhir(config.clinicalApi, serviceRequestId),
        setPreview: config.setServiceRequestFhirPreview
      }),
    loadWorkflowTaskFhirPreview: (taskId: string) =>
      loadFhirPreview({
        errorMessage: "Không thể xuất FHIR Task",
        exportPreview: () => exportWorkflowTaskFhir(config.clinicalApi, taskId),
        setPreview: config.setWorkflowTaskFhirPreview
      })
  };
}
