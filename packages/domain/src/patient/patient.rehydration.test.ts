import { describe, expect, it } from "vitest";
import { Patient } from "../index.js";
import { DomainError } from "../shared/domain-error.js";
import { createRegisteredPatientSnapshot } from "./patient.test-support.js";

describe("Patient rehydration invariants", () => {
  it("rejects invalid rehydrated patient metadata", () => {
    const snapshot = createRegisteredPatientSnapshot({
      id: "patient-test-003",
      fullName: "Le Van C",
      birthDate: "1990-01-01",
      gender: "male"
    });

    expect(() =>
      Patient.rehydrate({
        ...snapshot,
        identifiers: []
      })
    ).toThrow(DomainError);

    expect(() =>
      Patient.rehydrate({
        ...snapshot,
        identifiers: [
          {
            system: "urn:gov:vietnam:national-id",
            value: "000000000003",
            type: "citizen-id" as never
          }
        ]
      })
    ).toThrow(DomainError);

    expect(() =>
      Patient.rehydrate({
        ...snapshot,
        birthDate: "1990-02-31"
      })
    ).toThrow(DomainError);

    expect(() =>
      Patient.rehydrate({
        ...snapshot,
        gender: "not-known" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      Patient.rehydrate({
        ...snapshot,
        status: "archived" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      Patient.rehydrate({
        ...snapshot,
        status: "merged",
        mergedIntoPatientId: undefined,
        mergedAt: "2026-05-28T01:00:00.000Z",
        mergedByActorId: "admin-test",
        mergeReason: "Duplicate registration"
      })
    ).toThrow(DomainError);

    expect(() =>
      Patient.rehydrate({
        ...snapshot,
        status: "active",
        mergedIntoPatientId: "patient-test-canonical"
      })
    ).toThrow(DomainError);

    expect(() =>
      Patient.rehydrate({
        ...snapshot,
        createdAt: "not-a-date"
      })
    ).toThrow(DomainError);
  });

  it("rejects invalid rehydrated patient lifecycle timestamps", () => {
    const snapshot = createRegisteredPatientSnapshot({
      id: "patient-test-lifecycle-001",
      fullName: "Lifecycle Patient"
    });

    expect(() =>
      Patient.rehydrate({
        ...snapshot,
        updatedAt: "1999-01-01T00:00:00.000Z"
      })
    ).toThrow(DomainError);

    expect(() =>
      Patient.rehydrate({
        ...snapshot,
        status: "merged",
        mergedIntoPatientId: "patient-test-canonical",
        mergedAt: "1999-01-01T00:00:00.000Z",
        mergedByActorId: "admin-test",
        mergeReason: "Duplicate registration"
      })
    ).toThrow(DomainError);
  });
});
