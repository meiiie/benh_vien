import type { Consent, ConsentCategory, ConsentStatus } from "../consent/consent.js";
import type { FhirConsent } from "./fhir-types.js";

const consentCategoryLabels: Record<ConsentCategory, string> = {
  "record-sharing": "Đồng ý chia sẻ hồ sơ bệnh án"
};

export function mapConsentToFhir(consent: Consent): FhirConsent {
  const snapshot = consent.toSnapshot();
  const revocationExtension = buildRevocationExtension(snapshot);

  return {
    resourceType: "Consent",
    id: snapshot.id,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Consent"]
    },
    extension: revocationExtension ? [revocationExtension] : undefined,
    identifier: [
      {
        system: "urn:wiiicare:nexus:consent",
        value: snapshot.id,
        type: {
          text: "Mã đồng ý chia sẻ hồ sơ"
        }
      }
    ],
    status: mapConsentStatus(snapshot.status),
    scope: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/consentscope",
          code: "patient-privacy",
          display: "Privacy Consent"
        }
      ],
      text: "Đồng ý quyền riêng tư và chia sẻ dữ liệu bệnh án"
    },
    category: [
      {
        coding: [
          {
            system: "urn:wiiicare:nexus:consent-category",
            code: snapshot.category,
            display: consentCategoryLabels[snapshot.category]
          }
        ],
        text: consentCategoryLabels[snapshot.category]
      }
    ],
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
    provision: {
      type: "permit",
      period: {
        start: snapshot.validFrom,
        end: snapshot.revokedAt ?? snapshot.validUntil
      },
      actor: [
        {
          role: {
            text: "Đơn vị được nhận dữ liệu"
          },
          reference: {
            reference: `Organization/${snapshot.granteeOrganizationId}`
          }
        }
      ],
      action: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/consentaction",
              code: "disclose",
              display: "Disclose"
            }
          ],
          text: "Chia sẻ hồ sơ bệnh án"
        }
      ],
      purpose: [
        {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActReason",
          code: "TREAT",
          display: "Treatment"
        }
      ],
      class: [
        {
          system: "http://hl7.org/fhir/resource-types",
          code: "Bundle",
          display: "Bundle"
        },
        {
          system: "http://hl7.org/fhir/resource-types",
          code: "DocumentReference",
          display: "DocumentReference"
        }
      ]
    }
  };
}

function mapConsentStatus(status: ConsentStatus): FhirConsent["status"] {
  if (status === "active") {
    return "active";
  }

  return "inactive";
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
