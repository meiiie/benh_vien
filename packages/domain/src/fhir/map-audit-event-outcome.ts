import type { AuditAction } from "../audit-event/audit-event.js";
import type { FhirAuditEvent } from "./fhir-types.js";

export function mapAuditAction(action: AuditAction): FhirAuditEvent["action"] {
  if (action.endsWith(".create")) {
    return "C";
  }

  if (
    action.endsWith(".sign") ||
    action.endsWith(".finish") ||
    action.endsWith(".revoke") ||
    action.endsWith(".merge") ||
    action.endsWith(".dead-letter") ||
    action.endsWith(".acknowledgement-callback")
  ) {
    return "U";
  }

  if (
    action.endsWith(".integrity-verify") ||
    action.endsWith(".identifier-conflict") ||
    action === "access.denied" ||
    action.startsWith("auth.login.")
  ) {
    return "E";
  }

  return "R";
}

export function mapAuditOutcome(action: AuditAction): FhirAuditEvent["outcome"] {
  return action === "access.denied" ||
    action === "auth.login.failure" ||
    action === "patient.identifier-conflict"
    ? "4"
    : "0";
}

export function mapAuditOutcomeDescription(action: AuditAction): string {
  if (action === "auth.login.failure") {
    return "Authentication failed";
  }

  if (action === "access.denied") {
    return "Access denied";
  }

  return action === "patient.identifier-conflict"
    ? "Patient identifier conflict"
    : "Success";
}

export function mapPurposeOfUse(purposeOfUse: string) {
  const purposeMap: Record<string, { readonly code: string; readonly display: string }> = {
    TREATMENT: {
      code: "TREAT",
      display: "Treatment"
    },
    AUDIT: {
      code: "AUDIT",
      display: "Audit"
    },
    OPERATIONS: {
      code: "HOPERAT",
      display: "Healthcare operations"
    }
  };
  const mapped = purposeMap[purposeOfUse] ?? {
    code: purposeOfUse,
    display: purposeOfUse
  };

  return {
    system: "http://terminology.hl7.org/CodeSystem/v3-ActReason",
    code: mapped.code,
    display: mapped.display
  };
}
