import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
import { ServiceRequest } from "./service-request.js";
import { createLaboratoryServiceRequestSnapshot } from "./service-request.test-support.js";
import type { ServiceRequestSnapshot } from "./service-request.types.js";

describe("ServiceRequest rehydration", () => {
  it("rejects invalid rehydrated service request metadata", () => {
    const snapshot = createLaboratoryServiceRequestSnapshot({
      id: "service-request-006"
    });

    const invalidOverrides: Array<Partial<ServiceRequestSnapshot>> = [
      { status: "accepted" as never },
      { intent: "request" as never },
      { category: "pharmacy" as never },
      { priority: "normal" as never },
      {
        code: {
          ...snapshot.code,
          code: " "
        }
      },
      { occurrenceAt: "not-a-date" },
      { requesterPractitionerId: " " },
      { createdAt: "not-a-date" },
      { occurrenceAt: "2026-05-28T01:29:59.000Z" },
      { updatedAt: "1999-01-01T00:00:00.000Z" }
    ];

    for (const invalidOverride of invalidOverrides) {
      expect(() =>
        ServiceRequest.rehydrate({
          ...snapshot,
          ...invalidOverride
        })
      ).toThrow(DomainError);
    }
  });
});
