import type { ClinicalDocument } from "../clinical-document/clinical-document.js";
import { DomainError } from "../shared/domain-error.js";
import type { FhirProvenance } from "./fhir-types.js";

export type MapClinicalDocumentToFhirProvenanceOptions = {
  readonly organizationId?: string;
  readonly policyUris?: readonly string[];
  readonly recordedAt?: Date;
  readonly signerPractitionerId?: string;
};

export function mapClinicalDocumentToFhirProvenance(
  document: ClinicalDocument,
  options: MapClinicalDocumentToFhirProvenanceOptions = {}
): FhirProvenance {
  const snapshot = document.toSnapshot();

  if (snapshot.status !== "signed" || !snapshot.signedAt) {
    throw new DomainError("Chỉ tài liệu bệnh án đã ký mới có FHIR Provenance xác nhận.");
  }

  const signerPractitionerId = (
    options.signerPractitionerId ?? snapshot.authorPractitionerId
  ).trim();

  if (!signerPractitionerId) {
    throw new DomainError("FHIR Provenance cần có người ký hoặc xác nhận tài liệu.");
  }

  const organizationId = options.organizationId?.trim();
  const policyUris = options.policyUris?.filter((policyUri) => policyUri.trim().length > 0);

  return {
    resourceType: "Provenance",
    id: `${snapshot.id}-provenance`,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Provenance"]
    },
    target: [
      {
        reference: `DocumentReference/${snapshot.id}`,
        display: snapshot.title
      }
    ],
    occurredDateTime: snapshot.signedAt,
    recorded: options.recordedAt?.toISOString() ?? snapshot.signedAt,
    policy: policyUris?.length ? policyUris : undefined,
    activity: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/v3-DataOperation",
          code: "UPDATE",
          display: "revise"
        }
      ],
      text: "Ký và hoàn tất tài liệu bệnh án"
    },
    agent: [
      {
        type: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
              code: "AUT",
              display: "author (originator)"
            }
          ],
          text: "Người tạo hoặc ký xác nhận"
        },
        role: [
          {
            text: "Người chịu trách nhiệm chuyên môn đối với tài liệu"
          }
        ],
        who: {
          reference: `Practitioner/${signerPractitionerId}`,
          display: signerPractitionerId
        },
        onBehalfOf: organizationId
          ? {
              reference: `Organization/${organizationId}`
            }
          : undefined
      }
    ],
    entity: [
      {
        role: "source",
        what: {
          reference: snapshot.storageUri,
          display: snapshot.title
        }
      }
    ]
  };
}
