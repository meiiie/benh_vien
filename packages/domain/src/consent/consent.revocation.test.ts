import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
import {
  consentRevocationReason,
  createRecordSharingConsent
} from "./consent.test-support.js";

describe("Consent revocation", () => {
  it("denies record sharing after consent is revoked", () => {
    const consent = createRecordSharingConsent({
      id: "consent-test-003"
    });

    consent.revoke({
      revokedByActorId: "practitioner-test",
      revokedAt: new Date("2026-05-28T12:00:00.000Z"),
      reason: consentRevocationReason
    });

    expect(consent.toSnapshot()).toMatchObject({
      status: "revoked",
      revokedByActorId: "practitioner-test",
      revokedAt: "2026-05-28T12:00:00.000Z",
      revocationReason: consentRevocationReason
    });
    expect(
      consent.allowsRecordSharing({
        patientId: "patient-test-001",
        granteeOrganizationId: "hospital-recipient",
        at: new Date("2026-05-28T12:01:00.000Z")
      })
    ).toBe(false);
  });

  it("does not revoke an inactive consent twice", () => {
    const consent = createRecordSharingConsent({
      id: "consent-test-004",
      validUntil: undefined
    });

    consent.revoke({
      revokedByActorId: "practitioner-test"
    });

    expect(() =>
      consent.revoke({
        revokedByActorId: "practitioner-test"
      })
    ).toThrow("Chỉ consent đang hiệu lực mới được thu hồi.");
  });

  it("rejects invalid revocation timestamps", () => {
    const consent = createRecordSharingConsent({
      id: "consent-test-008",
      validUntil: undefined
    });

    expect(() =>
      consent.revoke({
        revokedByActorId: "practitioner-test",
        revokedAt: new Date("not-a-date")
      })
    ).toThrow(DomainError);
  });

  it("rejects revocation timestamps outside the consent period", () => {
    const consent = createRecordSharingConsent({
      id: "consent-test-009"
    });

    expect(() =>
      consent.revoke({
        revokedByActorId: "practitioner-test",
        revokedAt: new Date("2026-05-27T23:59:59.000Z")
      })
    ).toThrow(DomainError);

    expect(() =>
      consent.revoke({
        revokedByActorId: "practitioner-test",
        revokedAt: new Date("2026-05-29T00:00:01.000Z")
      })
    ).toThrow(DomainError);
  });
});
