import { describe, expect, it } from "vitest";
import { mapMedicationAdministrationToFhir } from "../fhir/map-medication-administration-to-fhir.js";
import { DomainError } from "../shared/domain-error.js";
import { MedicationAdministration } from "./medication-administration.js";

describe("MedicationAdministration", () => {
  it("records a completed medication administration", () => {
    const administration = MedicationAdministration.record({
      id: "medication-administration-test-001",
      patientId: "patient-test-001",
      encounterId: "encounter-test-001",
      medicationRequestId: "medication-request-test-001",
      status: "completed",
      category: "inpatient",
      medicationCode: {
        system: "http://www.whocc.no/atc",
        code: "J01CA04",
        display: "Amoxicillin"
      },
      effectivePeriod: {
        start: "2026-05-27T04:30:00.000Z"
      },
      performers: [
        {
          actorType: "Practitioner",
          actorId: "nurse-test-001"
        }
      ],
      dosage: {
        text: "500 mg uống sau ăn",
        doseQuantity: {
          value: 500,
          unit: "mg",
          system: "http://unitsofmeasure.org",
          code: "mg"
        }
      }
    });

    expect(administration.toSnapshot()).toMatchObject({
      patientId: "patient-test-001",
      medicationRequestId: "medication-request-test-001",
      status: "completed",
      category: "inpatient"
    });
  });

  it("exports FHIR MedicationAdministration linked to the original MedicationRequest", () => {
    const administration = MedicationAdministration.record({
      id: "medication-administration-test-002",
      patientId: "patient-test-001",
      medicationRequestId: "medication-request-test-001",
      status: "completed",
      category: "outpatient",
      medicationCode: {
        system: "http://www.whocc.no/atc",
        code: "C09AA05",
        display: "Ramipril"
      },
      effectivePeriod: {
        start: "2026-05-27T04:30:00.000Z"
      },
      performers: [
        {
          actorType: "Practitioner",
          actorId: "nurse-test-001"
        }
      ]
    });

    expect(mapMedicationAdministrationToFhir(administration)).toMatchObject({
      resourceType: "MedicationAdministration",
      id: "medication-administration-test-002",
      status: "completed",
      request: {
        reference: "MedicationRequest/medication-request-test-001"
      },
      subject: {
        reference: "Patient/patient-test-001"
      }
    });
  });

  it("rejects completed administrations without a performer", () => {
    expect(() =>
      MedicationAdministration.record({
        id: "medication-administration-test-003",
        patientId: "patient-test-001",
        status: "completed",
        category: "outpatient",
        medicationCode: {
          system: "http://www.whocc.no/atc",
          code: "C09AA05",
          display: "Ramipril"
        },
        effectivePeriod: {
          start: "2026-05-27T04:30:00.000Z"
        },
        performers: []
      })
    ).toThrow(DomainError);
  });
});
