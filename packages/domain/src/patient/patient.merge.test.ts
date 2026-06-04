import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
import { createActivePatientForMerge, createMergedPatient } from "./patient.test-support.js";

describe("Patient merge lifecycle", () => {
  it("marks a duplicate patient as merged into a canonical record", () => {
    const patient = createMergedPatient();

    expect(patient.toSnapshot()).toMatchObject({
      status: "merged",
      mergedIntoPatientId: "patient-test-canonical",
      mergedAt: "2026-05-28T01:00:00.000Z",
      mergedByActorId: "admin-test",
      mergeReason: "Duplicate registration after MPI review."
    });
    expect(() =>
      patient.updateDemographics({
        fullName: "Should Not Update"
      })
    ).toThrow();
  });

  it("rejects merging a patient before it was created", () => {
    const patient = createActivePatientForMerge({
      id: "patient-test-lifecycle-002",
      createdAt: "2026-05-28T02:00:00.000Z",
      updatedAt: "2026-05-28T02:00:00.000Z"
    });

    expect(() =>
      patient.markMerged({
        targetPatientId: "patient-test-canonical",
        mergedByActorId: "admin-test",
        reason: "Duplicate registration",
        mergedAt: new Date("2026-05-28T01:59:59.000Z")
      })
    ).toThrow(DomainError);
  });
});
