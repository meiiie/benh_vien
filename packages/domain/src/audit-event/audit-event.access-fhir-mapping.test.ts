import { describe, expect, it } from "vitest";
import { mapAuditEventToFhir } from "../fhir/map-audit-event-to-fhir.js";
import { createSealedAuditEvent } from "./audit-event.test-support.js";

describe("AuditEvent FHIR access failure mapping", () => {
  it("maps denied access audit events as failed execution events in FHIR", () => {
    const deniedAccess = createSealedAuditEvent({
      id: "audit-event-test-006",
      occurredAt: new Date("2026-05-28T00:04:00.000Z"),
      actorId: "clinician-test",
      action: "access.denied",
      resourceType: "Patient",
      resourceId: "patient-test-001",
      patientId: "patient-test-001",
      purposeOfUse: "TREATMENT",
      metadata: {
        denialCode: "PATIENT_ACCESS_DENIED",
        statusCode: 403
      }
    });

    expect(mapAuditEventToFhir(deniedAccess)).toMatchObject({
      resourceType: "AuditEvent",
      id: "audit-event-test-006",
      subtype: [
        {
          code: "access.denied"
        }
      ],
      action: "E",
      recorded: "2026-05-28T00:04:00.000Z",
      outcome: "4",
      outcomeDesc: "Access denied",
      agent: [
        {
          who: {
            reference: "Practitioner/clinician-test"
          },
          requestor: true,
          purposeOfUse: [
            {
              code: "TREAT"
            }
          ]
        }
      ],
      entity: [
        {
          what: {
            reference: "Patient/patient-test-001"
          },
          name: "access.denied"
        }
      ]
    });
  });

  it("maps patient identifier conflicts as failed execution events in FHIR", () => {
    const identifierConflict = createSealedAuditEvent({
      id: "audit-event-test-identifier-conflict",
      occurredAt: new Date("2026-05-28T00:04:30.000Z"),
      actorId: "admin-test",
      action: "patient.identifier-conflict",
      resourceType: "Patient",
      resourceId: "patient-test-001",
      patientId: "patient-test-001",
      purposeOfUse: "TREATMENT",
      metadata: {
        identifierSystem: "urn:gov:vietnam:national-id",
        identifierType: "national-id"
      }
    });

    expect(mapAuditEventToFhir(identifierConflict)).toMatchObject({
      resourceType: "AuditEvent",
      id: "audit-event-test-identifier-conflict",
      subtype: [
        {
          code: "patient.identifier-conflict"
        }
      ],
      action: "E",
      recorded: "2026-05-28T00:04:30.000Z",
      outcome: "4",
      outcomeDesc: "Patient identifier conflict",
      entity: [
        {
          what: {
            reference: "Patient/patient-test-001"
          },
          name: "patient.identifier-conflict"
        }
      ]
    });
  });
});
