import { describe, expect, it } from "vitest";
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
