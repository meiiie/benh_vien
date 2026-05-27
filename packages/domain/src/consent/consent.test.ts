import { describe, expect, it } from "vitest";
import { Consent } from "./consent.js";

describe("Consent", () => {
  it("allows record sharing only for the covered patient and organization", () => {
    const consent = Consent.grant({
      id: "consent-test-001",
      patientId: "patient-test-001",
      category: "record-sharing",
      granteeOrganizationId: "hospital-recipient",
      grantorActorId: "practitioner-test",
      validFrom: "2026-05-28T00:00:00.000Z",
      validUntil: "2026-05-29T00:00:00.000Z"
    });

    expect(
      consent.allowsRecordSharing({
        patientId: "patient-test-001",
        granteeOrganizationId: "hospital-recipient",
        at: new Date("2026-05-28T12:00:00.000Z")
      })
    ).toBe(true);

    expect(
      consent.allowsRecordSharing({
        patientId: "patient-test-001",
        granteeOrganizationId: "hospital-other",
        at: new Date("2026-05-28T12:00:00.000Z")
      })
    ).toBe(false);
  });

  it("denies expired record sharing", () => {
    const consent = Consent.grant({
      id: "consent-test-002",
      patientId: "patient-test-001",
      category: "record-sharing",
      granteeOrganizationId: "hospital-recipient",
      grantorActorId: "practitioner-test",
      validFrom: "2026-05-28T00:00:00.000Z",
      validUntil: "2026-05-29T00:00:00.000Z"
    });

    expect(
      consent.allowsRecordSharing({
        patientId: "patient-test-001",
        granteeOrganizationId: "hospital-recipient",
        at: new Date("2026-05-30T00:00:00.000Z")
      })
    ).toBe(false);
  });

  it("denies record sharing after consent is revoked", () => {
    const consent = Consent.grant({
      id: "consent-test-003",
      patientId: "patient-test-001",
      category: "record-sharing",
      granteeOrganizationId: "hospital-recipient",
      grantorActorId: "practitioner-test",
      validFrom: "2026-05-28T00:00:00.000Z",
      validUntil: "2026-05-29T00:00:00.000Z"
    });

    consent.revoke({
      revokedByActorId: "practitioner-test",
      revokedAt: new Date("2026-05-28T12:00:00.000Z"),
      reason: "Người bệnh rút lại đồng ý chia sẻ hồ sơ."
    });

    expect(consent.toSnapshot()).toMatchObject({
      status: "revoked",
      revokedByActorId: "practitioner-test",
      revokedAt: "2026-05-28T12:00:00.000Z",
      revocationReason: "Người bệnh rút lại đồng ý chia sẻ hồ sơ."
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
    const consent = Consent.grant({
      id: "consent-test-004",
      patientId: "patient-test-001",
      category: "record-sharing",
      granteeOrganizationId: "hospital-recipient",
      grantorActorId: "practitioner-test",
      validFrom: "2026-05-28T00:00:00.000Z"
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

  it("rejects inconsistent revoked snapshots", () => {
    expect(() =>
      Consent.rehydrate({
        id: "consent-test-005",
        patientId: "patient-test-001",
        status: "revoked",
        category: "record-sharing",
        granteeOrganizationId: "hospital-recipient",
        grantorActorId: "practitioner-test",
        validFrom: "2026-05-28T00:00:00.000Z",
        createdAt: "2026-05-28T00:00:00.000Z",
        updatedAt: "2026-05-28T00:00:00.000Z"
      })
    ).toThrow("Consent đã thu hồi phải có người thu hồi và thời điểm thu hồi.");
  });
});
