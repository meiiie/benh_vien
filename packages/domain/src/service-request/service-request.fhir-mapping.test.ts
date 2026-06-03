import { describe, expect, it } from "vitest";
import { mapServiceRequestToFhir } from "../fhir/map-service-request-to-fhir.js";
import { ServiceRequest } from "./service-request.js";
import { createLaboratoryServiceRequestInput } from "./service-request.test-support.js";

describe("ServiceRequest FHIR mapping", () => {
  it("maps internal categories to SNOMED CT category codings for FHIR export", () => {
    const serviceRequest = ServiceRequest.order(
      createLaboratoryServiceRequestInput({
        id: "service-request-005"
      })
    );

    expect(mapServiceRequestToFhir(serviceRequest).category?.[0]?.coding?.[0]).toEqual({
      system: "http://snomed.info/sct",
      code: "108252007",
      display: "Laboratory procedure"
    });
  });
});
