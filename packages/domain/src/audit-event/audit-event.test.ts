import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
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

  it("rejects invalid audit event payloads and seal metadata", () => {
    const baseInput = createAuditEventInput();
    const snapshot = AuditEvent.record(baseInput).toSnapshot();

    expect(() =>
      AuditEvent.record({
        ...baseInput,
        occurredAt: new Date("not-a-date")
      })
    ).toThrow(DomainError);

    expect(() =>
      AuditEvent.record({
        ...baseInput,
        action: "patient.delete" as never
      })
    ).toThrow(DomainError);

    for (const invalidSnapshot of [
      {
        ...snapshot,
        occurredAt: "not-a-date"
      },
      {
        ...snapshot,
        action: "patient.delete" as never
      },
      {
        ...snapshot,
        resourceType: "Binary" as never
      },
      {
        ...snapshot,
        metadata: null as never
      },
      {
        ...snapshot,
        hashAlgorithm: "sha1" as never,
        payloadHash: "a".repeat(64),
        integrityHash: "b".repeat(64)
      },
      {
        ...snapshot,
        hashAlgorithm: "sha256" as const,
        payloadHash: "not-a-sha256",
        integrityHash: "b".repeat(64)
      },
      {
        ...snapshot,
        hashAlgorithm: "sha256" as const,
        payloadHash: "a".repeat(64)
      }
    ]) {
      expect(() => AuditEvent.rehydrate(invalidSnapshot)).toThrow(DomainError);
    }

    expect(() => sealAuditEvent(AuditEvent.rehydrate(snapshot), "not-a-sha256")).toThrow(
      DomainError
    );
    expect(() =>
      buildAuditIntegrityReport("patient-test-001", [], new Date("not-a-date"))
    ).toThrow(DomainError);
  });

});

function createAuditEventInput(): Parameters<typeof AuditEvent.record>[0] {
  return {
    id: "audit-event-invalid-fixture",
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
  };
}
