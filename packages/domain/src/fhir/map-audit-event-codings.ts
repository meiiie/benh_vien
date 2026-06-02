import type { AuditAction } from "../audit-event/audit-event.types.js";
import type { FhirAuditEvent, FhirBundle } from "./fhir-types.js";
import { auditActionLabels } from "./map-audit-event-labels.js";

export const auditEventFhirProfile = "http://hl7.org/fhir/StructureDefinition/AuditEvent";
export const auditEventBundleFhirProfile = "http://hl7.org/fhir/StructureDefinition/Bundle";
export const auditEventBundleIdentifierSystem = "urn:wiiicare:nexus:fhir-audit-bundle";

export function buildAuditEventType(): FhirAuditEvent["type"] {
  return {
    system: "http://terminology.hl7.org/CodeSystem/audit-event-type",
    code: "rest",
    display: "RESTful Operation"
  };
}

export function buildAuditEventSubtype(
  action: AuditAction
): NonNullable<FhirAuditEvent["subtype"]> {
  return [
    {
      system: "urn:wiiicare:nexus:audit-action",
      code: action,
      display: auditActionLabels[action]
    }
  ];
}

export function buildAuditEventSource(): FhirAuditEvent["source"] {
  return {
    site: "WiiiCare Nexus",
    observer: {
      display: "WiiiCare Nexus API"
    },
    type: [
      {
        system: "urn:wiiicare:nexus:audit-source-type",
        code: "application-server",
        display: "Application server"
      }
    ]
  };
}

export function buildAuditEventBundleIdentifier(
  patientId: string,
  timestampIso: string
): NonNullable<FhirBundle["identifier"]> {
  return {
    system: auditEventBundleIdentifierSystem,
    value: `audit-events:${patientId}:${timestampIso}`
  };
}
