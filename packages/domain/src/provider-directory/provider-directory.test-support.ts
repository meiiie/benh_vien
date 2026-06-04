import { ProviderDirectory, type ProviderDirectorySnapshot } from "./provider-directory.js";

export function assembleProviderDirectory(): ProviderDirectory {
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
}

export function createProviderDirectorySnapshot(): ProviderDirectorySnapshot {
  return assembleProviderDirectory().toSnapshot();
}

export function withFirstOrganization(
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

export function withFirstEndpoint(
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

export function withFirstPractitionerRole(
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
