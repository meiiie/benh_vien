import { describe, expect, it } from "vitest";
import { mapProcedureToFhir } from "../fhir/map-procedure-to-fhir.js";
import { DomainError } from "../shared/domain-error.js";
import { Procedure } from "./procedure.js";

describe("Procedure", () => {
  it("records a performed clinical procedure", () => {
    const procedure = Procedure.record({
      id: "procedure-test-001",
      patientId: "patient-test-001",
      encounterId: "encounter-test-001",
      basedOnServiceRequestId: "service-request-test-001",
      status: "completed",
      category: "diagnostic",
      code: {
        system: "http://snomed.info/sct",
        code: "168537006",
        display: "Chest X-ray"
      },
      performedPeriod: {
        start: "2026-05-27T04:30:00.000Z",
        end: "2026-05-27T05:00:00.000Z"
      },
      performers: [
        {
          actorType: "Practitioner",
          actorId: "practitioner-test-001",
          onBehalfOfOrganizationId: "department-imaging"
        }
      ],
      reportReferences: [
        {
          resourceType: "DiagnosticReport",
          id: "diagnostic-report-test-001"
        }
      ]
    });

    expect(procedure.toSnapshot()).toMatchObject({
      patientId: "patient-test-001",
      status: "completed",
      category: "diagnostic",
      basedOnServiceRequestId: "service-request-test-001"
    });
  });

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
});
