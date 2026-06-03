import { describe, expect, it } from "vitest";
import {
  canAccessPatientRecord,
  type ActorContext,
  type ProviderDirectorySnapshot
} from "../index.js";
import { providerDirectory } from "./access-control.test-support.js";

describe("patient record active organization scope", () => {
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
