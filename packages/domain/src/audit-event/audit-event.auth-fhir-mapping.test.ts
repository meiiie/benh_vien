import { describe, expect, it } from "vitest";
import { mapAuditEventToFhir } from "../fhir/map-audit-event-to-fhir.js";
import { createSealedAuditEvent } from "./audit-event.test-support.js";

describe("AuditEvent FHIR authentication mapping", () => {
  it("maps failed login audit events as failed execution events in FHIR", () => {
    const failedLogin = createSealedAuditEvent({
      id: "audit-event-test-007",
      occurredAt: new Date("2026-05-28T00:05:00.000Z"),
      actorId: "anonymous",
      action: "auth.login.failure",
      resourceType: "AuditEvent",
      resourceId: "auth/login",
      purposeOfUse: "OPERATIONS",
      metadata: {
        reason: "INVALID_CREDENTIALS",
        usernameHash: "a".repeat(64)
      }
    });

    const fhirAuditEvent = mapAuditEventToFhir(failedLogin);

    expect(fhirAuditEvent).toMatchObject({
      resourceType: "AuditEvent",
      id: "audit-event-test-007",
      subtype: [
        {
          code: "auth.login.failure"
        }
      ],
      action: "E",
      recorded: "2026-05-28T00:05:00.000Z",
      outcome: "4",
      outcomeDesc: "Authentication failed",
      agent: [
        {
          who: {
            identifier: {
              system: "urn:wiiicare:nexus:audit-actor",
              value: "anonymous",
              type: {
                text: "Internal audit actor identifier"
              }
            },
            display: "anonymous"
          },
          requestor: true,
          purposeOfUse: [
            {
              code: "HOPERAT"
            }
          ]
        }
      ],
      entity: [
        {
          what: {
            identifier: {
              system: "urn:wiiicare:nexus:audit-resource:AuditEvent",
              value: "auth/login",
              type: {
                text: "Internal audit resource identifier"
              }
            },
            display: "AuditEvent/auth/login"
          },
          name: "auth.login.failure"
        }
      ]
    });
    expect(fhirAuditEvent.agent[0]?.who).not.toHaveProperty("reference");
    expect(fhirAuditEvent.entity?.[0]?.what).not.toHaveProperty("reference");
  });
});
