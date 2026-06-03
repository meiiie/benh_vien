import { describe, expect, it } from "vitest";
import { Procedure } from "./procedure.js";
import { createPerformedDiagnosticProcedureInput } from "./procedure.test-support.js";

describe("Procedure recording", () => {
  it("records a performed clinical procedure", () => {
    const procedure = Procedure.record(
      createPerformedDiagnosticProcedureInput({
        id: "procedure-test-001"
      })
    );

    expect(procedure.toSnapshot()).toMatchObject({
      patientId: "patient-test-001",
      status: "completed",
      category: "diagnostic",
      basedOnServiceRequestId: "service-request-test-001"
    });
  });
});
