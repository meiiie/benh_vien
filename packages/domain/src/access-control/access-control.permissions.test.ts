import { describe, expect, it } from "vitest";
import { canAccess, canAccessPatientRecord, type ActorContext } from "../index.js";
import { providerDirectory } from "./access-control.test-support.js";

describe("role permission boundaries", () => {
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

  it("keeps nurse encounter workflow below clinician privileges", () => {
    const clinicianActor: ActorContext = {
      actorId: "clinician-001",
      role: "clinician",
      purposeOfUse: "TREATMENT"
    };
    const nurseActor: ActorContext = {
      actorId: "nurse-001",
      role: "nurse",
      purposeOfUse: "TREATMENT"
    };

    expect(canAccess(clinicianActor, "encounter:create")).toBe(true);
    expect(canAccess(clinicianActor, "encounter:finish")).toBe(true);
    expect(canAccess(clinicianActor, "encounter:fhir-export")).toBe(true);
    expect(canAccess(nurseActor, "encounter:list")).toBe(true);
    expect(canAccess(nurseActor, "encounter:read")).toBe(true);
    expect(canAccess(nurseActor, "encounter:create")).toBe(false);
    expect(canAccess(nurseActor, "encounter:finish")).toBe(false);
    expect(canAccess(nurseActor, "encounter:fhir-export")).toBe(false);
  });
});
