import { describe, expect, it } from "vitest";
import { ProviderDirectory } from "./provider-directory.js";
import { mapProviderDirectoryToFhirBundle } from "../fhir/map-provider-directory-to-fhir.js";

describe("ProviderDirectory", () => {
  it("validates provider references and exports FHIR directory resources", () => {
    const directory = ProviderDirectory.assemble({
      generatedAt: new Date("2026-05-28T01:00:00.000Z"),
      organizations: [
        {
          id: "hospital-hai-phong-demo",
          identifiers: [
            {
              system: "urn:oid:2.16.704.1.2.3.4",
              value: "HP-DEMO"
            }
          ],
          active: true,
          type: "hospital",
          name: "Bệnh viện số Hải Phòng",
          address: "Hải Phòng, Việt Nam"
        },
        {
          id: "department-laboratory",
          identifiers: [],
          active: true,
          type: "laboratory",
          name: "Khoa xét nghiệm",
          partOfOrganizationId: "hospital-hai-phong-demo"
        }
      ],
      practitioners: [
        {
          id: "practitioner-demo-001",
          identifiers: [],
          active: true,
          fullName: "Bác sĩ điều trị"
        }
      ],
      endpoints: [
        {
          id: "endpoint-fhir-hai-phong-demo",
          managingOrganizationId: "hospital-hai-phong-demo",
          status: "active",
          connectionType: "hl7-fhir-rest",
          name: "FHIR gateway Hải Phòng",
          address: "https://fhir.demo.wiiicare.vn/fhir",
          payloadTypes: [
            {
              system: "http://hl7.org/fhir/resource-types",
              code: "Bundle",
              display: "FHIR Bundle"
            }
          ]
        }
      ],
      practitionerRoles: [
        {
          id: "role-practitioner-demo-001",
          practitionerId: "practitioner-demo-001",
          organizationId: "hospital-hai-phong-demo",
          active: true,
          code: {
            system: "http://terminology.hl7.org/CodeSystem/practitioner-role",
            code: "doctor",
            display: "Doctor"
          },
          endpointIds: ["endpoint-fhir-hai-phong-demo"]
        }
      ]
    });

    const bundle = mapProviderDirectoryToFhirBundle(
      directory,
      new Date("2026-05-28T02:00:00.000Z")
    );

    expect(bundle.resourceType).toBe("Bundle");
    expect(bundle.type).toBe("collection");
    expect(bundle.entry.map((entry) => entry.resource.resourceType)).toEqual([
      "Organization",
      "Organization",
      "Practitioner",
      "PractitionerRole",
      "Endpoint"
    ]);
    expect(bundle.entry.at(-1)?.resource).toMatchObject({
      resourceType: "Endpoint",
      connectionType: {
        code: "hl7-fhir-rest"
      }
    });
  });

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
