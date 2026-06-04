import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type { PurposeOfUse } from "../../types/appRuntime.js";
import type { ProviderDirectory } from "../../types/providerDirectory.js";

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
