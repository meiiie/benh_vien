import { describe, expect, it } from "vitest";
import { ServiceRequest } from "./service-request.js";
import { createLaboratoryServiceRequestInput } from "./service-request.test-support.js";

describe("ServiceRequest ordering", () => {
  it("records a structured diagnostic or procedure order", () => {
    const serviceRequest = ServiceRequest.order(
      createLaboratoryServiceRequestInput({
        id: "service-request-001"
      })
    );

    expect(serviceRequest.toSnapshot()).toMatchObject({
      id: "service-request-001",
      patientId: "patient-001",
      encounterId: "encounter-001",
      reasonConditionId: "condition-001",
      status: "active",
      intent: "order",
      category: "laboratory",
      priority: "urgent",
      occurrenceAt: "2026-05-28T02:00:00.000Z",
      authoredOn: "2026-05-28T01:30:00.000Z",
      requesterPractitionerId: "practitioner-001",
      performerOrganizationId: "department-laboratory"
    });
  });

  it("normalizes free text identifiers and display names", () => {
    const serviceRequest = ServiceRequest.order(
      createLaboratoryServiceRequestInput({
        id: " service-request-002 ",
        patientId: " patient-001 ",
        category: "imaging",
        code: {
          system: " http://snomed.info/sct ",
          code: " 363680008 ",
          display: "  X-ray imaging  "
        },
        requesterPractitionerId: " practitioner-001 "
      })
    );

    expect(serviceRequest.toSnapshot()).toMatchObject({
      id: "service-request-002",
      patientId: "patient-001",
      code: {
        system: "http://snomed.info/sct",
        code: "363680008",
        display: "X-ray imaging"
      },
      requesterPractitionerId: "practitioner-001"
    });
  });
});
