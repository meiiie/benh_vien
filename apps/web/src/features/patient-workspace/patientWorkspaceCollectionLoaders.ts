import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import { listClinicalDocuments } from "../clinical-documents/clinicalDocumentApi.js";
import {
  listAllergyIntolerances,
  listConditions,
  listDiagnosticReports,
  listEncounters,
  listImagingStudies,
  listMedicationAdministrations,
  listMedicationDispenses,
  listMedicationRequests,
  listObservations,
  listProcedures,
  listServiceRequests,
  listWorkflowTasks
} from "../clinical-records/clinicalRecordApi.js";
import { loadPatientScopedCollection } from "../../lib/patientScopedCollectionLoader.js";
import type {
  AllergyIntolerance,
} from "../../types/allergies.js";
import type {
  Procedure,
  ServiceRequest,
  WorkflowTask
} from "../../types/careWorkflow.js";
import type { ClinicalDocument } from "../../types/clinicalDocuments.js";
import type { Condition } from "../../types/conditions.js";
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

type SetItems<Item> = (items: readonly Item[]) => void;
type SetLoading = (isLoading: boolean) => void;
type SetSelectedId = (id: string | undefined) => void;
type SetStatusMessage = (message: string) => void;

type PatientWorkspaceCollectionLoaderConfig = {
  readonly clinicalApi: ClinicalApiClient;
  readonly setAllergyIntolerances: SetItems<AllergyIntolerance>;
  readonly setClinicalDocuments: SetItems<ClinicalDocument>;
  readonly setConditions: SetItems<Condition>;
  readonly setDiagnosticReports: SetItems<DiagnosticReport>;
  readonly setEncounters: SetItems<Encounter>;
  readonly setImagingStudies: SetItems<ImagingStudy>;
  readonly setIsLoadingAllergyIntolerances: SetLoading;
  readonly setIsLoadingConditions: SetLoading;
  readonly setIsLoadingDiagnosticReports: SetLoading;
  readonly setIsLoadingDocuments: SetLoading;
  readonly setIsLoadingEncounters: SetLoading;
  readonly setIsLoadingImagingStudies: SetLoading;
  readonly setIsLoadingMedicationAdministrations: SetLoading;
  readonly setIsLoadingMedicationDispenses: SetLoading;
  readonly setIsLoadingMedicationRequests: SetLoading;
  readonly setIsLoadingObservations: SetLoading;
  readonly setIsLoadingProcedures: SetLoading;
  readonly setIsLoadingServiceRequests: SetLoading;
  readonly setIsLoadingWorkflowTasks: SetLoading;
  readonly setMedicationAdministrations: SetItems<MedicationAdministration>;
  readonly setMedicationDispenses: SetItems<MedicationDispense>;
  readonly setMedicationRequests: SetItems<MedicationRequest>;
  readonly setObservations: SetItems<Observation>;
  readonly setProcedures: SetItems<Procedure>;
  readonly setSelectedAllergyIntoleranceId: SetSelectedId;
  readonly setSelectedConditionId: SetSelectedId;
  readonly setSelectedDiagnosticReportId: SetSelectedId;
  readonly setSelectedDocumentId: SetSelectedId;
  readonly setSelectedEncounterId: SetSelectedId;
  readonly setSelectedImagingStudyId: SetSelectedId;
  readonly setSelectedMedicationAdministrationId: SetSelectedId;
  readonly setSelectedMedicationDispenseId: SetSelectedId;
  readonly setSelectedMedicationRequestId: SetSelectedId;
  readonly setSelectedObservationId: SetSelectedId;
  readonly setSelectedProcedureId: SetSelectedId;
  readonly setSelectedServiceRequestId: SetSelectedId;
  readonly setSelectedWorkflowTaskId: SetSelectedId;
  readonly setServiceRequests: SetItems<ServiceRequest>;
  readonly setStatusMessage: SetStatusMessage;
  readonly setWorkflowTasks: SetItems<WorkflowTask>;
};

