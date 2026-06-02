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
import {
  createFhirPreviewLoader,
  type FhirPreviewExport,
  type SetPreview
} from "./fhirPreviewLoaderFactory.js";

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
  const buildLoader = <TId extends readonly unknown[]>(
    errorMessage: string,
    exportPreview: FhirPreviewExport<TId>,
    setPreview: SetPreview
  ) =>
    createFhirPreviewLoader({
      clinicalApi: config.clinicalApi,
      errorMessage,
      exportPreview,
      setPreview
    });

  return {
    loadAllergyIntoleranceFhirPreview: buildLoader(
      "Không thể xuất FHIR AllergyIntolerance",
      exportAllergyIntoleranceFhir,
      config.setAllergyIntoleranceFhirPreview
    ),
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
    loadConditionFhirPreview: buildLoader(
      "Không thể xuất FHIR Condition",
      exportConditionFhir,
      config.setConditionFhirPreview
    ),
    loadConsentFhirPreview: buildLoader(
      "Không thể xuất FHIR Consent",
      exportConsentFhir,
      config.setConsentFhirPreview
    ),
    loadDiagnosticReportFhirPreview: buildLoader(
      "Không thể xuất FHIR DiagnosticReport",
      exportDiagnosticReportFhir,
      config.setDiagnosticReportFhirPreview
    ),
    loadDocumentFhirPreview: buildLoader(
      "Không thể xuất FHIR DocumentReference",
      exportClinicalDocumentFhir,
      config.setDocumentFhirPreview
    ),
    loadDocumentProvenanceFhirPreview: buildLoader(
      "Không thể xuất FHIR Provenance",
      exportClinicalDocumentProvenanceFhir,
      config.setDocumentProvenanceFhirPreview
    ),
    loadEncounterFhirPreview: buildLoader(
      "Không thể xuất FHIR Encounter",
      exportEncounterFhir,
      config.setEncounterFhirPreview
    ),
    loadImagingStudyFhirPreview: buildLoader(
      "Không thể xuất FHIR ImagingStudy",
      exportImagingStudyFhir,
      config.setImagingStudyFhirPreview
    ),
    loadMedicationAdministrationFhirPreview: buildLoader(
      "Không thể xuất FHIR MedicationAdministration",
      exportMedicationAdministrationFhir,
      config.setMedicationAdministrationFhirPreview
    ),
    loadMedicationDispenseFhirPreview: buildLoader(
      "Không thể xuất FHIR MedicationDispense",
      exportMedicationDispenseFhir,
      config.setMedicationDispenseFhirPreview
    ),
    loadMedicationRequestFhirPreview: buildLoader(
      "Không thể xuất FHIR MedicationRequest",
      exportMedicationRequestFhir,
      config.setMedicationRequestFhirPreview
    ),
    loadObservationFhirPreview: buildLoader(
      "Không thể xuất FHIR Observation",
      exportObservationFhir,
      config.setObservationFhirPreview
    ),
    loadPatientFhirBundlePreview: buildLoader(
      "Không thể xuất FHIR Bundle",
      exportPatientFhirBundle,
      config.setPatientFhirBundlePreview
    ),
    loadPatientFhirDocumentBundlePreview: buildLoader(
      "Không thể xuất FHIR document Bundle",
      exportPatientFhirDocumentBundle,
      config.setPatientFhirDocumentBundlePreview
    ),
    loadPatientFhirPreview: buildLoader(
      "Không thể xuất FHIR Patient",
      (clinicalApi, patientId: string) =>
        exportPatientFhir(
          clinicalApi,
          patientId,
          config.isAuditOnlySession ? "AUDIT" : "TREATMENT"
        ),
      config.setPatientFhirPreview
    ),
    loadProcedureFhirPreview: buildLoader(
      "Không thể xuất FHIR Procedure",
      exportProcedureFhir,
      config.setProcedureFhirPreview
    ),
    loadProviderDirectoryFhirPreview: buildLoader(
      "Không thể xuất FHIR Provider Directory",
      exportProviderDirectoryFhir,
      config.setProviderDirectoryFhirPreview
    ),
    loadRecordTransferFhirTaskPreview: buildLoader(
      "Không thể xuất FHIR Task của gói chuyển",
      exportRecordTransferFhirTask,
      config.setRecordTransferFhirTaskPreview
    ),
    loadServiceRequestFhirPreview: buildLoader(
      "Không thể xuất FHIR ServiceRequest",
      exportServiceRequestFhir,
      config.setServiceRequestFhirPreview
    ),
    loadWorkflowTaskFhirPreview: buildLoader(
      "Không thể xuất FHIR Task",
      exportWorkflowTaskFhir,
      config.setWorkflowTaskFhirPreview
    )
  };
}
