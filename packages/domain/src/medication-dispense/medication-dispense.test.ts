import { describe, expect, it } from "vitest";
import { mapMedicationDispenseToFhir } from "../fhir/map-medication-dispense-to-fhir.js";
import { DomainError } from "../shared/domain-error.js";
import { MedicationDispense } from "./medication-dispense.js";

describe("MedicationDispense", () => {
  it("records a completed medication dispense", () => {
    const dispense = MedicationDispense.record({
      id: "medication-dispense-test-001",
      patientId: "patient-test-001",
      medicationRequestId: "medication-request-test-001",
      status: "completed",
      category: "outpatient",
      medicationCode: {
        system: "http://www.whocc.no/atc",
        code: "C09AA05",
        display: "Ramipril"
      },
      quantity: {
        value: 30,
        unit: "tablet",
        system: "http://unitsofmeasure.org",
        code: "{tablet}"
      },
      whenHandedOver: "2026-05-27T07:00:00.000Z",
      dispenserPractitionerId: "practitioner-test-001"
    });

    expect(dispense.toSnapshot()).toMatchObject({
      id: "medication-dispense-test-001",
      patientId: "patient-test-001",
      status: "completed",
      quantity: {
        value: 30,
        unit: "tablet"
      }
    });
  });

  it("exports FHIR MedicationDispense linked to the original MedicationRequest", () => {
    const dispense = MedicationDispense.record({
      id: "medication-dispense-test-002",
      patientId: "patient-test-001",
      encounterId: "encounter-test-001",
      medicationRequestId: "medication-request-test-001",
      status: "completed",
      category: "outpatient",
      medicationCode: {
        system: "http://www.whocc.no/atc",
        code: "C09AA05",
        display: "Ramipril"
      },
      quantity: {
        value: 30,
        unit: "tablet"
      },
      whenPrepared: "2026-05-27T06:30:00.000Z",
      whenHandedOver: "2026-05-27T07:00:00.000Z",
      dispenserPractitionerId: "practitioner-test-001"
    });

    expect(mapMedicationDispenseToFhir(dispense)).toMatchObject({
      resourceType: "MedicationDispense",
      id: "medication-dispense-test-002",
      authorizingPrescription: [
        {
          reference: "MedicationRequest/medication-request-test-001"
        }
      ],
      subject: {
        reference: "Patient/patient-test-001"
      },
      quantity: {
        value: 30,
        unit: "tablet"
      }
    });
  });

  it("requires handover time and quantity when completed", () => {
    expect(() =>
      MedicationDispense.record({
        id: "medication-dispense-test-003",
        patientId: "patient-test-001",
        status: "completed",
        category: "outpatient",
        medicationCode: {
          system: "http://www.whocc.no/atc",
          code: "C09AA05",
          display: "Ramipril"
        }
      })
    ).toThrow(DomainError);
  });

  it("rejects invalid rehydrated medication dispense metadata", () => {
    const snapshot = MedicationDispense.record({
      id: "medication-dispense-test-004",
      patientId: "patient-test-001",
      encounterId: "encounter-test-001",
      medicationRequestId: "medication-request-test-001",
      status: "completed",
      category: "outpatient",
      medicationCode: {
        system: "http://www.whocc.no/atc",
        code: "C09AA05",
        display: "Ramipril"
      },
      quantity: {
        value: 30,
        unit: "tablet"
      },
      whenPrepared: "2026-05-27T06:30:00.000Z",
      whenHandedOver: "2026-05-27T07:00:00.000Z",
      dispenserPractitionerId: "practitioner-test-001",
      dosageInstruction: {
        text: "Take one tablet daily",
        frequency: 1,
        period: 1,
        periodUnit: "d"
      }
    }).toSnapshot();

    expect(() =>
      MedicationDispense.rehydrate({
        ...snapshot,
        status: "dispensed" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      MedicationDispense.rehydrate({
        ...snapshot,
        category: "emergency" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      MedicationDispense.rehydrate({
        ...snapshot,
        medicationCode: {
          ...snapshot.medicationCode,
          code: " "
        }
      })
    ).toThrow(DomainError);

    expect(() =>
      MedicationDispense.rehydrate({
        ...snapshot,
        quantity: {
          value: 0,
          unit: "tablet"
        }
      })
    ).toThrow(DomainError);

    expect(() =>
      MedicationDispense.rehydrate({
        ...snapshot,
        whenHandedOver: "2026-05-27T06:00:00.000Z"
      })
    ).toThrow(DomainError);

    expect(() =>
      MedicationDispense.rehydrate({
        ...snapshot,
        dosageInstruction: {
          ...snapshot.dosageInstruction!,
          periodUnit: "month" as never
        }
      })
    ).toThrow(DomainError);

    expect(() =>
      MedicationDispense.rehydrate({
        ...snapshot,
        createdAt: "not-a-date"
      })
    ).toThrow(DomainError);
  });
});
