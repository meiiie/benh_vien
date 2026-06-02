import type {
  ClinicalDocumentSnapshot,
  ClinicalDocumentStatus,
  ClinicalDocumentType
} from "../clinical-document/clinical-document.types.js";
import type { FhirDocumentReference } from "./fhir-types.js";

export const documentReferenceFhirProfile =
  "http://hl7.org/fhir/StructureDefinition/DocumentReference";

const documentTypeLabels: Record<ClinicalDocumentType, string> = {
  "admission-note": "Phiếu nhập viện",
  "discharge-summary": "Tóm tắt ra viện",
  "lab-report": "Phiếu kết quả xét nghiệm",
  "imaging-report": "Phiếu kết quả chẩn đoán hình ảnh",
  "referral-letter": "Giấy chuyển tuyến",
  "consent-form": "Phiếu đồng ý điều trị",
  "advance-directive": "Chỉ dẫn chăm sóc trước",
  ccda: "Tài liệu CCDA",
  ccr: "Hồ sơ CCR",
  "medical-record": "Hồ sơ bệnh án",
  "patient-information": "Thông tin bệnh nhân"
};

export function toDocumentReferenceStatus(
  status: ClinicalDocumentStatus
): FhirDocumentReference["status"] {
  if (status === "superseded" || status === "entered-in-error") {
    return status;
  }

  return "current";
}

export function toDocumentReferenceDocStatus(
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

export function toDocumentReferenceType(
  type: ClinicalDocumentType
): FhirDocumentReference["type"] {
  return {
    text: documentTypeLabels[type]
  };
}

export function toDocumentReferenceContent(
  snapshot: ClinicalDocumentSnapshot
): FhirDocumentReference["content"] {
  return [
    {
      attachment: {
        contentType: snapshot.attachmentContentType,
        url: snapshot.storageUri,
        size: snapshot.attachmentSizeBytes,
        hash: snapshot.attachmentHashSha1Base64,
        title: snapshot.title,
        creation: snapshot.attachmentCreatedAt ?? snapshot.createdAt
      }
    }
  ];
}
