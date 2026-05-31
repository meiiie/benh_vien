import { describe, expect, it } from "vitest";
import { mapConditionToFhir } from "../fhir/map-condition-to-fhir.js";
import { DomainError } from "../shared/domain-error.js";
import { Condition } from "./condition.js";

describe("Condition", () => {
  it("records an encounter diagnosis", () => {
    const condition = Condition.record({
      id: "condition-test-001",
      patientId: "patient-test-001",
      encounterId: "encounter-test-001",
      category: "encounter-diagnosis",
      code: {
        system: "http://hl7.org/fhir/sid/icd-10",
        code: "J18.9",
        display: "Viêm phổi không đặc hiệu"
      },
      severity: "moderate",
      onsetAt: "2026-05-28T00:00:00.000Z",
      recorderPractitionerId: "practitioner-test-001"
    });

    expect(condition.toSnapshot()).toMatchObject({
      id: "condition-test-001",
      patientId: "patient-test-001",
      clinicalStatus: "active",
      verificationStatus: "confirmed",
      category: "encounter-diagnosis",
      severity: "moderate"
    });
  });

  it("rejects empty diagnosis codes", () => {
    expect(() =>
      Condition.record({
        id: "condition-test-002",
        patientId: "patient-test-001",
        category: "problem-list-item",
        code: {
          system: "http://hl7.org/fhir/sid/icd-10",
          code: " ",
          display: "Không hợp lệ"
        },
        recorderPractitionerId: "practitioner-test-001"
      })
    ).toThrow("Mã chẩn đoán không được để trống.");
  });
  it("rejects invalid rehydrated condition metadata", () => {
    const snapshot = Condition.record({
      id: "condition-test-003",
      patientId: "patient-test-001",
      encounterId: "encounter-test-001",
      category: "encounter-diagnosis",
      code: {
        system: "http://hl7.org/fhir/sid/icd-10",
        code: "J18.9",
        display: "Viêm phổi không đặc hiệu"
      },
      severity: "moderate",
      onsetAt: "2026-05-28T00:00:00.000Z",
      recorderPractitionerId: "practitioner-test-001"
    }).toSnapshot();

    expect(() =>
      Condition.rehydrate({
        ...snapshot,
        clinicalStatus: "unknown" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      Condition.rehydrate({
        ...snapshot,
        verificationStatus: "draft" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      Condition.rehydrate({
        ...snapshot,
        category: "billing" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      Condition.rehydrate({
        ...snapshot,
        severity: "critical" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      Condition.rehydrate({
        ...snapshot,
        code: {
          ...snapshot.code,
          code: " "
        }
      })
    ).toThrow(DomainError);

    expect(() =>
      Condition.rehydrate({
        ...snapshot,
        recordedAt: "not-a-date"
      })
    ).toThrow(DomainError);
  });

  it("omits FHIR clinicalStatus when condition is entered in error", () => {
    const condition = Condition.record({
      id: "condition-test-004",
      patientId: "patient-test-001",
      category: "problem-list-item",
      verificationStatus: "entered-in-error",
      code: {
        system: "http://hl7.org/fhir/sid/icd-10",
        code: "R50.9",
        display: "Sốt không xác định"
      },
      recorderPractitionerId: "practitioner-test-001"
    });

    expect(mapConditionToFhir(condition)).toMatchObject({
      resourceType: "Condition",
      verificationStatus: {
        coding: [
          expect.objectContaining({
            code: "entered-in-error"
          })
        ]
      }
    });
    expect(mapConditionToFhir(condition).clinicalStatus).toBeUndefined();
  });
});
