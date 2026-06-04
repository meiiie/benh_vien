import type { FastifyInstance } from "fastify";
import { hasFhirContentType } from "./http-content-negotiation.js";

export function registerRequestIdErrorPayloadHook(app: FastifyInstance): void {
  app.addHook("onSend", async (request, reply, payload) => {
    if (reply.statusCode < 400 || hasFhirContentType(reply)) {
      return payload;
    }

    const payloadText = readPayloadText(payload);

    if (!payloadText) {
      return payload;
    }

    return injectRequestIdIntoErrorPayload(payloadText, request.id) ?? payload;
  });
}

function readPayloadText(payload: unknown): string | undefined {
  if (typeof payload === "string") {
    return payload;
  }

  if (Buffer.isBuffer(payload)) {
    return payload.toString("utf8");
  }

  return undefined;
}

function injectRequestIdIntoErrorPayload(
  payload: string,
  requestId: string
): string | undefined {
  try {
    const parsedPayload = JSON.parse(payload) as unknown;

    if (!isErrorEnvelopeWithoutRequestId(parsedPayload)) {
      return undefined;
    }

    return JSON.stringify({
      ...parsedPayload,
      requestId
    });
  } catch {
    return undefined;
  }
}

function isErrorEnvelopeWithoutRequestId(
  value: unknown
): value is { readonly error: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "error" in value &&
    typeof (value as { readonly error?: unknown }).error === "string" &&
    !("requestId" in value)
  );
}
