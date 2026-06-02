import {
  listMedicationAdministrations,
  listMedicationDispenses,
  listMedicationRequests
} from "../clinical-records/clinicalRecordApi.js";
import { createPatientWorkspaceCollectionLoader } from "./patientWorkspaceCollectionLoaderFactory.js";
import type { PatientWorkspaceCollectionLoaderConfig } from "./patientWorkspaceCollectionLoaderTypes.js";

export function buildPatientWorkspaceMedicationCollectionLoaders(
  config: PatientWorkspaceCollectionLoaderConfig
) {
  return {
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
    })
  };
}
