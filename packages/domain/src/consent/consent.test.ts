import { describe, expect, it } from "vitest";
import { createRecordSharingConsent } from "./consent.test-support.js";

describe("Consent record-sharing authorization", () => {
  it("allows record sharing only for the covered patient and organization", () => {
    const consent = createRecordSharingConsent({
      id: "consent-test-001"
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
    const consent = createRecordSharingConsent({
      id: "consent-test-002"
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
