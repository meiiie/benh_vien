import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
import { AllergyIntolerance } from "./allergy-intolerance.js";

describe("AllergyIntolerance", () => {
  it("records a structured allergy risk", () => {
    const allergy = AllergyIntolerance.record({
      id: "allergy-test-001",
      patientId: "patient-test-001",
      encounterId: "encounter-test-001",
      type: "allergy",
      category: "medication",
      criticality: "high",
      code: {
        system: "http://snomed.info/sct",
        code: "91936005",
        display: "Allergy to penicillin"
      },
      reaction: {
        manifestation: {
          system: "http://snomed.info/sct",
          code: "271807003",
          display: "Skin rash"
        },
        severity: "moderate"
      },
      recordedAt: "2026-05-27T04:30:00.000Z",
      recorderPractitionerId: "practitioner-test-001"
    });

    expect(allergy.toSnapshot()).toMatchObject({
      id: "allergy-test-001",
      patientId: "patient-test-001",
      clinicalStatus: "active",
      verificationStatus: "confirmed",
      criticality: "high"
    });
  });

  it("rejects an empty coded allergen", () => {
    expect(() =>
      AllergyIntolerance.record({
        id: "allergy-test-002",
        patientId: "patient-test-001",
        type: "allergy",
        category: "medication",
        code: {
          system: "http://snomed.info/sct",
          code: "",
          display: "Penicillin"
        },
        recorderPractitionerId: "practitioner-test-001"
      })
    ).toThrow(DomainError);
  });
});
