import {
  deniedAccessErrorCodes,
  type DeniedAccessError,
  type DeniedAccessPayload
} from "./denied-access-audit.types.js";

export function parseDeniedAccessPayload(payload: string): DeniedAccessPayload | undefined {
  try {
    const parsedPayload = JSON.parse(payload) as unknown;

    if (isDeniedAccessPayload(parsedPayload)) {
      return parsedPayload;
    }

    return parseDeniedAccessOperationOutcome(parsedPayload);
  } catch {
    return undefined;
  }
}

function parseDeniedAccessOperationOutcome(value: unknown): DeniedAccessPayload | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  if ((value as { readonly resourceType?: unknown }).resourceType !== "OperationOutcome") {
    return undefined;
  }

  const firstIssue = readFirstOperationOutcomeIssue(value);
  const code = firstIssue?.details?.coding?.find((coding) =>
    isDeniedAccessError(coding.code)
  )?.code;

  if (!isDeniedAccessError(code)) {
    return undefined;
  }

  const diagnostics = parseOperationOutcomeDiagnostics(firstIssue?.diagnostics);

  return {
    error: code,
    requestId: diagnostics.requestId,
    permission: diagnostics.permission,
    patientId: diagnostics.patientId,
    actor: {
      id: diagnostics.actorId,
      role: diagnostics.actorRole,
      purposeOfUse: diagnostics.purposeOfUse
    }
  };
}

function readFirstOperationOutcomeIssue(value: object):
  | {
      readonly details?: {
        readonly coding?: readonly { readonly code?: unknown }[];
      };
      readonly diagnostics?: unknown;
    }
  | undefined {
  const issue = (value as { readonly issue?: unknown }).issue;

  return Array.isArray(issue) ? issue[0] : undefined;
}

function parseOperationOutcomeDiagnostics(value: unknown): Record<string, string> {
  if (typeof value !== "string") {
    return {};
  }

  return Object.fromEntries(
    value
      .split(";")
      .map((part) => part.trim().split("="))
      .filter(
        (entry): entry is [string, string] =>
          entry.length === 2 && entry[0].length > 0 && entry[1].length > 0
      )
  );
}

function isDeniedAccessPayload(value: unknown): value is DeniedAccessPayload {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return isDeniedAccessError((value as { readonly error?: unknown }).error);
}

function isDeniedAccessError(value: unknown): value is DeniedAccessError {
  return typeof value === "string" && deniedAccessErrorCodes.has(value as DeniedAccessError);
}
