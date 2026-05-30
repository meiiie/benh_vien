import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type { ProviderDirectory, PurposeOfUse } from "../../types/clinical.js";

export function getProviderDirectory(
  api: ClinicalApiClient,
  purposeOfUse: PurposeOfUse
): Promise<ProviderDirectory> {
  return api.requestJson<ProviderDirectory>("/provider-directory", {
    purposeOfUse
  });
}

export function exportProviderDirectoryFhir(api: ClinicalApiClient): Promise<unknown> {
  return api.requestJson<unknown>("/provider-directory/fhir", {
    purposeOfUse: "TREATMENT"
  });
}
