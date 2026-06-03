import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
import { ServiceRequest } from "./service-request.js";
import { createLaboratoryServiceRequestInput } from "./service-request.test-support.js";

describe("ServiceRequest validation", () => {
  it("rejects missing service codes", () => {
    expect(() =>
      ServiceRequest.order(
        createLaboratoryServiceRequestInput({
          id: "service-request-003",
          category: "procedure",
          code: {
            system: "http://snomed.info/sct",
            code: "",
            display: "Nội soi tiêu hóa"
          }
        })
      )
    ).toThrow(DomainError);
  });

  it("rejects invalid requested occurrence date", () => {
    expect(() =>
      ServiceRequest.order(
        createLaboratoryServiceRequestInput({
          id: "service-request-004",
          category: "consultation",
          code: {
            system: "http://snomed.info/sct",
            code: "11429006",
            display: "Consultation"
          },
          occurrenceAt: "not-a-date"
        })
      )
    ).toThrow(DomainError);
  });

  it("rejects requested occurrence timestamps before the authored time", () => {
    expect(() =>
      ServiceRequest.order(
        createLaboratoryServiceRequestInput({
          id: "service-request-invalid-timeline-001",
          authoredOn: "2026-05-28T02:00:00.000Z",
          occurrenceAt: "2026-05-28T01:59:59.000Z"
        })
      )
    ).toThrow(DomainError);
  });
});
