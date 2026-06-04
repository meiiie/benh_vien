import type { ClinicalDocument } from "../clinical-document/clinical-document.js";
import type { FhirDocumentReference } from "./fhir-types.js";
import {
  documentReferenceFhirProfile,
  toDocumentReferenceContent,
  toDocumentReferenceDocStatus,
  toDocumentReferenceStatus,
  toDocumentReferenceType
} from "./map-clinical-document-codings.js";

export function mapClinicalDocumentToFhir(document: ClinicalDocument): FhirDocumentReference {
  const snapshot = document.toSnapshot();

  return {
    resourceType: "DocumentReference",
    id: snapshot.id,
    meta: {
      profile: [documentReferenceFhirProfile]
    },
    status: toDocumentReferenceStatus(snapshot.status),
    docStatus: toDocumentReferenceDocStatus(snapshot.status),
    type: toDocumentReferenceType(snapshot.type),
    subject: {
      reference: `Patient/${snapshot.patientId}`
    },
    context: snapshot.encounterId
      ? {
          encounter: [
            {
              reference: `Encounter/${snapshot.encounterId}`
            }
          ]
        }
      : undefined,
    author: [
      {
        reference: `Practitioner/${snapshot.authorPractitionerId}`
      }
    ],
    date: snapshot.signedAt ?? snapshot.updatedAt,
    content: toDocumentReferenceContent(snapshot)
  };
}
