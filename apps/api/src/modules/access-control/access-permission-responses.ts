import type { FastifyReply, FastifyRequest } from "fastify";
import type { ActorContext, Permission } from "@benh-vien-so/domain";
import { sendFhirOperationOutcome } from "../fhir/operation-outcome-response.js";
import { sendJsonErrorResponse } from "../http/http-json-error-response.js";
import { acceptsFhirJson } from "./access-context-http.js";

const unauthenticatedMessage =
  "Cần đăng nhập và gửi Authorization Bearer token hợp lệ.";

export function sendInvalidPurposeOfUseResponse(
  request: FastifyRequest,
  reply: FastifyReply
): void {
  const message =
    "x-purpose-of-use phải là một trong các giá trị TREATMENT, AUDIT hoặc OPERATIONS.";

  if (acceptsFhirJson(request)) {
    sendFhirOperationOutcome(reply, {
      statusCode: 400,
      code: "invalid",
      diagnostics: `requestId=${request.id}; allowedPurposeOfUse=TREATMENT,AUDIT,OPERATIONS`,
      expression: ["x-purpose-of-use"],
      details: {
        code: "INVALID_PURPOSE_OF_USE",
        display: "Invalid purpose of use",
        text: message
      }
    });

    return;
  }

  sendJsonErrorResponse(reply, 400, request.id, {
    error: "INVALID_PURPOSE_OF_USE",
    message,
    allowedPurposeOfUse: ["TREATMENT", "AUDIT", "OPERATIONS"]
  });
}

export function sendUnauthenticatedResponse(
  request: FastifyRequest,
  reply: FastifyReply
): void {
  reply.header("WWW-Authenticate", "Bearer");

  if (acceptsFhirJson(request)) {
    sendFhirOperationOutcome(reply, {
      statusCode: 401,
      code: "login",
      diagnostics: `requestId=${request.id}`,
      expression: ["Authorization"],
      details: {
        code: "UNAUTHENTICATED",
        display: "Unauthenticated",
        text: unauthenticatedMessage
      }
    });

    return;
  }

  sendJsonErrorResponse(reply, 401, request.id, {
    error: "UNAUTHENTICATED",
    message: unauthenticatedMessage
  });
}

export function sendForbiddenPermissionResponse(
  request: FastifyRequest,
  reply: FastifyReply,
  actor: ActorContext,
  permission: Permission
): void {
  const message = "Actor không có quyền thực hiện thao tác này.";

  if (acceptsFhirJson(request)) {
    sendFhirOperationOutcome(reply, {
      statusCode: 403,
      code: "forbidden",
      diagnostics: [
        `requestId=${request.id}`,
        `permission=${permission}`,
        `actorId=${actor.actorId}`,
        `actorRole=${actor.role}`,
        `purposeOfUse=${actor.purposeOfUse}`
      ].join("; "),
      expression: ["Authorization", "Permission"],
      details: {
        code: "FORBIDDEN",
        display: "Forbidden",
        text: message
      }
    });

    return;
  }

  sendJsonErrorResponse(reply, 403, request.id, {
    error: "FORBIDDEN",
    message,
    permission,
    actor: {
      id: actor.actorId,
      role: actor.role,
      purposeOfUse: actor.purposeOfUse
    }
  });
}
