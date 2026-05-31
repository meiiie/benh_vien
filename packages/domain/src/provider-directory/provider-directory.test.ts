import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
import { ProviderDirectory, type ProviderDirectorySnapshot } from "./provider-directory.js";
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

  it("rejects invalid rehydrated provider directory metadata", () => {
    const scenarios: readonly {
      readonly name: string;
      readonly snapshot: ProviderDirectorySnapshot;
      readonly message: string;
    }[] = [
      {
        name: "organization type",
        snapshot: withFirstOrganization(createProviderDirectorySnapshot(), {
          type: "clinic" as never
        }),
        message: "Loại cơ sở y tế"
      },
      {
        name: "endpoint status",
        snapshot: withFirstEndpoint(createProviderDirectorySnapshot(), {
          status: "paused" as never
        }),
        message: "Trạng thái Endpoint"
      },
      {
        name: "endpoint connection type",
        snapshot: withFirstEndpoint(createProviderDirectorySnapshot(), {
          connectionType: "graphql" as never
        }),
        message: "Loại kết nối Endpoint"
      },
      {
        name: "endpoint payload type",
        snapshot: withFirstEndpoint(createProviderDirectorySnapshot(), {
          payloadTypes: []
        }),
        message: "payloadType"
      },
      {
        name: "contact system",
        snapshot: withFirstEndpoint(createProviderDirectorySnapshot(), {
          contact: [
            {
              system: "fax" as never,
              value: "+84 225 000 000",
              use: "work"
            }
          ]
        }),
        message: "Hệ thống liên hệ"
      },
      {
        name: "role period order",
        snapshot: withFirstPractitionerRole(createProviderDirectorySnapshot(), {
          periodStart: "2026-05-29T00:00:00.000Z",
          periodEnd: "2026-05-28T00:00:00.000Z"
        }),
        message: "không được trước"
      },
      {
        name: "generatedAt",
        snapshot: {
          ...createProviderDirectorySnapshot(),
          generatedAt: "not-a-date"
        },
        message: "Provider Directory không hợp lệ"
      },
      {
        name: "endpoint createdAt",
        snapshot: withFirstEndpoint(createProviderDirectorySnapshot(), {
          createdAt: "not-a-date"
        }),
        message: "createdAt của Endpoint"
      }
    ];

    for (const scenario of scenarios) {
      const rehydrate = () => ProviderDirectory.rehydrate(scenario.snapshot);

      expect(rehydrate, scenario.name).toThrow(DomainError);
      expect(rehydrate, scenario.name).toThrow(scenario.message);
    }
  });
});

function createProviderDirectorySnapshot(): ProviderDirectorySnapshot {
  return ProviderDirectory.assemble({
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
  }).toSnapshot();
}

function withFirstOrganization(
  snapshot: ProviderDirectorySnapshot,
  patch: Partial<ProviderDirectorySnapshot["organizations"][number]>
): ProviderDirectorySnapshot {
  const [organization, ...rest] = snapshot.organizations;

  if (!organization) {
    throw new Error("Missing organization fixture.");
  }

  return {
    ...snapshot,
    organizations: [{ ...organization, ...patch }, ...rest]
  };
}

function withFirstEndpoint(
  snapshot: ProviderDirectorySnapshot,
  patch: Partial<ProviderDirectorySnapshot["endpoints"][number]>
): ProviderDirectorySnapshot {
  const [endpoint, ...rest] = snapshot.endpoints;

  if (!endpoint) {
    throw new Error("Missing endpoint fixture.");
  }

  return {
    ...snapshot,
    endpoints: [{ ...endpoint, ...patch }, ...rest]
  };
}

function withFirstPractitionerRole(
  snapshot: ProviderDirectorySnapshot,
  patch: Partial<ProviderDirectorySnapshot["practitionerRoles"][number]>
): ProviderDirectorySnapshot {
  const [role, ...rest] = snapshot.practitionerRoles;

  if (!role) {
    throw new Error("Missing practitioner role fixture.");
  }

  return {
    ...snapshot,
    practitionerRoles: [{ ...role, ...patch }, ...rest]
  };
}
