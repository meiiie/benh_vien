import { describe, expect, it } from "vitest";
import { Encounter, Patient, mapEncounterToFhir, mapPatientToFhir } from "../index.js";
import { DomainError } from "../shared/domain-error.js";

describe("Patient", () => {
  it("registers a patient with normalized demographics", () => {
    const patient = Patient.register({
      id: "patient-test-001",
      identifiers: [
        {
          system: "urn:benh-vien-so:mrn",
          value: " MRN-001 ",
          type: "hospital-mrn"
        }
      ],
      fullName: "  Nguyen   Van   A  ",
      managingOrganizationId: "hospital-demo"
    });

    expect(patient.toSnapshot()).toMatchObject({
      id: "patient-test-001",
      fullName: "Nguyen Van A",
      gender: "unknown",
      status: "active"
    });
  });

  it("rejects duplicate identifiers inside one patient record", () => {
    expect(() =>
      Patient.register({
        id: "patient-test-duplicate-identifier",
        identifiers: [
          {
            system: "urn:gov:vietnam:national-id",
            value: "000000000099",
            type: "national-id"
          },
          {
            system: "urn:gov:vietnam:national-id",
            value: "000000000099",
            type: "national-id"
          }
        ],
        fullName: "Duplicate Identifier",
        managingOrganizationId: "hospital-demo"
      })
    ).toThrow();
  });

  it("marks a duplicate patient as merged into a canonical record", () => {
    const patient = Patient.rehydrate({
      id: "patient-test-merge-source",
      identifiers: [
        {
          system: "urn:benh-vien-so:mrn",
          value: "MRN-MERGE-SOURCE",
          type: "hospital-mrn"
        }
      ],
      fullName: "Duplicate Patient",
      gender: "unknown",
      managingOrganizationId: "hospital-demo",
      status: "active",
      createdAt: "2026-05-28T00:00:00.000Z",
      updatedAt: "2026-05-28T00:00:00.000Z"
    });

    patient.markMerged({
      targetPatientId: "patient-test-canonical",
      mergedByActorId: "admin-test",
      reason: "Duplicate registration after MPI review.",
      mergedAt: new Date("2026-05-28T01:00:00.000Z")
    });

    expect(patient.toSnapshot()).toMatchObject({
      status: "merged",
      mergedIntoPatientId: "patient-test-canonical",
      mergedAt: "2026-05-28T01:00:00.000Z",
      mergedByActorId: "admin-test",
      mergeReason: "Duplicate registration after MPI review."
    });
    expect(mapPatientToFhir(patient)).toMatchObject({
      resourceType: "Patient",
      active: false,
      link: [
        {
          other: {
            reference: "Patient/patient-test-canonical"
          },
          type: "replaced-by"
        }
      ]
    });
    expect(() =>
      patient.updateDemographics({
        fullName: "Should Not Update"
      })
    ).toThrow();
  });

  it("maps a patient to FHIR Patient", () => {
    const patient = Patient.register({
      id: "patient-test-002",
      identifiers: [
        {
          system: "urn:gov:vietnam:national-id",
          value: "000000000002",
          type: "national-id"
        }
      ],
      fullName: "Tran Thi B",
      birthDate: "1992-09-18",
      gender: "female",
      managingOrganizationId: "hospital-demo"
    });

    expect(mapPatientToFhir(patient)).toMatchObject({
      resourceType: "Patient",
      id: "patient-test-002",
      active: true,
      birthDate: "1992-09-18",
      managingOrganization: {
        reference: "Organization/hospital-demo"
      }
    });
  });

  it("maps an encounter to FHIR Encounter", () => {
    const encounter = Encounter.create({
      id: "encounter-test-001",
      patientId: "patient-test-002",
      class: "ambulatory",
      serviceType: "Khám ngoại trú",
      reasonText: "Tái khám sau ra viện",
      departmentId: "department-outpatient",
      attendingPractitionerId: "practitioner-test-001",
      startedAt: "2026-05-27T03:00:00.000Z"
    });

    expect(mapEncounterToFhir(encounter)).toMatchObject({
      resourceType: "Encounter",
      id: "encounter-test-001",
      status: "in-progress",
      subject: {
        reference: "Patient/patient-test-002"
      },
      serviceProvider: {
        reference: "Organization/department-outpatient"
      }
    });
  });

  it("rejects invalid rehydrated patient metadata", () => {
    const snapshot = Patient.register({
      id: "patient-test-003",
      identifiers: [
        {
          system: "urn:gov:vietnam:national-id",
          value: "000000000003",
          type: "national-id"
        }
      ],
      fullName: "Le Van C",
      birthDate: "1990-01-01",
      gender: "male",
      managingOrganizationId: "hospital-demo"
    }).toSnapshot();

    expect(() =>
      Patient.rehydrate({
        ...snapshot,
        identifiers: []
      })
    ).toThrow(DomainError);

    expect(() =>
      Patient.rehydrate({
        ...snapshot,
        identifiers: [
          {
            system: "urn:gov:vietnam:national-id",
            value: "000000000003",
            type: "citizen-id" as never
          }
        ]
      })
    ).toThrow(DomainError);

    expect(() =>
      Patient.rehydrate({
        ...snapshot,
        birthDate: "1990-02-31"
      })
    ).toThrow(DomainError);

    expect(() =>
      Patient.rehydrate({
        ...snapshot,
        gender: "not-known" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      Patient.rehydrate({
        ...snapshot,
        status: "archived" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      Patient.rehydrate({
        ...snapshot,
        status: "merged",
        mergedIntoPatientId: undefined,
        mergedAt: "2026-05-28T01:00:00.000Z",
        mergedByActorId: "admin-test",
        mergeReason: "Duplicate registration"
      })
    ).toThrow(DomainError);

    expect(() =>
      Patient.rehydrate({
        ...snapshot,
        status: "active",
        mergedIntoPatientId: "patient-test-canonical"
      })
    ).toThrow(DomainError);

    expect(() =>
      Patient.rehydrate({
        ...snapshot,
        createdAt: "not-a-date"
      })
    ).toThrow(DomainError);
  });

  it("rejects invalid rehydrated patient lifecycle timestamps", () => {
    const snapshot = Patient.register({
      id: "patient-test-lifecycle-001",
      identifiers: [
        {
          system: "urn:gov:vietnam:national-id",
          value: "000000000004",
          type: "national-id"
        }
      ],
      fullName: "Lifecycle Patient",
      managingOrganizationId: "hospital-demo"
    }).toSnapshot();

    expect(() =>
      Patient.rehydrate({
        ...snapshot,
        updatedAt: "1999-01-01T00:00:00.000Z"
      })
    ).toThrow(DomainError);

    expect(() =>
      Patient.rehydrate({
        ...snapshot,
        status: "merged",
        mergedIntoPatientId: "patient-test-canonical",
        mergedAt: "1999-01-01T00:00:00.000Z",
        mergedByActorId: "admin-test",
        mergeReason: "Duplicate registration"
      })
    ).toThrow(DomainError);
  });

  it("rejects merging a patient before it was created", () => {
    const patient = Patient.rehydrate({
      id: "patient-test-lifecycle-002",
      identifiers: [
        {
          system: "urn:gov:vietnam:national-id",
          value: "000000000005",
          type: "national-id"
        }
      ],
      fullName: "Precreated Merge Patient",
      gender: "unknown",
      managingOrganizationId: "hospital-demo",
      status: "active",
      createdAt: "2026-05-28T02:00:00.000Z",
      updatedAt: "2026-05-28T02:00:00.000Z"
    });

    expect(() =>
      patient.markMerged({
        targetPatientId: "patient-test-canonical",
        mergedByActorId: "admin-test",
        reason: "Duplicate registration",
        mergedAt: new Date("2026-05-28T01:59:59.000Z")
      })
    ).toThrow(DomainError);
  });
});
