import type { ActorContext } from "@benh-vien-so/domain";
import type { ApiSystemRoutesOptions } from "./system-api-runtime-routes.js";

export function buildApiRuntimeInfo(
  input: ApiSystemRoutesOptions & {
    readonly actor: ActorContext | undefined;
  }
) {
  const canReadDiagnostics = canReadRuntimeDiagnostics(input.actor);

  return {
    service: "benh-vien-so-api",
    product: "WiiiCare Nexus",
    version: input.apiVersion,
    publicApiBaseUrl: input.publicApiBaseUrl,
    checkedAt: new Date().toISOString(),
    operationalDiagnostics: canReadDiagnostics
      ? { available: true }
      : {
          available: false,
          reason: "Cần phiên admin/auditor với PurposeOfUse phù hợp để xem metadata vận hành."
        },
    features: {
      apiDocsEnabled: canReadDiagnostics ? input.apiDocsEnabled : null,
      recordTransferDeliveryAttempts: true,
      recordTransferDeliveryWorkerEnabled: canReadDiagnostics
        ? input.recordTransferDeliveryWorkerEnabled
        : null,
      recordTransferRetryWorkerEnabled: canReadDiagnostics
        ? input.recordTransferRetryWorkerEnabled
        : null
    },
    ...(canReadDiagnostics
      ? {
          repository: readRepositoryName(),
          nodeEnv: process.env.NODE_ENV ?? "development",
          httpBodyLimitBytes: input.httpBodyLimitBytes
        }
      : {})
  };
}

export function readRepositoryName(): string {
  return process.env.BVS_REPOSITORY ?? "in-memory";
}

function canReadRuntimeDiagnostics(actor: ActorContext | undefined): boolean {
  if (!actor) {
    return false;
  }

  if (actor.role === "admin") {
    return actor.purposeOfUse === "OPERATIONS" || actor.purposeOfUse === "AUDIT";
  }

  return actor.role === "auditor" && actor.purposeOfUse === "AUDIT";
}
