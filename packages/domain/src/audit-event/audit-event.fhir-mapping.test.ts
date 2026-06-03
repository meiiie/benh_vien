import { describe, expect, it } from "vitest";
import {
  mapAuditEventToFhir,
  mapAuditEventsToFhirBundle
} from "../fhir/map-audit-event-to-fhir.js";
import { createSealedAuditEvent } from "./audit-event.test-support.js";

describe("AuditEvent FHIR collection mapping", () => {
  it("maps sealed audit events to FHIR AuditEvent and collection Bundle", () => {
    const sealed = createSealedAuditEvent({
      id: "audit-event-test-005",
      occurredAt: new Date("2026-05-28T00:02:00.000Z"),
      actorId: "auditor-test",
      action: "audit-event.fhir-export",
      resourceType: "AuditEvent",
      resourceId: "patient-test-001",
      patientId: "patient-test-001",
      purposeOfUse: "AUDIT",
      ipAddress: "127.0.0.1",
      metadata: {
        format: "Bundle.collection"
      }
    });

    expect(mapAuditEventToFhir(sealed)).toMatchObject({
      resourceType: "AuditEvent",
      id: "audit-event-test-005",
      type: {
        code: "rest"
      },
      subtype: [
        {
          code: "audit-event.fhir-export"
        }
      ],
      action: "R",
      recorded: "2026-05-28T00:02:00.000Z",
      outcome: "0",
      agent: [
        {
          who: {
            reference: "Practitioner/auditor-test"
          },
          requestor: true,
          purposeOfUse: [
            {
              code: "AUDIT"
            }
          ],
          network: {
            address: "127.0.0.1",
            type: "2"
          }
        }
      ],
      entity: [
        {
          what: {
            reference: "AuditEvent/patient-test-001"
          }
        }
      ]
    });

    const bundle = mapAuditEventsToFhirBundle(
      "patient-test-001",
      [sealed],
      new Date("2026-05-28T00:03:00.000Z")
    );

    expect(bundle).toMatchObject({
      resourceType: "Bundle",
      id: "patient-audit-patient-test-001",
      type: "collection",
      timestamp: "2026-05-28T00:03:00.000Z",
      entry: [
        {
          fullUrl: "urn:wiiicare:nexus:AuditEvent:audit-event-test-005",
          resource: {
            resourceType: "AuditEvent",
            id: "audit-event-test-005"
          }
        }
      ]
    });
  });
});
