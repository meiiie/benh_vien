import type { ProviderDirectorySnapshot } from "../index.js";

export const providerDirectory: Pick<
  ProviderDirectorySnapshot,
  "organizations" | "practitionerRoles"
> = {
  organizations: [
    {
      id: "hospital-a",
      identifiers: [],
      active: true,
      type: "hospital",
      name: "Hospital A",
      createdAt: "2026-05-28T00:00:00.000Z",
      updatedAt: "2026-05-28T00:00:00.000Z"
    },
    {
      id: "department-a",
      identifiers: [],
      active: true,
      type: "department",
      name: "Department A",
      partOfOrganizationId: "hospital-a",
      createdAt: "2026-05-28T00:00:00.000Z",
      updatedAt: "2026-05-28T00:00:00.000Z"
    },
    {
      id: "hospital-b",
      identifiers: [],
      active: true,
      type: "hospital",
      name: "Hospital B",
      createdAt: "2026-05-28T00:00:00.000Z",
      updatedAt: "2026-05-28T00:00:00.000Z"
    }
  ],
  practitionerRoles: [
    {
      id: "role-practitioner-001",
      practitionerId: "practitioner-001",
      organizationId: "department-a",
      active: true,
      code: {
        system: "urn:test",
        code: "doctor",
        display: "Doctor"
      },
      createdAt: "2026-05-28T00:00:00.000Z",
      updatedAt: "2026-05-28T00:00:00.000Z"
    },
    {
      id: "role-practitioner-inactive",
      practitionerId: "practitioner-001",
      organizationId: "hospital-b",
      active: false,
      code: {
        system: "urn:test",
        code: "doctor",
        display: "Doctor"
      },
      createdAt: "2026-05-28T00:00:00.000Z",
      updatedAt: "2026-05-28T00:00:00.000Z"
    },
    {
      id: "role-practitioner-hospital",
      practitionerId: "practitioner-hospital",
      organizationId: "hospital-a",
      active: true,
      code: {
        system: "urn:test",
        code: "doctor",
        display: "Doctor"
      },
      createdAt: "2026-05-28T00:00:00.000Z",
      updatedAt: "2026-05-28T00:00:00.000Z"
    }
  ]
};
