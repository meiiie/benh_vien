import { buildClinicalResourceFhirPreviewLoaders } from "./clinicalResourceFhirPreviewLoaders.js";
import { buildDocumentConsentFhirPreviewLoaders } from "./documentConsentFhirPreviewLoaders.js";
import {
  createFhirPreviewLoader,
  type FhirPreviewExport,
  type SetPreview
} from "./fhirPreviewLoaderFactory.js";
import type { FhirPreviewLoaderConfig } from "./fhirPreviewLoaderTypes.js";
import { buildOperationalFhirPreviewLoaders } from "./operationalFhirPreviewLoaders.js";
import { buildPatientFhirPreviewLoaders } from "./patientFhirPreviewLoaders.js";

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
    ...buildClinicalResourceFhirPreviewLoaders(config, buildLoader),
    ...buildDocumentConsentFhirPreviewLoaders(config, buildLoader),
    ...buildPatientFhirPreviewLoaders(config, buildLoader),
    ...buildOperationalFhirPreviewLoaders(config, buildLoader)
  };
}
