import { describe, expect, it } from "vitest";
import { ProviderDirectory } from "./provider-directory.js";

describe("ProviderDirectory reference validation", () => {
  it("rejects dangling endpoint references in practitioner roles", () => {
    expect(() =>
      ProviderDirectory.assemble({
        organizations: [
          {
            id: "hospital-demo",
            identifiers: [],
            active: true,
            type: "hospital",
            name: "Bệnh viện demo"
          }
        ],
        practitioners: [],
        endpoints: [],
        practitionerRoles: [
          {
            id: "role-demo",
            organizationId: "hospital-demo",
            active: true,
            code: {
              system: "http://terminology.hl7.org/CodeSystem/practitioner-role",
              code: "doctor",
              display: "Doctor"
            },
            endpointIds: ["endpoint-missing"]
          }
        ]
      })
    ).toThrow("tham chiếu Endpoint không tồn tại");
  });
});
