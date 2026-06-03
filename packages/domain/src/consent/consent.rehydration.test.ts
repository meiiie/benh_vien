import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
import { Consent } from "./consent.js";
import { createRecordSharingConsent } from "./consent.test-support.js";

describe("Consent rehydration", () => {
  it("rejects inconsistent revoked snapshots", () => {
    const snapshot = createRecordSharingConsent({
      id: "consent-test-005",
      validUntil: undefined
    }).toSnapshot();

    expect(() =>
      Consent.rehydrate({
        ...snapshot,
        status: "revoked"
      })
    ).toThrow("Consent đã thu hồi phải có người thu hồi và thời điểm thu hồi.");
  });

  it("rejects invalid rehydrated consent lifecycle data", () => {
    const snapshot = createRecordSharingConsent({
      id: "consent-test-007"
    }).toSnapshot();

    expect(() =>
      Consent.rehydrate({
        ...snapshot,
        status: "unknown" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      Consent.rehydrate({
        ...snapshot,
        category: "marketing" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      Consent.rehydrate({
        ...snapshot,
        validUntil: "2026-05-27T00:00:00.000Z"
      })
    ).toThrow(DomainError);

    expect(() =>
      Consent.rehydrate({
        ...snapshot,
        createdAt: "not-a-date"
      })
    ).toThrow(DomainError);

    expect(() =>
      Consent.rehydrate({
        ...snapshot,
        updatedAt: "1999-01-01T00:00:00.000Z"
      })
    ).toThrow(DomainError);

    expect(() =>
      Consent.rehydrate({
        ...snapshot,
        status: "revoked",
        revokedByActorId: "practitioner-test",
        revokedAt: "2026-05-27T23:59:59.000Z"
      })
    ).toThrow(DomainError);

    expect(() =>
      Consent.rehydrate({
        ...snapshot,
        status: "revoked",
        revokedByActorId: "practitioner-test",
        revokedAt: "2026-05-29T00:00:01.000Z"
      })
    ).toThrow(DomainError);
  });
});
