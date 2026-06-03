import {
  exportPatientFhir,
  exportPatientFhirBundle,
  exportPatientFhirDocumentBundle
} from "../patient-registry/patientRegistryApi.js";
import type {
  FhirPreviewLoaderBuilder,
  FhirPreviewLoaderConfig
} from "./fhirPreviewLoaderTypes.js";

type PatientFhirPreviewLoaderConfig = Pick<
  FhirPreviewLoaderConfig,
  | "isAuditOnlySession"
  | "setPatientFhirBundlePreview"
  | "setPatientFhirDocumentBundlePreview"
  | "setPatientFhirPreview"
>;

export function buildPatientFhirPreviewLoaders(
  config: PatientFhirPreviewLoaderConfig,
  buildLoader: FhirPreviewLoaderBuilder
) {
  return {
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
    )
  };
}
