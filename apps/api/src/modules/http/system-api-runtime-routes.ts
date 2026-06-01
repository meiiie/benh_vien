import type { FastifyInstance } from "fastify";
import { buildWiiiCareCapabilityStatement } from "@benh-vien-so/domain";
import { readActorContext } from "../access-control/access-context.js";
import { buildApiRuntimeInfo } from "./system-runtime-info.js";

export type ApiSystemRoutesOptions = {
  readonly apiVersion: string;
  readonly publicApiBaseUrl: string;
  readonly httpBodyLimitBytes: number;
  readonly apiDocsEnabled: boolean;
  readonly recordTransferDeliveryWorkerEnabled: boolean;
  readonly recordTransferRetryWorkerEnabled: boolean;
};

export function registerApiRuntimeRoutes(
  api: FastifyInstance,
  options: ApiSystemRoutesOptions
): void {
  api.get("/runtime", async (request) =>
    buildApiRuntimeInfo({
      ...options,
      actor: readActorContext(request)
    })
  );

  api.get("/fhir/metadata", async () =>
    buildWiiiCareCapabilityStatement({
      implementationUrl: options.publicApiBaseUrl
    })
  );
}
