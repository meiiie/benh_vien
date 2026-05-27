import { describe, expect, it } from "vitest";
import { Observation } from "./observation.js";

describe("Observation", () => {
  it("records a quantity observation", () => {
    const observation = Observation.record({
      id: "observation-test-001",
      patientId: "patient-test-001",
      category: "laboratory",
      code: {
        system: "http://loinc.org",
        code: "718-7",
        display: "Hemoglobin"
      },
      effectiveAt: "2026-05-28T00:00:00.000Z",
      valueQuantity: {
        value: 13.5,
        unit: "g/dL"
      }
    });

    expect(observation.toSnapshot()).toMatchObject({
      id: "observation-test-001",
      patientId: "patient-test-001",
      status: "final",
      valueQuantity: {
        value: 13.5,
        unit: "g/dL"
      }
    });
  });

  it("rejects observations without a value", () => {
    expect(() =>
      Observation.record({
        id: "observation-test-002",
        patientId: "patient-test-001",
        category: "laboratory",
        code: {
          system: "http://loinc.org",
          code: "718-7",
          display: "Hemoglobin"
        },
        effectiveAt: "2026-05-28T00:00:00.000Z"
      })
    ).toThrow("Observation phải có giá trị định lượng hoặc giá trị văn bản.");
  });
});
