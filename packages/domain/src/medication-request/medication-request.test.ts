import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
import { MedicationRequest } from "./medication-request.js";

describe("MedicationRequest", () => {
  it("records a structured medication order", () => {
    const medicationRequest = MedicationRequest.prescribe({
      id: "medication-request-test-001",
      patientId: "patient-test-001",
      encounterId: "encounter-test-001",
      reasonConditionId: "condition-test-001",
      category: "outpatient",
      medicationCode: {
        system: "http://www.whocc.no/atc",
        code: "J01CA04",
        display: "Amoxicillin"
      },
      dosageInstruction: {
        text: "Uống 1 viên mỗi 8 giờ sau ăn trong 5 ngày",
        route: "Đường uống",
        doseQuantity: {
          value: 500,
          unit: "mg",
          system: "http://unitsofmeasure.org",
          code: "mg"
        },
        frequency: 1,
        period: 8,
        periodUnit: "h"
      },
      authoredOn: "2026-05-27T04:00:00.000Z",
      requesterPractitionerId: "practitioner-test-001",
      expectedSupplyDurationDays: 5
    });

    expect(medicationRequest.toSnapshot()).toMatchObject({
      id: "medication-request-test-001",
      patientId: "patient-test-001",
      status: "active",
      intent: "order",
      priority: "routine",
      reasonConditionId: "condition-test-001"
    });
  });

  it("rejects incomplete timing instructions", () => {
    expect(() =>
      MedicationRequest.prescribe({
        id: "medication-request-test-002",
        patientId: "patient-test-001",
        category: "outpatient",
        medicationCode: {
          system: "http://www.whocc.no/atc",
          code: "C09AA05",
          display: "Ramipril"
        },
        dosageInstruction: {
          text: "Uống 1 viên mỗi ngày",
          frequency: 1
        },
        requesterPractitionerId: "practitioner-test-001"
      })
    ).toThrow(DomainError);
  });

  it("rejects invalid rehydrated medication request metadata", () => {
    const snapshot = MedicationRequest.prescribe({
      id: "medication-request-test-003",
      patientId: "patient-test-001",
      encounterId: "encounter-test-001",
      reasonConditionId: "condition-test-001",
      category: "outpatient",
      medicationCode: {
        system: "http://www.whocc.no/atc",
        code: "J01CA04",
        display: "Amoxicillin"
      },
      dosageInstruction: {
        text: "Take one tablet every 8 hours after meals for 5 days",
        route: "Oral route",
        doseQuantity: {
          value: 500,
          unit: "mg",
          system: "http://unitsofmeasure.org",
          code: "mg"
        },
        frequency: 1,
        period: 8,
        periodUnit: "h"
      },
      requesterPractitionerId: "practitioner-test-001",
      expectedSupplyDurationDays: 5
    }).toSnapshot();

    expect(() =>
      MedicationRequest.rehydrate({
        ...snapshot,
        status: "dispensed" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      MedicationRequest.rehydrate({
        ...snapshot,
        intent: "refill" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      MedicationRequest.rehydrate({
        ...snapshot,
        category: "emergency" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      MedicationRequest.rehydrate({
        ...snapshot,
        priority: "normal" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      MedicationRequest.rehydrate({
        ...snapshot,
        medicationCode: {
          ...snapshot.medicationCode,
          code: " "
        }
      })
    ).toThrow(DomainError);

    expect(() =>
      MedicationRequest.rehydrate({
        ...snapshot,
        dosageInstruction: {
          ...snapshot.dosageInstruction,
          periodUnit: "month" as never
        }
      })
    ).toThrow(DomainError);

    expect(() =>
      MedicationRequest.rehydrate({
        ...snapshot,
        authoredOn: "not-a-date"
      })
    ).toThrow(DomainError);

    expect(() =>
      MedicationRequest.rehydrate({
        ...snapshot,
        requesterPractitionerId: " "
      })
    ).toThrow(DomainError);
  });
});
