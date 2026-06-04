import { describe, expect, it } from "vitest";
import { mapProcedureToFhir } from "../fhir/map-procedure-to-fhir.js";
import { Procedure } from "./procedure.js";

describe("Procedure FHIR mapping", () => {
  it("exports a FHIR Procedure linked to the original ServiceRequest", () => {
    const procedure = Procedure.record({
      id: "procedure-test-002",
      patientId: "patient-test-001",
      basedOnServiceRequestId: "service-request-test-001",
      status: "completed",
      category: "therapeutic",
      code: {
        system: "http://snomed.info/sct",
        code: "409073007",
        display: "Education"
      },
      performedPeriod: {
        start: "2026-05-27T04:30:00.000Z"
      },
      performers: [
        {
          actorType: "Practitioner",
          actorId: "practitioner-test-001"
        }
      ],
      reportReferences: []
    });

    expect(mapProcedureToFhir(procedure)).toMatchObject({
      resourceType: "Procedure",
      id: "procedure-test-002",
      status: "completed",
      basedOn: [
        {
          reference: "ServiceRequest/service-request-test-001"
        }
      ],
      subject: {
        reference: "Patient/patient-test-001"
      }
    });
  });
});
