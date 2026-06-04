import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
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
  it("rejects invalid rehydrated observation metadata and values", () => {
    const snapshot = Observation.record({
      id: "observation-test-003",
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
    }).toSnapshot();

    expect(() =>
      Observation.rehydrate({
        ...snapshot,
        status: "unknown" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      Observation.rehydrate({
        ...snapshot,
        category: "imaging" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      Observation.rehydrate({
        ...snapshot,
        effectiveAt: "not-a-date"
      })
    ).toThrow(DomainError);

    expect(() =>
      Observation.rehydrate({
        ...snapshot,
        valueQuantity: undefined
      })
    ).toThrow(DomainError);

    expect(() =>
      Observation.rehydrate({
        ...snapshot,
        valueText: "13.5 g/dL"
      })
    ).toThrow(DomainError);

    expect(() =>
      Observation.rehydrate({
        ...snapshot,
        valueQuantity: {
          value: Number.NaN,
          unit: "g/dL"
        }
      })
    ).toThrow(DomainError);

    expect(() =>
      Observation.rehydrate({
        ...snapshot,
        updatedAt: "1999-01-01T00:00:00.000Z"
      })
    ).toThrow(DomainError);
  });
});
