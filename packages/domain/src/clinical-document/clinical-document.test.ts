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
        attachmentSizeBytes: 2_147_483_648,
        authorPractitionerId: "practitioner-attachment-001"
      })
    ).toThrow(DomainError);
  });

  it("rejects invalid attachment MIME type and SHA-1 hash metadata", () => {
    const baseDocument = {
      id: "clinical-document-attachment-003",
      patientId: "patient-attachment-001",
      type: "lab-report" as const,
      title: "Tài liệu lỗi metadata",
      storageUri: "s3://wiiicare-demo/patients/patient-attachment-001/lab-report.pdf",
      authorPractitionerId: "practitioner-attachment-001"
    };

    expect(() =>
      ClinicalDocument.create({
        ...baseDocument,
        attachmentContentType: "not-a-mime-type"
      })
    ).toThrow(DomainError);

    expect(() =>
      ClinicalDocument.create({
        ...baseDocument,
        attachmentHashSha1Base64: "not-a-sha1-hash"
      })
    ).toThrow(DomainError);
  });

  it("rejects invalid rehydrated attachment metadata", () => {
    const snapshot = ClinicalDocument.create({
      id: "clinical-document-attachment-004",
      patientId: "patient-attachment-001",
      type: "lab-report",
      title: "Tài liệu metadata từ lưu trữ",
      storageUri: "s3://wiiicare-demo/patients/patient-attachment-001/rehydrated.pdf",
      attachmentContentType: "application/pdf",
      attachmentSizeBytes: 245760,
      attachmentHashSha1Base64: "u5+Zwd+MnqJUBDLusw8YfS9xX9Y=",
      attachmentCreatedAt: "2026-05-28T02:00:00.000Z",
      authorPractitionerId: "practitioner-attachment-001"
    }).toSnapshot();

    expect(() =>
      ClinicalDocument.rehydrate({
        ...snapshot,
        attachmentSizeBytes: 2_147_483_648
      })
    ).toThrow(DomainError);

    expect(() =>
      ClinicalDocument.rehydrate({
        ...snapshot,
        attachmentContentType: "not-a-mime-type"
      })
    ).toThrow(DomainError);

    expect(() =>
      ClinicalDocument.rehydrate({
        ...snapshot,
        attachmentHashSha1Base64: "not-a-sha1-hash"
      })
    ).toThrow(DomainError);

    expect(() =>
      ClinicalDocument.rehydrate({
        ...snapshot,
        attachmentCreatedAt: "not-a-date"
      })
    ).toThrow(DomainError);
  });

  it("rejects invalid rehydrated lifecycle status", () => {
    const snapshot = ClinicalDocument.create({
      id: "clinical-document-lifecycle-001",
      patientId: "patient-attachment-001",
      type: "discharge-summary",
      title: "Tài liệu vòng đời ký",
      storageUri: "s3://wiiicare-demo/patients/patient-attachment-001/lifecycle.pdf",
      authorPractitionerId: "practitioner-attachment-001"
    }).toSnapshot();

    expect(() =>
      ClinicalDocument.rehydrate({
        ...snapshot,
        status: "signed"
      })
    ).toThrow(DomainError);

    expect(() =>
      ClinicalDocument.rehydrate({
        ...snapshot,
        status: "unknown" as never
      })
    ).toThrow(DomainError);
  });

  it("rejects invalid rehydrated lifecycle timestamps", () => {
    const snapshot = ClinicalDocument.create({
      id: "clinical-document-lifecycle-003",
      patientId: "patient-attachment-001",
      type: "discharge-summary",
      title: "Tài liệu vòng đời thời gian",
      storageUri: "s3://wiiicare-demo/patients/patient-attachment-001/lifecycle-timeline.pdf",
      authorPractitionerId: "practitioner-attachment-001"
    }).toSnapshot();

    expect(() =>
      ClinicalDocument.rehydrate({
        ...snapshot,
        updatedAt: "1999-01-01T00:00:00.000Z"
      })
    ).toThrow(DomainError);

    expect(() =>
      ClinicalDocument.rehydrate({
        ...snapshot,
        status: "signed",
        signedAt: "1999-01-01T00:00:00.000Z"
      })
    ).toThrow(DomainError);
  });

  it("rejects invalid signing timestamps", () => {
    const document = ClinicalDocument.create({
      id: "clinical-document-lifecycle-002",
      patientId: "patient-attachment-001",
      type: "discharge-summary",
      title: "Tài liệu thời điểm ký lỗi",
      storageUri: "s3://wiiicare-demo/patients/patient-attachment-001/invalid-sign.pdf",
      authorPractitionerId: "practitioner-attachment-001"
    });

    expect(() => document.sign(new Date("not-a-date"))).toThrow(DomainError);
  });

  it("rejects signing a document before it was created", () => {
    const document = ClinicalDocument.rehydrate({
      id: "clinical-document-lifecycle-004",
      patientId: "patient-attachment-001",
      type: "discharge-summary",
      title: "Tài liệu ký trước ngày tạo",
      status: "draft",
      storageUri: "s3://wiiicare-demo/patients/patient-attachment-001/precreated-sign.pdf",
      authorPractitionerId: "practitioner-attachment-001",
      createdAt: "2026-05-28T02:00:00.000Z",
      updatedAt: "2026-05-28T02:00:00.000Z"
    });

    expect(() => document.sign(new Date("2026-05-28T01:59:59.000Z"))).toThrow(DomainError);
  });
});
