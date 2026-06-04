import { ClinicalDocument } from "../clinical-document/clinical-document.js";
import { Encounter } from "../encounter/encounter.js";
import { Patient } from "../patient/patient.js";
import { ProviderDirectory } from "../provider-directory/provider-directory.js";
import type { PatientRecordDocumentBundleInput } from "./map-patient-record-to-fhir-document-bundle.js";

const patientId = "patient-document-test-001";
const encounterId = "encounter-document-test-001";
const practitionerId = "practitioner-document-test-001";
const hospitalId = "hospital-document-test";
const departmentId = "department-document-test";
const generatedAt = new Date("2026-05-28T00:00:00.000Z");

export function createPatientRecordDocumentBundleInput(
  overrides: Partial<PatientRecordDocumentBundleInput> = {}
): PatientRecordDocumentBundleInput {
  return {
    patient: buildPatient(),
    encounters: [buildEncounter()],
    documents: [],
    generatedAt,
    ...overrides
  };
}

export function buildPatient(): Patient {
  return Patient.register({
    id: patientId,
    identifiers: [
      {
        system: "urn:gov:vietnam:national-id",
        value: "000000000101",
        type: "national-id"
      }
    ],
    fullName: "Nguyen Van Document",
    managingOrganizationId: hospitalId
  });
}

export function buildEncounter(): Encounter {
  return Encounter.create({
    id: encounterId,
    patientId,
    class: "ambulatory",
    serviceType: "Khám ngoại trú",
    reasonText: "Tái khám sau ra viện",
    departmentId,
    attendingPractitionerId: practitionerId,
    startedAt: "2026-05-27T03:00:00.000Z"
  });
}

export function buildProviderDirectory(): ProviderDirectory {
  return ProviderDirectory.assemble({
    organizations: [
      {
        id: hospitalId,
        identifiers: [
          {
            system: "urn:wiiicare:test:organization",
            value: hospitalId
          }
        ],
        active: true,
        type: "hospital",
        name: "Bệnh viện kiểm thử hồ sơ"
      },
      {
        id: departmentId,
        identifiers: [
          {
            system: "urn:wiiicare:test:organization",
            value: departmentId
          }
        ],
        active: true,
        type: "department",
        name: "Khoa khám bệnh",
        partOfOrganizationId: hospitalId
      }
    ],
    practitioners: [
      {
        id: practitionerId,
        identifiers: [
          {
            system: "urn:wiiicare:test:practitioner",
            value: practitionerId
          }
        ],
        active: true,
        fullName: "Bác sĩ kiểm thử"
      }
    ],
    practitionerRoles: [],
    endpoints: [],
    generatedAt
  });
}

export function buildSignedDocument(): ClinicalDocument {
  return ClinicalDocument.rehydrate({
    id: "clinical-document-signed-test-001",
    patientId,
    encounterId,
    type: "discharge-summary",
    title: "Tóm tắt ra viện đã ký",
    status: "signed",
    storageUri: "s3://wiiicare-test/patient-document-test-001/discharge-summary.pdf",
    attachmentContentType: "application/pdf",
    attachmentSizeBytes: 131072,
    attachmentHashSha1Base64: "u5+Zwd+MnqJUBDLusw8YfS9xX9Y=",
    attachmentCreatedAt: "2026-05-27T04:00:00.000Z",
    authorPractitionerId: practitionerId,
    signedAt: "2026-05-27T04:15:00.000Z",
    createdAt: "2026-05-27T03:55:00.000Z",
    updatedAt: "2026-05-27T04:15:00.000Z"
  });
}

export function buildDraftDocument(): ClinicalDocument {
  return ClinicalDocument.rehydrate({
    id: "clinical-document-draft-test-001",
    patientId,
    encounterId,
    type: "lab-report",
    title: "Phiếu xét nghiệm đang nháp",
    status: "draft",
    storageUri: "s3://wiiicare-test/patient-document-test-001/lab-report.pdf",
    attachmentContentType: "application/pdf",
    attachmentSizeBytes: 65536,
    attachmentHashSha1Base64: "j9xB1pxfa1BIflIHJOu+LZKiaYE=",
    attachmentCreatedAt: "2026-05-27T05:00:00.000Z",
    authorPractitionerId: practitionerId,
    createdAt: "2026-05-27T04:55:00.000Z",
    updatedAt: "2026-05-27T04:55:00.000Z"
  });
}
