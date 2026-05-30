import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type { ApiRuntimeInfo, PurposeOfUse } from "../../types/clinical.js";

export function getFhirCapabilityStatement(api: ClinicalApiClient): Promise<unknown> {
  return api.requestJson<unknown>("/fhir/metadata");
}

export function getApiRuntimeInfo(
  api: ClinicalApiClient,
  purposeOfUse?: PurposeOfUse
): Promise<ApiRuntimeInfo> {
  return api.requestJson<ApiRuntimeInfo>(
    "/runtime",
    purposeOfUse ? { purposeOfUse } : undefined
  );
}
