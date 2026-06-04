import { Patient } from "../index.js";
import type { PatientSnapshot } from "./patient.types.js";

type RegisteredPatientOverrides = Partial<Parameters<typeof Patient.register>[0]>;
type PatientSnapshotOverrides = Partial<PatientSnapshot>;

export function createRegisteredPatientSnapshot(
  overrides: RegisteredPatientOverrides = {}
): PatientSnapshot {
  return Patient.register({
    id: "patient-test-fixture",
    identifiers: [
      {
        system: "urn:gov:vietnam:national-id",
        value: "000000000003",
        type: "national-id"
      }
    ],
    fullName: "Patient Fixture",
    managingOrganizationId: "hospital-demo",
    ...overrides
  }).toSnapshot();
}

export function createActivePatientForMerge(
  overrides: PatientSnapshotOverrides = {}
): Patient {
  return Patient.rehydrate({
    id: "patient-test-merge-source",
    identifiers: [
      {
        system: "urn:benh-vien-so:mrn",
        value: "MRN-MERGE-SOURCE",
        type: "hospital-mrn"
      }
    ],
    fullName: "Duplicate Patient",
    gender: "unknown",
    managingOrganizationId: "hospital-demo",
    status: "active",
    createdAt: "2026-05-28T00:00:00.000Z",
    updatedAt: "2026-05-28T00:00:00.000Z",
    ...overrides
  });
}

export function createMergedPatient(): Patient {
  const patient = createActivePatientForMerge();

  patient.markMerged({
    targetPatientId: "patient-test-canonical",
    mergedByActorId: "admin-test",
    reason: "Duplicate registration after MPI review.",
    mergedAt: new Date("2026-05-28T01:00:00.000Z")
  });

  return patient;
}
