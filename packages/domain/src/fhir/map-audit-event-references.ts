import type { AuditEventSnapshot, AuditResourceType } from "../audit-event/audit-event.js";
import type { FhirAuditEvent } from "./fhir-types.js";

type FhirAuditEventEntityWhat = NonNullable<
  NonNullable<FhirAuditEvent["entity"]>[number]["what"]
>;
type FhirAuditEventAgentWho = NonNullable<
  NonNullable<FhirAuditEvent["agent"]>[number]["who"]
>;

const fhirResourceByAuditResource: Record<AuditResourceType, string> = {
  Patient: "Patient",
  ProviderDirectory: "Bundle",
  RecordTransfer: "Task",
  Encounter: "Encounter",
  AllergyIntolerance: "AllergyIntolerance",
  Condition: "Condition",
  MedicationRequest: "MedicationRequest",
  MedicationDispense: "MedicationDispense",
  MedicationAdministration: "MedicationAdministration",
  Observation: "Observation",
  ServiceRequest: "ServiceRequest",
  Task: "Task",
  Procedure: "Procedure",
  DiagnosticReport: "DiagnosticReport",
  ImagingStudy: "ImagingStudy",
  ClinicalDocument: "DocumentReference",
  Consent: "Consent",
  AuditEvent: "AuditEvent"
};
const fhirIdPattern = /^[A-Za-z0-9-.]{1,64}$/;

export function buildAuditAgentReference(
  snapshot: AuditEventSnapshot
): FhirAuditEventAgentWho {
  if (
    snapshot.actorId !== "anonymous" &&
    !isSystemActor(snapshot) &&
    fhirIdPattern.test(snapshot.actorId)
  ) {
    return {
      reference: `Practitioner/${snapshot.actorId}`,
      display: snapshot.actorId
    };
  }

  return {
    identifier: {
      system: "urn:wiiicare:nexus:audit-actor",
      value: snapshot.actorId,
      type: {
        text: "Internal audit actor identifier"
      }
    },
    display: snapshot.actorId
  };
}

export function buildAuditEntityReference(
  snapshot: AuditEventSnapshot
): FhirAuditEventEntityWhat {
  const display = `${snapshot.resourceType}/${snapshot.resourceId}`;
  const fhirResourceType = fhirResourceByAuditResource[snapshot.resourceType];

  if (fhirIdPattern.test(snapshot.resourceId)) {
    return {
      reference: `${fhirResourceType}/${snapshot.resourceId}`,
      display
    };
  }

  return {
    identifier: {
      system: `urn:wiiicare:nexus:audit-resource:${snapshot.resourceType}`,
      value: snapshot.resourceId,
      type: {
        text: "Internal audit resource identifier"
      }
    },
    display
  };
}

function isSystemActor(snapshot: AuditEventSnapshot): boolean {
  return (
    snapshot.metadata.actorRole === "integration" ||
    snapshot.actorId.startsWith("system-")
  );
}
