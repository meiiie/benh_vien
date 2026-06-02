import { listClinicalDocuments } from "../clinical-documents/clinicalDocumentApi.js";
import { createPatientWorkspaceCollectionLoader } from "./patientWorkspaceCollectionLoaderFactory.js";
import type { PatientWorkspaceCollectionLoaderConfig } from "./patientWorkspaceCollectionLoaderTypes.js";

export function buildPatientWorkspaceDocumentCollectionLoaders(
  config: PatientWorkspaceCollectionLoaderConfig
) {
  return {
    loadClinicalDocuments: createPatientWorkspaceCollectionLoader({
      clinicalApi: config.clinicalApi,
      errorMessage: "Không thể tải tài liệu bệnh án",
      listItems: listClinicalDocuments,
      setItems: config.setClinicalDocuments,
      setLoading: config.setIsLoadingDocuments,
      setSelectedId: config.setSelectedDocumentId,
      setStatusMessage: config.setStatusMessage
    })
  };
}
