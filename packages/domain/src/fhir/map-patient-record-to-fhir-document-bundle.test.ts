import { describe, expect, it } from "vitest";
import { ClinicalDocument } from "../clinical-document/clinical-document.js";
import { Encounter } from "../encounter/encounter.js";
import { Patient } from "../patient/patient.js";
import { ProviderDirectory } from "../provider-directory/provider-directory.js";
import { mapPatientRecordToFhirDocumentBundle } from "./map-patient-record-to-fhir-document-bundle.js";

describe("mapPatientRecordToFhirDocumentBundle", () => {
  it("places Composition first for a FHIR document Bundle", () => {
    const bundle = mapPatientRecordToFhirDocumentBundle({
      patient: buildPatient(),
      encounters: [buildEncounter()],
      documents: [],
      generatedAt: new Date("2026-05-28T00:00:00.000Z")
    });

    expect(bundle).toMatchObject({
      resourceType: "Bundle",
      id: "patient-document-patient-document-test-001",
      type: "document",
      identifier: {
        system: "urn:wiiicare:nexus:fhir-document-bundle",
        value: "patient-document:patient-document-test-001:2026-05-28T00:00:00.000Z"
      }
    });
    expect(bundle.entry[0]?.resource.resourceType).toBe("Composition");
    expect(bundle.entry[0]?.fullUrl).toBe(
      "urn:wiiicare:nexus:Composition:patient-summary-patient-document-test-001"
    );
    expect(bundle.entry[1]?.resource.resourceType).toBe("Patient");

    const composition = bundle.entry[0]?.resource;
    expect(composition).toMatchObject({
      resourceType: "Composition",
      status: "final",
      subject: {
        reference: "Patient/patient-document-test-001"
      },
      date: "2026-05-28T00:00:00.000Z",
      author: [
        {
          reference: "Patient/patient-document-test-001"
        }
      ]
    });
    expect(composition?.resourceType === "Composition" && composition.custodian).toBeUndefined();
    expect(composition?.resourceType === "Composition" && composition.section).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Lượt khám",
          entry: [{ reference: "Encounter/encounter-document-test-001" }]
        })
      ])
    );
  });

  it("uses the practitioner author when Provider Directory includes that practitioner", () => {
    const bundle = mapPatientRecordToFhirDocumentBundle({
      patient: buildPatient(),
      encounters: [buildEncounter()],
      documents: [],
      providerDirectory: buildProviderDirectory(),
      authorPractitionerId: "practitioner-document-test-001",
      custodianOrganizationId: "hospital-document-test",
      generatedAt: new Date("2026-05-28T00:00:00.000Z")
    });

    expect(bundle.entry[0]?.resource).toMatchObject({
      resourceType: "Composition",
      author: [
        {
          reference: "Practitioner/practitioner-document-test-001"
        }
      ],
      custodian: {
        reference: "Organization/hospital-document-test"
      }
    });
  });

  it("adds Provenance only for signed clinical documents", () => {
    const bundle = mapPatientRecordToFhirDocumentBundle({
      patient: buildPatient(),
      encounters: [buildEncounter()],
      documents: [buildSignedDocument(), buildDraftDocument()],
      providerDirectory: buildProviderDirectory(),
      custodianOrganizationId: "hospital-document-test",
      generatedAt: new Date("2026-05-28T00:00:00.000Z")
    });

    const provenanceEntries = bundle.entry.filter(
      (entry) => entry.resource.resourceType === "Provenance"
    );

    expect(provenanceEntries).toHaveLength(1);
    expect(provenanceEntries[0]?.fullUrl).toBe(
      "urn:wiiicare:nexus:Provenance:clinical-document-signed-test-001-provenance"
    );
    expect(provenanceEntries[0]?.resource).toMatchObject({
      resourceType: "Provenance",
      id: "clinical-document-signed-test-001-provenance",
      target: [
        {
          reference: "DocumentReference/clinical-document-signed-test-001",
          display: "Tóm tắt ra viện đã ký"
        }
      ],
      agent: [
        {
          who: {
            reference: "Practitioner/practitioner-document-test-001"
          },
          onBehalfOf: {
            reference: "Organization/hospital-document-test"
          }
        }
      ]
    });
    expect(
      bundle.entry.some(
        (entry) =>
          entry.resource.resourceType === "Provenance" &&
          entry.resource.id === "clinical-document-draft-test-001-provenance"
      )
    ).toBe(false);

    const composition = bundle.entry[0]?.resource;
    expect(composition?.resourceType === "Composition" && composition.section).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Nguồn gốc và ký xác nhận tài liệu",
          entry: [
            {
              reference: "Provenance/clinical-document-signed-test-001-provenance"
            }
          ]
        })
      ])
    );
  });
});

