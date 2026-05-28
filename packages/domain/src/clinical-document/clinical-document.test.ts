import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
import { ClinicalDocument } from "./clinical-document.js";
import { mapClinicalDocumentToFhir } from "../fhir/map-clinical-document-to-fhir.js";

describe("ClinicalDocument", () => {
  it("preserves attachment metadata and maps it to FHIR DocumentReference", () => {
    const document = ClinicalDocument.create({
      id: "clinical-document-attachment-001",
      patientId: "patient-attachment-001",
      encounterId: "encounter-attachment-001",
      type: "discharge-summary",
      title: "Tóm tắt ra viện có metadata",
      storageUri: "s3://wiiicare-demo/patients/patient-attachment-001/discharge-summary.pdf",
      attachmentContentType: " application/pdf ",
      attachmentSizeBytes: 245760,
      attachmentHashSha1Base64: "u5+Zwd+MnqJUBDLusw8YfS9xX9Y=",
      attachmentCreatedAt: "2026-05-28T02:00:00.000Z",
      authorPractitionerId: "practitioner-attachment-001"
    });

    const fhirDocumentReference = mapClinicalDocumentToFhir(document);

    expect(document.toSnapshot()).toMatchObject({
      attachmentContentType: "application/pdf",
      attachmentSizeBytes: 245760,
      attachmentHashSha1Base64: "u5+Zwd+MnqJUBDLusw8YfS9xX9Y=",
      attachmentCreatedAt: "2026-05-28T02:00:00.000Z"
    });
    expect(fhirDocumentReference.content[0]?.attachment).toMatchObject({
      contentType: "application/pdf",
      size: 245760,
      hash: "u5+Zwd+MnqJUBDLusw8YfS9xX9Y=",
      creation: "2026-05-28T02:00:00.000Z"
    });
  });

  it("rejects attachment sizes outside FHIR unsignedInt", () => {
    expect(() =>
      ClinicalDocument.create({
        id: "clinical-document-attachment-002",
        patientId: "patient-attachment-001",
        type: "lab-report",
        title: "Tài liệu lỗi dung lượng",
        storageUri: "s3://wiiicare-demo/patients/patient-attachment-001/lab-report.pdf",
        attachmentSizeBytes: 4_294_967_296,
        authorPractitionerId: "practitioner-attachment-001"
      })
    ).toThrow(DomainError);
  });
});
