import { describe, expect, it } from "vitest";
import {
  mapAuditEventToFhir,
  mapAuditEventsToFhirBundle
} from "../fhir/map-audit-event-to-fhir.js";
import { AuditEvent, sealAuditEvent } from "./audit-event.js";

describe("AuditEvent FHIR mapping", () => {
  it("maps sealed audit events to FHIR AuditEvent and collection Bundle", () => {
    const sealed = sealAuditEvent(
      AuditEvent.record({
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
      })
    );

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

  it("maps denied access audit events as failed execution events in FHIR", () => {
    const deniedAccess = sealAuditEvent(
      AuditEvent.record({
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
      })
    );

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
    const identifierConflict = sealAuditEvent(
      AuditEvent.record({
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
      })
    );

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

  it("maps patient merge audit events as successful update events in FHIR", () => {
    const mergeEvent = sealAuditEvent(
      AuditEvent.record({
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
      })
    );

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

  it("maps failed login audit events as failed execution events in FHIR", () => {
    const failedLogin = sealAuditEvent(
      AuditEvent.record({
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
      })
    );

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
