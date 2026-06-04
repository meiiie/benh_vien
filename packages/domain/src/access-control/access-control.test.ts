import { describe, expect, it } from "vitest";
import {
  canAccessPatientRecord,
  filterAccessiblePatientRecords,
  type ActorContext
} from "../index.js";
import { providerDirectory } from "./access-control.test-support.js";

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
