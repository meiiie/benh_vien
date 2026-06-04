import { describe, expect, it } from "vitest";
import { mapAuditEventToFhir } from "../fhir/map-audit-event-to-fhir.js";
import { createSealedAuditEvent } from "./audit-event.test-support.js";

describe("AuditEvent FHIR patient lifecycle mapping", () => {
  it("maps patient merge audit events as successful update events in FHIR", () => {
    const mergeEvent = createSealedAuditEvent({
      id: "audit-event-test-patient-merge",
      occurredAt: new Date("2026-05-28T00:04:45.000Z"),
      actorId: "admin-test",
      action: "patient.merge",
      resourceType: "Patient",
      resourceId: "patient-duplicate-001",
      patientId: "patient-duplicate-001",
      purposeOfUse: "TREATMENT",
      metadata: {
        targetPatientId: "patient-canonical-001"
      }
    });

    expect(mapAuditEventToFhir(mergeEvent)).toMatchObject({
      resourceType: "AuditEvent",
      id: "audit-event-test-patient-merge",
      subtype: [
        {
          code: "patient.merge"
        }
      ],
      action: "U",
      recorded: "2026-05-28T00:04:45.000Z",
      outcome: "0",
      outcomeDesc: "Success",
      entity: [
        {
          what: {
            reference: "Patient/patient-duplicate-001"
          },
          name: "patient.merge"
        }
      ]
    });
  });
});
