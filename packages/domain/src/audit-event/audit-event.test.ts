import { describe, expect, it } from "vitest";
import {
  mapAuditEventToFhir,
  mapAuditEventsToFhirBundle
} from "../fhir/map-audit-event-to-fhir.js";
import { AuditEvent, buildAuditIntegrityReport, sealAuditEvent } from "./audit-event.js";

describe("AuditEvent integrity chain", () => {
  it("seals audit events with deterministic payload and chain hashes", () => {
    const first = sealAuditEvent(
      AuditEvent.record({
        id: "audit-event-test-001",
        occurredAt: new Date("2026-05-28T00:00:00.000Z"),
        actorId: "auditor-test",
        action: "patient.read",
        resourceType: "Patient",
        resourceId: "patient-test-001",
        patientId: "patient-test-001",
        purposeOfUse: "AUDIT",
        metadata: {
          actorRole: "auditor"
        }
      })
    );
    const second = sealAuditEvent(
      AuditEvent.record({
        id: "audit-event-test-002",
        occurredAt: new Date("2026-05-28T00:01:00.000Z"),
        actorId: "auditor-test",
        action: "audit-event.integrity-verify",
        resourceType: "AuditEvent",
        resourceId: "patient-test-001",
        patientId: "patient-test-001",
        purposeOfUse: "AUDIT",
        metadata: {
          actorRole: "auditor"
        }
      }),
      first.toSnapshot().integrityHash
    );

    const report = buildAuditIntegrityReport("patient-test-001", [first, second]);

    expect(report).toMatchObject({
      patientId: "patient-test-001",
      status: "verified",
      verified: true,
      totalEvents: 2,
      sealedEvents: 2,
      latestHash: second.toSnapshot().integrityHash
    });
    expect(first.toSnapshot().payloadHash).toMatch(/^[a-f0-9]{64}$/);
    expect(second.toSnapshot().previousHash).toBe(first.toSnapshot().integrityHash);
  });

  it("detects audit payload tampering", () => {
    const sealed = sealAuditEvent(
      AuditEvent.record({
        id: "audit-event-test-003",
        occurredAt: new Date("2026-05-28T00:00:00.000Z"),
        actorId: "auditor-test",
        action: "patient.read",
        resourceType: "Patient",
        resourceId: "patient-test-001",
        patientId: "patient-test-001",
        purposeOfUse: "AUDIT",
        metadata: {
          actorRole: "auditor"
        }
      })
    );
    const tampered = AuditEvent.rehydrate({
      ...sealed.toSnapshot(),
      action: "patient.fhir-export"
    });

    const report = buildAuditIntegrityReport("patient-test-001", [tampered]);

    expect(report).toMatchObject({
      status: "broken",
      verified: false,
      brokenAtEventId: "audit-event-test-003",
      brokenReason: "PAYLOAD_HASH_MISMATCH"
    });
  });

  it("marks old audit events without integrity hashes as unsealed", () => {
    const unsealed = AuditEvent.record({
      id: "audit-event-test-004",
      actorId: "auditor-test",
      action: "patient.read",
      resourceType: "Patient",
      resourceId: "patient-test-001",
      patientId: "patient-test-001",
      purposeOfUse: "AUDIT",
      metadata: {}
    });

    const report = buildAuditIntegrityReport("patient-test-001", [unsealed]);

    expect(report).toMatchObject({
      status: "unsealed",
      verified: false,
      brokenAtEventId: "audit-event-test-004",
      brokenReason: "EVENT_NOT_SEALED"
    });
  });

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
});
