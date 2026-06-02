import {
  listDiagnosticReports,
  listImagingStudies,
  listProcedures,
  listServiceRequests,
  listWorkflowTasks
} from "../clinical-records/clinicalRecordApi.js";
import { createPatientWorkspaceCollectionLoader } from "./patientWorkspaceCollectionLoaderFactory.js";
import type { PatientWorkspaceCollectionLoaderConfig } from "./patientWorkspaceCollectionLoaderTypes.js";

export function buildPatientWorkspaceCareWorkflowCollectionLoaders(
  config: PatientWorkspaceCollectionLoaderConfig
) {
  return {
    loadDiagnosticReports: createPatientWorkspaceCollectionLoader({
      clinicalApi: config.clinicalApi,
      errorMessage: "Không thể tải báo cáo kết quả",
      listItems: listDiagnosticReports,
      setItems: config.setDiagnosticReports,
      setLoading: config.setIsLoadingDiagnosticReports,
      setSelectedId: config.setSelectedDiagnosticReportId,
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
