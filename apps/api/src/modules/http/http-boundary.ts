import type { FastifyInstance } from "fastify";
import { registerHttpErrorHandler } from "./http-error-handler.js";
import { registerRequestIdErrorPayloadHook } from "./http-error-payload.js";
import { registerSecurityHeaderHook } from "./http-security-headers.js";

export { createRequestId } from "./http-request-id.js";

export function registerHttpBoundary(app: FastifyInstance): void {
  registerSecurityHeaderHook(app);
  registerHttpErrorHandler(app);
  registerRequestIdErrorPayloadHook(app);
}
