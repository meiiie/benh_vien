import { describe, expect, it } from "vitest";
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
});
