import type {
  ClinicalDocument,
  ClinicalDocumentStatus,
  ClinicalDocumentType
} from "../clinical-document/clinical-document.js";
import type { FhirDocumentReference } from "./fhir-types.js";

const documentTypeLabels: Record<ClinicalDocumentType, string> = {
  "admission-note": "Phiếu nhập viện",
  "discharge-summary": "Tóm tắt ra viện",
  "lab-report": "Phiếu kết quả xét nghiệm",
  "imaging-report": "Phiếu kết quả chẩn đoán hình ảnh",
  "referral-letter": "Giấy chuyển tuyến",
  "consent-form": "Phiếu đồng ý điều trị"
};

export function mapClinicalDocumentToFhir(document: ClinicalDocument): FhirDocumentReference {
  const snapshot = document.toSnapshot();

  return {
    resourceType: "DocumentReference",
    id: snapshot.id,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/DocumentReference"]
    },
    status: mapDocumentReferenceStatus(snapshot.status),
    docStatus: mapDocumentReferenceDocStatus(snapshot.status),
    type: {
      text: documentTypeLabels[snapshot.type]
    },
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
    content: [
      {
        attachment: {
          url: snapshot.storageUri,
          title: snapshot.title
        }
      }
    ]
  };
}

function mapDocumentReferenceStatus(
  status: ClinicalDocumentStatus
): FhirDocumentReference["status"] {
  if (status === "superseded" || status === "entered-in-error") {
    return status;
  }

  return "current";
}

function mapDocumentReferenceDocStatus(
  status: ClinicalDocumentStatus
): FhirDocumentReference["docStatus"] {
  if (status === "signed") {
    return "final";
  }

  if (status === "entered-in-error") {
    return "entered-in-error";
  }

  return "preliminary";
}
