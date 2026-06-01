import { AuditEvent } from "./audit-event.js";
import {
  assertValidDate,
  hashAuditPayload,
  hashCanonical,
  normalizeHash
} from "./audit-event.validation.js";
import type { AuditIntegrityReport } from "./audit-event.types.js";

export function sealAuditEvent(event: AuditEvent, previousHash?: string): AuditEvent {
  const snapshot = event.toSnapshot();
  const payloadHash = hashAuditPayload(snapshot);
  const normalizedPreviousHash = previousHash
    ? normalizeHash(previousHash, "previousHash của audit không hợp lệ.")
    : undefined;
  const integrityHash = hashCanonical({
    algorithm: "sha256",
    payloadHash,
    previousHash: normalizedPreviousHash ?? null
  });

  return AuditEvent.rehydrate({
    ...snapshot,
    hashAlgorithm: "sha256",
    previousHash: normalizedPreviousHash,
    payloadHash,
    integrityHash
  });
}

export function buildAuditIntegrityReport(
  patientId: string,
  events: readonly AuditEvent[],
  checkedAt = new Date()
): AuditIntegrityReport {
  assertValidDate(checkedAt, "Thời điểm kiểm tra toàn vẹn audit không hợp lệ.");
  let expectedPreviousHash: string | undefined;
  let sealedEvents = 0;

  for (const event of events) {
    const snapshot = event.toSnapshot();
    const eventId = snapshot.id ?? `${snapshot.occurredAt}:${snapshot.action}`;

    if (
      snapshot.hashAlgorithm !== "sha256" ||
      !snapshot.payloadHash ||
      !snapshot.integrityHash
    ) {
      return {
        patientId,
        checkedAt: checkedAt.toISOString(),
        status: "unsealed",
        verified: false,
        totalEvents: events.length,
        sealedEvents,
        latestHash: expectedPreviousHash,
        brokenAtEventId: eventId,
        brokenReason: "EVENT_NOT_SEALED"
      };
    }

    if (snapshot.previousHash !== expectedPreviousHash) {
      return {
        patientId,
        checkedAt: checkedAt.toISOString(),
        status: "broken",
        verified: false,
        totalEvents: events.length,
        sealedEvents,
        latestHash: expectedPreviousHash,
        brokenAtEventId: eventId,
        brokenReason: "PREVIOUS_HASH_MISMATCH"
      };
    }

    const expectedPayloadHash = hashAuditPayload(snapshot);

    if (snapshot.payloadHash !== expectedPayloadHash) {
      return {
        patientId,
        checkedAt: checkedAt.toISOString(),
        status: "broken",
        verified: false,
        totalEvents: events.length,
        sealedEvents,
        latestHash: expectedPreviousHash,
        brokenAtEventId: eventId,
        brokenReason: "PAYLOAD_HASH_MISMATCH"
      };
    }

    const expectedIntegrityHash = hashCanonical({
      algorithm: "sha256",
      payloadHash: snapshot.payloadHash,
      previousHash: snapshot.previousHash ?? null
    });

    if (snapshot.integrityHash !== expectedIntegrityHash) {
      return {
        patientId,
        checkedAt: checkedAt.toISOString(),
        status: "broken",
        verified: false,
        totalEvents: events.length,
        sealedEvents,
        latestHash: expectedPreviousHash,
        brokenAtEventId: eventId,
        brokenReason: "INTEGRITY_HASH_MISMATCH"
      };
    }

    sealedEvents += 1;
    expectedPreviousHash = snapshot.integrityHash;
  }

  return {
    patientId,
    checkedAt: checkedAt.toISOString(),
    status: "verified",
    verified: true,
    totalEvents: events.length,
    sealedEvents,
    latestHash: expectedPreviousHash
  };
}
