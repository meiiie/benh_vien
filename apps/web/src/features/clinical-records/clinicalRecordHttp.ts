import type { ClinicalApiClient } from "../../api/clinicalApi.js";

export function requestTreatmentJson<T>(api: ClinicalApiClient, path: string): Promise<T> {
  return api.requestJson<T>(path, {
    purposeOfUse: "TREATMENT"
  });
}

export function postTreatmentJson<T>(
  api: ClinicalApiClient,
  path: string,
  command?: unknown
): Promise<T> {
  return api.requestJson<T>(path, {
    method: "POST",
    purposeOfUse: "TREATMENT",
    ...(command === undefined ? {} : { json: command })
  });
}
