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
import { createPatientWorkspaceCollectionLoader } from "./patientWorkspaceCollectionLoaderFactory.js";
import type { AllergyIntolerance } from "../../types/allergies.js";
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
    loadAllergyIntolerances: createPatientWorkspaceCollectionLoader({
      clinicalApi: config.clinicalApi,
      errorMessage: "Không thể tải dị ứng/cảnh báo",
      listItems: listAllergyIntolerances,
      setItems: config.setAllergyIntolerances,
      setLoading: config.setIsLoadingAllergyIntolerances,
      setSelectedId: config.setSelectedAllergyIntoleranceId,
      setStatusMessage: config.setStatusMessage
    }),
    loadClinicalDocuments: createPatientWorkspaceCollectionLoader({
      clinicalApi: config.clinicalApi,
      errorMessage: "Không thể tải tài liệu bệnh án",
      listItems: listClinicalDocuments,
      setItems: config.setClinicalDocuments,
      setLoading: config.setIsLoadingDocuments,
      setSelectedId: config.setSelectedDocumentId,
      setStatusMessage: config.setStatusMessage
    }),
    loadConditions: createPatientWorkspaceCollectionLoader({
      clinicalApi: config.clinicalApi,
      errorMessage: "Không thể tải chẩn đoán/vấn đề sức khỏe",
      listItems: listConditions,
      setItems: config.setConditions,
      setLoading: config.setIsLoadingConditions,
      setSelectedId: config.setSelectedConditionId,
      setStatusMessage: config.setStatusMessage
    }),
    loadDiagnosticReports: createPatientWorkspaceCollectionLoader({
      clinicalApi: config.clinicalApi,
      errorMessage: "Không thể tải báo cáo kết quả",
      listItems: listDiagnosticReports,
      setItems: config.setDiagnosticReports,
      setLoading: config.setIsLoadingDiagnosticReports,
      setSelectedId: config.setSelectedDiagnosticReportId,
      setStatusMessage: config.setStatusMessage
    }),
    loadEncounters: createPatientWorkspaceCollectionLoader({
      clinicalApi: config.clinicalApi,
      errorMessage: "Không thể tải lượt khám",
      listItems: listEncounters,
      setItems: config.setEncounters,
      setLoading: config.setIsLoadingEncounters,
      setSelectedId: config.setSelectedEncounterId,
      setStatusMessage: config.setStatusMessage
    }),
    loadImagingStudies: createPatientWorkspaceCollectionLoader({
      clinicalApi: config.clinicalApi,
      errorMessage: "Không thể tải nghiên cứu hình ảnh/PACS",
      listItems: listImagingStudies,
      setItems: config.setImagingStudies,
      setLoading: config.setIsLoadingImagingStudies,
      setSelectedId: config.setSelectedImagingStudyId,
      setStatusMessage: config.setStatusMessage
    }),
    loadMedicationAdministrations: createPatientWorkspaceCollectionLoader({
      clinicalApi: config.clinicalApi,
      errorMessage: "Không thể tải lần dùng thuốc",
      listItems: listMedicationAdministrations,
      setItems: config.setMedicationAdministrations,
      setLoading: config.setIsLoadingMedicationAdministrations,
      setSelectedId: config.setSelectedMedicationAdministrationId,
      setStatusMessage: config.setStatusMessage
    }),
    loadMedicationDispenses: createPatientWorkspaceCollectionLoader({
      clinicalApi: config.clinicalApi,
      errorMessage: "Không thể tải cấp phát thuốc",
      listItems: listMedicationDispenses,
      setItems: config.setMedicationDispenses,
      setLoading: config.setIsLoadingMedicationDispenses,
      setSelectedId: config.setSelectedMedicationDispenseId,
      setStatusMessage: config.setStatusMessage
    }),
    loadMedicationRequests: createPatientWorkspaceCollectionLoader({
      clinicalApi: config.clinicalApi,
      errorMessage: "Không thể tải chỉ định thuốc",
      listItems: listMedicationRequests,
      setItems: config.setMedicationRequests,
      setLoading: config.setIsLoadingMedicationRequests,
      setSelectedId: config.setSelectedMedicationRequestId,
      setStatusMessage: config.setStatusMessage
    }),
    loadObservations: createPatientWorkspaceCollectionLoader({
      clinicalApi: config.clinicalApi,
      errorMessage: "Không thể tải chỉ số lâm sàng",
      listItems: listObservations,
      setItems: config.setObservations,
      setLoading: config.setIsLoadingObservations,
      setSelectedId: config.setSelectedObservationId,
      setStatusMessage: config.setStatusMessage
    }),
    loadProcedures: createPatientWorkspaceCollectionLoader({
      clinicalApi: config.clinicalApi,
      errorMessage: "Không thể tải thủ thuật/hoạt động đã thực hiện",
      listItems: listProcedures,
      setItems: config.setProcedures,
      setLoading: config.setIsLoadingProcedures,
      setSelectedId: config.setSelectedProcedureId,
      setStatusMessage: config.setStatusMessage
    }),
    loadServiceRequests: createPatientWorkspaceCollectionLoader({
      clinicalApi: config.clinicalApi,
      errorMessage: "Không thể tải chỉ định dịch vụ",
      listItems: listServiceRequests,
      setItems: config.setServiceRequests,
      setLoading: config.setIsLoadingServiceRequests,
      setSelectedId: config.setSelectedServiceRequestId,
      setStatusMessage: config.setStatusMessage
    }),
    loadWorkflowTasks: createPatientWorkspaceCollectionLoader({
      clinicalApi: config.clinicalApi,
      errorMessage: "Không thể tải hàng đợi công việc",
      listItems: listWorkflowTasks,
      setItems: config.setWorkflowTasks,
      setLoading: config.setIsLoadingWorkflowTasks,
      setSelectedId: config.setSelectedWorkflowTaskId,
      setStatusMessage: config.setStatusMessage
    })
  };
}
