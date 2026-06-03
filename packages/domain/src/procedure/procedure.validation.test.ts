import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
import { Procedure } from "./procedure.js";

describe("Procedure validation", () => {
  it("rejects completed procedures without a performer", () => {
    expect(() =>
      Procedure.record({
        id: "procedure-test-003",
        patientId: "patient-test-001",
        status: "completed",
        category: "other",
        code: {
          system: "http://snomed.info/sct",
          code: "71388002",
          display: "Procedure"
        },
        performedPeriod: {
          start: "2026-05-27T04:30:00.000Z"
        },
        performers: [],
        reportReferences: []
      })
    ).toThrow(DomainError);
  });

  it("rejects procedures that reference themselves as part-of", () => {
    expect(() =>
      Procedure.record({
        id: "procedure-test-self-reference-001",
        patientId: "patient-test-001",
        partOfProcedureId: "procedure-test-self-reference-001",
        status: "in-progress",
        category: "other",
        code: {
          system: "http://snomed.info/sct",
          code: "71388002",
          display: "Procedure"
        },
        performers: [],
        reportReferences: []
      })
    ).toThrow(DomainError);
  });
});
