import { describe, expect, it } from "vitest";
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
});
