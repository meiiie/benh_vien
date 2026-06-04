import { describe, expect, it } from "vitest";
import { mapConsentToFhir } from "../fhir/map-consent-to-fhir.js";
import {
  consentRevocationReason,
  createRecordSharingConsent
} from "./consent.test-support.js";

describe("Consent FHIR mapping", () => {
  it("maps active and revoked record-sharing consent to FHIR Consent", () => {
    const consent = createRecordSharingConsent({
      id: "consent-test-006",
      evidenceDocumentId: "clinical-document-consent-001"
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
      reason: consentRevocationReason
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
          valueString: consentRevocationReason
        })
      ])
    });
  });
});
