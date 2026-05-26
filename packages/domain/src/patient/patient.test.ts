import { describe, expect, it } from "vitest";
import { Encounter, Patient, mapEncounterToFhir, mapPatientToFhir } from "../index.js";

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
});