export function buildPatientWorkspaceCollectionLoaders(
  config: PatientWorkspaceCollectionLoaderConfig
) {
  return {
    loadAllergyIntolerances: (
      patientId: string,
      nextSelectedAllergyIntoleranceId?: string
    ) =>
      loadPatientScopedCollection({
        errorMessage: "Không thể tải dị ứng/cảnh báo",
        listItems: () => listAllergyIntolerances(config.clinicalApi, patientId),
        nextSelectedId: nextSelectedAllergyIntoleranceId,
        setItems: config.setAllergyIntolerances,
        setLoading: config.setIsLoadingAllergyIntolerances,
        setSelectedId: config.setSelectedAllergyIntoleranceId,
        setStatusMessage: config.setStatusMessage
      }),
    loadClinicalDocuments: (patientId: string, nextSelectedDocumentId?: string) =>
      loadPatientScopedCollection({
        errorMessage: "Không thể tải tài liệu bệnh án",
        listItems: () => listClinicalDocuments(config.clinicalApi, patientId),
        nextSelectedId: nextSelectedDocumentId,
        setItems: config.setClinicalDocuments,
        setLoading: config.setIsLoadingDocuments,
        setSelectedId: config.setSelectedDocumentId,
        setStatusMessage: config.setStatusMessage
      }),
    loadConditions: (patientId: string, nextSelectedConditionId?: string) =>
      loadPatientScopedCollection({
        errorMessage: "Không thể tải chẩn đoán/vấn đề sức khỏe",
        listItems: () => listConditions(config.clinicalApi, patientId),
        nextSelectedId: nextSelectedConditionId,
        setItems: config.setConditions,
        setLoading: config.setIsLoadingConditions,
        setSelectedId: config.setSelectedConditionId,
        setStatusMessage: config.setStatusMessage
      }),
    loadDiagnosticReports: (
      patientId: string,
      nextSelectedDiagnosticReportId?: string
    ) =>
      loadPatientScopedCollection({
        errorMessage: "Không thể tải báo cáo kết quả",
        listItems: () => listDiagnosticReports(config.clinicalApi, patientId),
        nextSelectedId: nextSelectedDiagnosticReportId,
        setItems: config.setDiagnosticReports,
        setLoading: config.setIsLoadingDiagnosticReports,
        setSelectedId: config.setSelectedDiagnosticReportId,
        setStatusMessage: config.setStatusMessage
      }),
    loadEncounters: (patientId: string, nextSelectedEncounterId?: string) =>
      loadPatientScopedCollection({
        errorMessage: "Không thể tải lượt khám",
        listItems: () => listEncounters(config.clinicalApi, patientId),
        nextSelectedId: nextSelectedEncounterId,
        setItems: config.setEncounters,
        setLoading: config.setIsLoadingEncounters,
        setSelectedId: config.setSelectedEncounterId,
        setStatusMessage: config.setStatusMessage
      }),
    loadImagingStudies: (patientId: string, nextSelectedImagingStudyId?: string) =>
      loadPatientScopedCollection({
        errorMessage: "Không thể tải nghiên cứu hình ảnh/PACS",
        listItems: () => listImagingStudies(config.clinicalApi, patientId),
        nextSelectedId: nextSelectedImagingStudyId,
        setItems: config.setImagingStudies,
        setLoading: config.setIsLoadingImagingStudies,
        setSelectedId: config.setSelectedImagingStudyId,
        setStatusMessage: config.setStatusMessage
      }),
    loadMedicationAdministrations: (
      patientId: string,
      nextSelectedMedicationAdministrationId?: string
    ) =>
      loadPatientScopedCollection({
        errorMessage: "Không thể tải lần dùng thuốc",
        listItems: () => listMedicationAdministrations(config.clinicalApi, patientId),
        nextSelectedId: nextSelectedMedicationAdministrationId,
        setItems: config.setMedicationAdministrations,
        setLoading: config.setIsLoadingMedicationAdministrations,
        setSelectedId: config.setSelectedMedicationAdministrationId,
        setStatusMessage: config.setStatusMessage
      }),
    loadMedicationDispenses: (
      patientId: string,
      nextSelectedMedicationDispenseId?: string
    ) =>
      loadPatientScopedCollection({
        errorMessage: "Không thể tải cấp phát thuốc",
        listItems: () => listMedicationDispenses(config.clinicalApi, patientId),
        nextSelectedId: nextSelectedMedicationDispenseId,
        setItems: config.setMedicationDispenses,
        setLoading: config.setIsLoadingMedicationDispenses,
        setSelectedId: config.setSelectedMedicationDispenseId,
        setStatusMessage: config.setStatusMessage
      }),
    loadMedicationRequests: (
      patientId: string,
      nextSelectedMedicationRequestId?: string
    ) =>
      loadPatientScopedCollection({
        errorMessage: "Không thể tải chỉ định thuốc",
        listItems: () => listMedicationRequests(config.clinicalApi, patientId),
        nextSelectedId: nextSelectedMedicationRequestId,
        setItems: config.setMedicationRequests,
        setLoading: config.setIsLoadingMedicationRequests,
        setSelectedId: config.setSelectedMedicationRequestId,
        setStatusMessage: config.setStatusMessage
      }),
    loadObservations: (patientId: string, nextSelectedObservationId?: string) =>
      loadPatientScopedCollection({
        errorMessage: "Không thể tải chỉ số lâm sàng",
        listItems: () => listObservations(config.clinicalApi, patientId),
        nextSelectedId: nextSelectedObservationId,
        setItems: config.setObservations,
        setLoading: config.setIsLoadingObservations,
        setSelectedId: config.setSelectedObservationId,
        setStatusMessage: config.setStatusMessage
      }),
    loadProcedures: (patientId: string, nextSelectedProcedureId?: string) =>
      loadPatientScopedCollection({
        errorMessage: "Không thể tải thủ thuật/hoạt động đã thực hiện",
        listItems: () => listProcedures(config.clinicalApi, patientId),
        nextSelectedId: nextSelectedProcedureId,
        setItems: config.setProcedures,
        setLoading: config.setIsLoadingProcedures,
        setSelectedId: config.setSelectedProcedureId,
        setStatusMessage: config.setStatusMessage
      }),
    loadServiceRequests: (patientId: string, nextSelectedServiceRequestId?: string) =>
      loadPatientScopedCollection({
        errorMessage: "Không thể tải chỉ định dịch vụ",
        listItems: () => listServiceRequests(config.clinicalApi, patientId),
        nextSelectedId: nextSelectedServiceRequestId,
        setItems: config.setServiceRequests,
        setLoading: config.setIsLoadingServiceRequests,
        setSelectedId: config.setSelectedServiceRequestId,
        setStatusMessage: config.setStatusMessage
      }),
    loadWorkflowTasks: (patientId: string, nextSelectedWorkflowTaskId?: string) =>
      loadPatientScopedCollection({
        errorMessage: "Không thể tải hàng đợi công việc",
        listItems: () => listWorkflowTasks(config.clinicalApi, patientId),
        nextSelectedId: nextSelectedWorkflowTaskId,
        setItems: config.setWorkflowTasks,
        setLoading: config.setIsLoadingWorkflowTasks,
        setSelectedId: config.setSelectedWorkflowTaskId,
        setStatusMessage: config.setStatusMessage
      })
  };
}
