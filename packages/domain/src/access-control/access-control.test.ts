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
});
