import {
  listAllergyIntolerances,
  listConditions,
  listEncounters,
  listObservations
} from "../clinical-records/clinicalRecordApi.js";
import { createPatientWorkspaceCollectionLoader } from "./patientWorkspaceCollectionLoaderFactory.js";
import type { PatientWorkspaceCollectionLoaderConfig } from "./patientWorkspaceCollectionLoaderTypes.js";

export function buildPatientWorkspaceCoreCollectionLoaders(
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
    loadConditions: createPatientWorkspaceCollectionLoader({
      clinicalApi: config.clinicalApi,
      errorMessage: "Không thể tải chẩn đoán/vấn đề sức khỏe",
      listItems: listConditions,
      setItems: config.setConditions,
      setLoading: config.setIsLoadingConditions,
      setSelectedId: config.setSelectedConditionId,
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
    loadObservations: createPatientWorkspaceCollectionLoader({
      clinicalApi: config.clinicalApi,
      errorMessage: "Không thể tải chỉ số lâm sàng",
      listItems: listObservations,
      setItems: config.setObservations,
      setLoading: config.setIsLoadingObservations,
      setSelectedId: config.setSelectedObservationId,
      setStatusMessage: config.setStatusMessage
    })
  };
}
