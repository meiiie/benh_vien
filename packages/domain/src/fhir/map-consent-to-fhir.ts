import type { Consent } from "../consent/consent.js";
import type { FhirConsent } from "./fhir-types.js";
import {
  buildConsentCategory,
  buildConsentIdentifier,
  buildConsentProvision,
  buildConsentScope,
  consentFhirProfile,
  mapConsentStatus
} from "./map-consent-codings.js";

export function mapConsentToFhir(consent: Consent): FhirConsent {
  const snapshot = consent.toSnapshot();
  const revocationExtension = buildRevocationExtension(snapshot);

  return {
    resourceType: "Consent",
    id: snapshot.id,
    meta: {
      profile: [consentFhirProfile]
    },
    extension: revocationExtension ? [revocationExtension] : undefined,
    identifier: [buildConsentIdentifier(snapshot.id)],
    status: mapConsentStatus(snapshot.status),
    scope: buildConsentScope(),
    category: [buildConsentCategory(snapshot.category)],
    patient: {
      reference: `Patient/${snapshot.patientId}`
    },
    dateTime: snapshot.createdAt,
    performer: [
      {
        reference: `Practitioner/${snapshot.grantorActorId}`
      }
    ],
    sourceReference: snapshot.evidenceDocumentId
      ? {
          reference: `DocumentReference/${snapshot.evidenceDocumentId}`
        }
      : undefined,
    provision: buildConsentProvision(snapshot)
  };
}

function buildRevocationExtension(
  snapshot: ReturnType<Consent["toSnapshot"]>
): NonNullable<FhirConsent["extension"]>[number] | undefined {
  if (!snapshot.revokedByActorId || !snapshot.revokedAt) {
    return undefined;
  }

  return {
    url: "urn:wiiicare:nexus:fhir:StructureDefinition/consent-revocation",
    extension: [
      {
        url: "revokedByActor",
        valueReference: {
          reference: `Practitioner/${snapshot.revokedByActorId}`
        }
      },
      {
        url: "revokedAt",
        valueDateTime: snapshot.revokedAt
      },
      ...(snapshot.revocationReason
        ? [
            {
              url: "reason",
              valueString: snapshot.revocationReason
            }
          ]
        : [])
    ]
  };
}
