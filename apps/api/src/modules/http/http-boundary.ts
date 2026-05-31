import { randomUUID } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { buildFhirOperationOutcome } from "@benh-vien-so/domain";

const requestIdHeaderName = "x-request-id";
const maxRequestIdLength = 128;
const requestIdPattern = /^[A-Za-z0-9._:-]+$/;

export function createRequestId(request: {
  readonly headers: Record<string, string | string[] | undefined>;
}): string {
  const requestId = request.headers[requestIdHeaderName];
  const candidate = Array.isArray(requestId) ? requestId[0] : requestId;

  return isSafeRequestId(candidate) ? candidate : randomUUID();
}

export function registerHttpBoundary(app: FastifyInstance): void {
  app.addHook("onRequest", async (request, reply) => {
    reply.header("X-Request-Id", request.id);
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("X-Frame-Options", "DENY");
    reply.header("Referrer-Policy", "no-referrer");
    reply.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    reply.header("Cross-Origin-Resource-Policy", "same-site");
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      if (acceptsFhirJson(request)) {
        return reply
          .status(400)
          .type("application/fhir+json; charset=utf-8")
          .send(buildValidationOperationOutcome(error));
      }

      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: "Request validation failed.",
        requestId: request.id,
        issues: error.issues
      });
    }

    const statusCode = readHttpStatusCode(error);

    if (statusCode >= 400 && statusCode < 500) {
      return reply.status(statusCode).send({
        error: "REQUEST_ERROR",
        message: "Request could not be processed.",
        requestId: request.id
      });
    }

    request.log.error({ err: error, requestId: request.id }, "Unhandled request error");

    return reply.status(500).send({
      error: "INTERNAL_SERVER_ERROR",
      message: "Unexpected internal server error.",
      requestId: request.id
    });
  });

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

function isSafeRequestId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= maxRequestIdLength &&
    requestIdPattern.test(value)
  );
}

function readHttpStatusCode(error: unknown): number {
  const statusCode = (error as { readonly statusCode?: unknown }).statusCode;

  return typeof statusCode === "number" ? statusCode : 500;
}

function buildValidationOperationOutcome(error: ZodError) {
  return buildFhirOperationOutcome({
    issues: error.issues.map((issue) => {
      const expression = issue.path.map((pathPart) => String(pathPart)).join(".");

      return {
        code: expression ? "invalid" : "structure",
        diagnostics: issue.message,
        ...(expression ? { expression: [expression] } : {}),
        details: {
          system: "urn:wiiicare:nexus:operation-outcome",
          code: "VALIDATION_ERROR",
          display: "Validation error",
          text: "Request validation failed."
        }
      };
    })
  });
}

function acceptsFhirJson(request: FastifyRequest): boolean {
  const accept = request.headers.accept;
  const values: readonly string[] = Array.isArray(accept) ? accept : accept ? [accept] : [];

  return values.some((value) =>
    value
      .split(",")
      .map((part: string) => part.trim().split(";")[0]?.toLowerCase())
      .includes("application/fhir+json")
  );
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

function hasFhirContentType(reply: {
  getHeader(name: string): number | string | string[] | undefined;
}): boolean {
  const contentType = reply.getHeader("content-type");

  if (Array.isArray(contentType)) {
    return contentType.some((value) => value.includes("application/fhir+json"));
  }

  return typeof contentType === "string" && contentType.includes("application/fhir+json");
}
