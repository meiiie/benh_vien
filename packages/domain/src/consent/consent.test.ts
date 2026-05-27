import { describe, expect, it } from "vitest";
import { mapConsentToFhir } from "../fhir/map-consent-to-fhir.js";
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

  it("maps active and revoked record-sharing consent to FHIR Consent", () => {
    const consent = Consent.grant({
      id: "consent-test-006",
      patientId: "patient-test-001",
      category: "record-sharing",
      granteeOrganizationId: "hospital-recipient",
      grantorActorId: "practitioner-test",
      evidenceDocumentId: "clinical-document-consent-001",
      validFrom: "2026-05-28T00:00:00.000Z",
      validUntil: "2026-05-29T00:00:00.000Z"
    });

    expect(mapConsentToFhir(consent)).toMatchObject({
      resourceType: "Consent",
      id: "consent-test-006",
      status: "active",
      patient: {
        reference: "Patient/patient-test-001"
      },
      sourceReference: {
        reference: "DocumentReference/clinical-document-consent-001"
      },
      provision: {
        type: "permit",
        actor: [
          {
            reference: {
              reference: "Organization/hospital-recipient"
            }
          }
        ],
        period: {
          start: "2026-05-28T00:00:00.000Z",
          end: "2026-05-29T00:00:00.000Z"
        }
      }
    });

    consent.revoke({
      revokedByActorId: "practitioner-test",
      revokedAt: new Date("2026-05-28T12:00:00.000Z"),
      reason: "Người bệnh rút lại đồng ý chia sẻ hồ sơ."
    });

    const revokedFhir = mapConsentToFhir(consent);

    expect(revokedFhir.status).toBe("inactive");
    expect(revokedFhir.provision?.period?.end).toBe("2026-05-28T12:00:00.000Z");
    expect(revokedFhir.extension?.[0]).toMatchObject({
      url: "urn:wiiicare:nexus:fhir:StructureDefinition/consent-revocation",
      extension: expect.arrayContaining([
        expect.objectContaining({
          url: "revokedByActor",
          valueReference: {
            reference: "Practitioner/practitioner-test"
          }
        }),
        expect.objectContaining({
          url: "revokedAt",
          valueDateTime: "2026-05-28T12:00:00.000Z"
        }),
        expect.objectContaining({
          url: "reason",
          valueString: "Người bệnh rút lại đồng ý chia sẻ hồ sơ."
        })
      ])
    });
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