function buildPatient(): Patient {
  return Patient.register({
    id: "patient-document-test-001",
    identifiers: [
      {
        system: "urn:gov:vietnam:national-id",
        value: "000000000101",
        type: "national-id"
      }
    ],
    fullName: "Nguyen Van Document",
    managingOrganizationId: "hospital-document-test"
  });
}

function buildEncounter(): Encounter {
  return Encounter.create({
    id: "encounter-document-test-001",
    patientId: "patient-document-test-001",
    class: "ambulatory",
    serviceType: "Khám ngoại trú",
    reasonText: "Tái khám sau ra viện",
    departmentId: "department-document-test",
    attendingPractitionerId: "practitioner-document-test-001",
    startedAt: "2026-05-27T03:00:00.000Z"
  });
}

function buildProviderDirectory(): ProviderDirectory {
  return ProviderDirectory.assemble({
    organizations: [
      {
        id: "hospital-document-test",
        identifiers: [
          {
            system: "urn:wiiicare:test:organization",
            value: "hospital-document-test"
          }
        ],
        active: true,
        type: "hospital",
        name: "Bệnh viện kiểm thử hồ sơ"
      },
      {
        id: "department-document-test",
        identifiers: [
          {
            system: "urn:wiiicare:test:organization",
            value: "department-document-test"
          }
        ],
        active: true,
        type: "department",
        name: "Khoa khám bệnh",
        partOfOrganizationId: "hospital-document-test"
      }
    ],
    practitioners: [
      {
        id: "practitioner-document-test-001",
        identifiers: [
          {
            system: "urn:wiiicare:test:practitioner",
            value: "practitioner-document-test-001"
          }
        ],
        active: true,
        fullName: "Bác sĩ kiểm thử"
      }
    ],
    practitionerRoles: [],
    endpoints: [],
    generatedAt: new Date("2026-05-28T00:00:00.000Z")
  });
}

function buildSignedDocument(): ClinicalDocument {
  return ClinicalDocument.rehydrate({
    id: "clinical-document-signed-test-001",
    patientId: "patient-document-test-001",
    encounterId: "encounter-document-test-001",
    type: "discharge-summary",
    title: "Tóm tắt ra viện đã ký",
    status: "signed",
    storageUri: "s3://wiiicare-test/patient-document-test-001/discharge-summary.pdf",
    attachmentContentType: "application/pdf",
    attachmentSizeBytes: 131072,
    attachmentHashSha1Base64: "u5+Zwd+MnqJUBDLusw8YfS9xX9Y=",
    attachmentCreatedAt: "2026-05-27T04:00:00.000Z",
    authorPractitionerId: "practitioner-document-test-001",
    signedAt: "2026-05-27T04:15:00.000Z",
    createdAt: "2026-05-27T03:55:00.000Z",
    updatedAt: "2026-05-27T04:15:00.000Z"
  });
}

function buildDraftDocument(): ClinicalDocument {
  return ClinicalDocument.rehydrate({
    id: "clinical-document-draft-test-001",
    patientId: "patient-document-test-001",
    encounterId: "encounter-document-test-001",
    type: "lab-report",
    title: "Phiếu xét nghiệm đang nháp",
    status: "draft",
    storageUri: "s3://wiiicare-test/patient-document-test-001/lab-report.pdf",
    attachmentContentType: "application/pdf",
    attachmentSizeBytes: 65536,
    attachmentHashSha1Base64: "j9xB1pxfa1BIflIHJOu+LZKiaYE=",
    attachmentCreatedAt: "2026-05-27T05:00:00.000Z",
    authorPractitionerId: "practitioner-document-test-001",
    createdAt: "2026-05-27T04:55:00.000Z",
    updatedAt: "2026-05-27T04:55:00.000Z"
  });
}
