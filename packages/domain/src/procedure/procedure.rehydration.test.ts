import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
import { Procedure } from "./procedure.js";
import { createPerformedDiagnosticProcedureSnapshot } from "./procedure.test-support.js";

describe("Procedure rehydration", () => {
  it("rejects invalid rehydrated procedure metadata", () => {
    const snapshot = createPerformedDiagnosticProcedureSnapshot({
      id: "procedure-test-004"
    });

    expect(() =>
      Procedure.rehydrate({
        ...snapshot,
        status: "signed" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      Procedure.rehydrate({
        ...snapshot,
        category: "pharmacy" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      Procedure.rehydrate({
        ...snapshot,
        code: {
          ...snapshot.code,
          code: " "
        }
      })
    ).toThrow(DomainError);

    expect(() =>
      Procedure.rehydrate({
        ...snapshot,
        performedPeriod: {
          start: "2026-05-27T05:00:00.000Z",
          end: "2026-05-27T04:30:00.000Z"
        }
      })
    ).toThrow(DomainError);

    expect(() =>
      Procedure.rehydrate({
        ...snapshot,
        performers: [
          {
            actorType: "Device" as never,
            actorId: "device-test-001"
          }
        ]
      })
    ).toThrow(DomainError);

    expect(() =>
      Procedure.rehydrate({
        ...snapshot,
        reportReferences: [
          {
            resourceType: "Observation" as never,
            id: "observation-test-001"
          }
        ]
      })
    ).toThrow(DomainError);

    expect(() =>
      Procedure.rehydrate({
        ...snapshot,
        patientId: " "
      })
    ).toThrow(DomainError);

    expect(() =>
      Procedure.rehydrate({
        ...snapshot,
        createdAt: "not-a-date"
      })
    ).toThrow(DomainError);

    expect(() =>
      Procedure.rehydrate({
        ...snapshot,
        partOfProcedureId: "procedure-test-004"
      })
    ).toThrow(DomainError);

    expect(() =>
      Procedure.rehydrate({
        ...snapshot,
        updatedAt: "1999-01-01T00:00:00.000Z"
      })
    ).toThrow(DomainError);
  });
});
