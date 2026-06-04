import {
  exportClinicalDocumentFhir,
  exportClinicalDocumentProvenanceFhir
} from "../clinical-documents/clinicalDocumentApi.js";
import { exportConsentFhir } from "../consents/consentApi.js";
import type {
  FhirPreviewLoaderBuilder,
  FhirPreviewLoaderConfig
} from "./fhirPreviewLoaderTypes.js";

type DocumentConsentFhirPreviewLoaderConfig = Pick<
  FhirPreviewLoaderConfig,
  | "setConsentFhirPreview"
  | "setDocumentFhirPreview"
  | "setDocumentProvenanceFhirPreview"
>;

export function buildDocumentConsentFhirPreviewLoaders(
  config: DocumentConsentFhirPreviewLoaderConfig,
  buildLoader: FhirPreviewLoaderBuilder
) {
  return {
    loadConsentFhirPreview: buildLoader(
      "Không thể xuất FHIR Consent",
      exportConsentFhir,
      config.setConsentFhirPreview
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
    )
  };
}
