import { describe, expect, it } from "vitest";
import {
  canAccess,
  canAccessPatientRecord,
  filterAccessiblePatientRecords,
  type ActorContext,
  type ProviderDirectorySnapshot
} from "../index.js";

const providerDirectory: Pick<ProviderDirectorySnapshot, "organizations" | "practitionerRoles"> = {
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

describe("patient record access control", () => {
  it("allows treatment users only for patients managed by their active organization", () => {
    const actor: ActorContext = {
      actorId: "practitioner-001",
      role: "clinician",
      purposeOfUse: "TREATMENT"
    };

    expect(
      canAccessPatientRecord(actor, { managingOrganizationId: "hospital-a" }, providerDirectory)
    ).toBe(true);
    expect(
      canAccessPatientRecord(actor, { managingOrganizationId: "department-a" }, providerDirectory)
    ).toBe(true);
    expect(
      canAccessPatientRecord(actor, { managingOrganizationId: "hospital-b" }, providerDirectory)
    ).toBe(false);
  });

  it("includes active child organizations when a practitioner is scoped to the parent hospital", () => {
    const actor: ActorContext = {
      actorId: "practitioner-hospital",
      role: "clinician",
      purposeOfUse: "TREATMENT"
    };

    expect(
      canAccessPatientRecord(actor, { managingOrganizationId: "department-a" }, providerDirectory)
    ).toBe(true);
  });

  it("keeps audit and admin access explicit", () => {
    const auditor: ActorContext = {
      actorId: "auditor-001",
      role: "auditor",
      purposeOfUse: "AUDIT"
    };
    const auditorWithTreatmentPurpose: ActorContext = {
      ...auditor,
      purposeOfUse: "TREATMENT"
    };
    const admin: ActorContext = {
      actorId: "admin-001",
      role: "admin",
      purposeOfUse: "OPERATIONS"
    };

    expect(
      canAccessPatientRecord(auditor, { managingOrganizationId: "hospital-x" }, providerDirectory)
    ).toBe(true);
    expect(
      canAccessPatientRecord(
        auditorWithTreatmentPurpose,
        { managingOrganizationId: "hospital-x" },
        providerDirectory
      )
    ).toBe(false);
    expect(
      canAccessPatientRecord(admin, { managingOrganizationId: "hospital-x" }, providerDirectory)
    ).toBe(true);
  });

  it("keeps integration actors out of patient charts", () => {
    const integrationActor: ActorContext = {
      actorId: "system-hai-phong-referral-gateway",
      role: "integration",
      purposeOfUse: "OPERATIONS"
    };

    expect(canAccess(integrationActor, "record-transfer:acknowledge")).toBe(true);
    expect(canAccess(integrationActor, "patient:list")).toBe(false);
    expect(
      canAccessPatientRecord(
        integrationActor,
        { managingOrganizationId: "hospital-a" },
        providerDirectory
      )
    ).toBe(false);
  });

  it("limits record transfer acknowledgement callbacks to gateway and admin roles", () => {
    const clinicianActor: ActorContext = {
      actorId: "practitioner-001",
      role: "clinician",
      purposeOfUse: "OPERATIONS"
    };
    const nurseActor: ActorContext = {
      actorId: "nurse-001",
      role: "nurse",
      purposeOfUse: "OPERATIONS"
    };
    const adminActor: ActorContext = {
      actorId: "admin-001",
      role: "admin",
      purposeOfUse: "OPERATIONS"
    };
    const integrationActor: ActorContext = {
      actorId: "system-hai-phong-referral-gateway",
      role: "integration",
      purposeOfUse: "OPERATIONS"
    };

    expect(canAccess(integrationActor, "record-transfer:acknowledge")).toBe(true);
    expect(canAccess(adminActor, "record-transfer:acknowledge")).toBe(true);
    expect(canAccess(clinicianActor, "record-transfer:acknowledge")).toBe(false);
    expect(canAccess(nurseActor, "record-transfer:acknowledge")).toBe(false);
  });

  it("filters patient registries by the actor treatment organization", () => {
    const actor: ActorContext = {
      actorId: "practitioner-001",
      role: "clinician",
      purposeOfUse: "TREATMENT"
    };

    expect(
      filterAccessiblePatientRecords(
        actor,
        [
          { id: "patient-a", managingOrganizationId: "hospital-a" },
          { id: "patient-b", managingOrganizationId: "hospital-b" }
        ],
        providerDirectory
      )
    ).toEqual([{ id: "patient-a", managingOrganizationId: "hospital-a" }]);
  });

  it("uses active PractitionerRole periods and active organizations for patient scope", () => {
    const actor: ActorContext = {
      actorId: "practitioner-period",
      role: "clinician",
      purposeOfUse: "TREATMENT"
    };
    const inactiveOrganizationActor: ActorContext = {
      actorId: "practitioner-inactive-org",
      role: "clinician",
      purposeOfUse: "TREATMENT"
    };
    const scopedProviderDirectory: Pick<
      ProviderDirectorySnapshot,
      "organizations" | "practitionerRoles"
    > = {
      organizations: [
        ...providerDirectory.organizations,
        {
          id: "department-inactive",
          identifiers: [],
          active: false,
          type: "department",
          name: "Inactive Department",
          partOfOrganizationId: "hospital-a",
          createdAt: "2026-05-28T00:00:00.000Z",
          updatedAt: "2026-05-28T00:00:00.000Z"
        }
      ],
      practitionerRoles: [
        ...providerDirectory.practitionerRoles,
        {
          id: "role-practitioner-period",
          practitionerId: "practitioner-period",
          organizationId: "department-a",
          active: true,
          code: {
            system: "urn:test",
            code: "doctor",
            display: "Doctor"
          },
          periodStart: "2026-05-28T00:00:00.000Z",
          periodEnd: "2026-05-30T23:59:59.000Z",
          createdAt: "2026-05-28T00:00:00.000Z",
          updatedAt: "2026-05-28T00:00:00.000Z"
        },
        {
          id: "role-practitioner-inactive-org",
          practitionerId: "practitioner-inactive-org",
          organizationId: "department-inactive",
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

    expect(
      canAccessPatientRecord(
        actor,
        { managingOrganizationId: "department-a" },
        scopedProviderDirectory,
        new Date("2026-05-27T23:59:59.000Z")
      )
    ).toBe(false);
    expect(
      canAccessPatientRecord(
        actor,
        { managingOrganizationId: "department-a" },
        scopedProviderDirectory,
        new Date("2026-05-29T00:00:00.000Z")
      )
    ).toBe(true);
    expect(
      canAccessPatientRecord(
        actor,
        { managingOrganizationId: "department-a" },
        scopedProviderDirectory,
        new Date("2026-05-31T00:00:00.000Z")
      )
    ).toBe(false);
    expect(
      canAccessPatientRecord(
        inactiveOrganizationActor,
        { managingOrganizationId: "department-inactive" },
        scopedProviderDirectory,
        new Date("2026-05-29T00:00:00.000Z")
      )
    ).toBe(false);
  });
});
