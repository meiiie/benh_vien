import type { ClinicalApiClient } from "../api/clinicalApi.js";
import type { AuthSession } from "../types/clinical.js";
import type { LoginForm } from "./demoLogin.js";

export function loginDemoSession(
  api: ClinicalApiClient,
  credentials: LoginForm
): Promise<AuthSession> {
  return api.requestJson<AuthSession>("/auth/login", {
    method: "POST",
    json: credentials
  });
}
