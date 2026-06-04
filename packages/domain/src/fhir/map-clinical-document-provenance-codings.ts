import type { ClinicalDocumentSnapshot } from "../clinical-document/clinical-document.types.js";
import { DomainError } from "../shared/domain-error.js";
import type { FhirProvenance } from "./fhir-types.js";

export const clinicalDocumentProvenanceFhirProfile =
  "http://hl7.org/fhir/StructureDefinition/Provenance";

type SignedClinicalDocumentSnapshot = ClinicalDocumentSnapshot & {
  readonly status: "signed";
  readonly signedAt: string;
};

export function assertSignedClinicalDocumentForProvenance(
  snapshot: ClinicalDocumentSnapshot
): asserts snapshot is SignedClinicalDocumentSnapshot {
  if (snapshot.status !== "signed" || !snapshot.signedAt) {
    throw new DomainError("Chỉ tài liệu bệnh án đã ký mới có FHIR Provenance xác nhận.");
  }
}

export function resolveClinicalDocumentProvenanceSignerId(
  signerPractitionerId: string | undefined,
  authorPractitionerId: string
): string {
  const resolvedSignerPractitionerId = (signerPractitionerId ?? authorPractitionerId).trim();

  if (!resolvedSignerPractitionerId) {
    throw new DomainError("FHIR Provenance cần có người ký hoặc xác nhận tài liệu.");
  }

  return resolvedSignerPractitionerId;
}

export function normalizeClinicalDocumentProvenancePolicyUris(
  policyUris: readonly string[] | undefined
): FhirProvenance["policy"] {
  const normalizedPolicyUris = policyUris
    ?.map((policyUri) => policyUri.trim())
    .filter((policyUri) => policyUri.length > 0);

  return normalizedPolicyUris?.length ? normalizedPolicyUris : undefined;
}

export function buildClinicalDocumentProvenanceActivity(): NonNullable<
  FhirProvenance["activity"]
> {
  return {
    coding: [
      {
        system: "http://terminology.hl7.org/CodeSystem/v3-DataOperation",
        code: "UPDATE",
        display: "revise"
      }
    ],
    text: "Ký và hoàn tất tài liệu bệnh án"
  };
}

export function buildClinicalDocumentProvenanceAgent(
  signerPractitionerId: string,
  organizationId: string | undefined
): FhirProvenance["agent"][number] {
  const normalizedOrganizationId = organizationId?.trim();

  return {
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
    onBehalfOf: normalizedOrganizationId
      ? {
          reference: `Organization/${normalizedOrganizationId}`
        }
      : undefined
  };
}

export function buildClinicalDocumentProvenanceEntity(
  storageUri: string,
  title: string
): NonNullable<FhirProvenance["entity"]>[number] {
  return {
    role: "source",
    what: {
      reference: storageUri,
      display: title
    }
  };
}
