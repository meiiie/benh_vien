import { buildPatientWorkspaceCareWorkflowCollectionLoaders } from "./patientWorkspaceCareWorkflowCollectionLoaders.js";
import { buildPatientWorkspaceCoreCollectionLoaders } from "./patientWorkspaceCoreCollectionLoaders.js";
import { buildPatientWorkspaceDocumentCollectionLoaders } from "./patientWorkspaceDocumentCollectionLoaders.js";
import { buildPatientWorkspaceMedicationCollectionLoaders } from "./patientWorkspaceMedicationCollectionLoaders.js";
import type { PatientWorkspaceCollectionLoaderConfig } from "./patientWorkspaceCollectionLoaderTypes.js";

export function buildPatientWorkspaceCollectionLoaders(
  config: PatientWorkspaceCollectionLoaderConfig
) {
  return {
    ...buildPatientWorkspaceCoreCollectionLoaders(config),
    ...buildPatientWorkspaceMedicationCollectionLoaders(config),
    ...buildPatientWorkspaceCareWorkflowCollectionLoaders(config),
    ...buildPatientWorkspaceDocumentCollectionLoaders(config)
  };
}
