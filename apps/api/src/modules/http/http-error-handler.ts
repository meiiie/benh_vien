import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { acceptsFhirJson } from "./http-content-negotiation.js";
import { buildValidationOperationOutcome } from "./http-validation-operation-outcome.js";

export function registerHttpErrorHandler(app: FastifyInstance): void {
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
}

function readHttpStatusCode(error: unknown): number {
  const statusCode = (error as { readonly statusCode?: unknown }).statusCode;

  return typeof statusCode === "number" ? statusCode : 500;
}
