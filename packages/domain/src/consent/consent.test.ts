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
});
