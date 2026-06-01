import type { DemoRole } from "../auth/demoLogin.js";

export * from "./allergies.js";
export * from "./audit.js";
export * from "./careWorkflow.js";
export * from "./clinicalDocuments.js";
export * from "./consents.js";
export * from "./conditions.js";
export * from "./diagnosticResults.js";
export * from "./encounters.js";
export * from "./medications.js";
export * from "./observations.js";
export * from "./providerDirectory.js";
export * from "./patientRegistry.js";
export * from "./recordTransfers.js";

export type AppRoute =
  | "landing"
  | "login"
  | "dashboard"
  | "workspace"
  | "documents"
  | "audit"
  | "interop"
  | "settings";
export type PurposeOfUse = "TREATMENT" | "AUDIT" | "OPERATIONS";

export type ApiRuntimeInfo = {
  readonly service: string;
  readonly product: string;
  readonly version: string;
  readonly repository?: string;
  readonly nodeEnv?: string;
  readonly publicApiBaseUrl: string;
  readonly httpBodyLimitBytes?: number;
  readonly checkedAt: string;
  readonly operationalDiagnostics: {
    readonly available: boolean;
    readonly reason?: string;
  };
  readonly features: {
    readonly apiDocsEnabled: boolean | null;
    readonly recordTransferDeliveryAttempts: boolean;
    readonly recordTransferDeliveryWorkerEnabled: boolean | null;
    readonly recordTransferRetryWorkerEnabled: boolean | null;
  };
};

export type AuthSession = {
  readonly accessToken: string;
  readonly expiresAt: string;
  readonly actor: {
    readonly actorId: string;
    readonly displayName: string;
    readonly role: DemoRole;
  };
};
