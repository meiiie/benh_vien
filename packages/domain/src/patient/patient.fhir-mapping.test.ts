import { describe, expect, it } from "vitest";
import { Encounter, Patient, mapEncounterToFhir, mapPatientToFhir } from "../index.js";
import { createMergedPatient } from "./patient.test-support.js";

describe("Patient FHIR mapping", () => {
  it("maps an active patient to FHIR Patient", () => {
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

  it("maps a merged patient as a FHIR replacement link", () => {
    expect(mapPatientToFhir(createMergedPatient())).toMatchObject({
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
});
