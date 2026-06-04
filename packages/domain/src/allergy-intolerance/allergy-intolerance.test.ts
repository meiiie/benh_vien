import { describe, expect, it } from "vitest";
import { mapAllergyIntoleranceToFhir } from "../fhir/map-allergy-intolerance-to-fhir.js";
import { DomainError } from "../shared/domain-error.js";
import { AllergyIntolerance } from "./allergy-intolerance.js";

describe("AllergyIntolerance", () => {
  it("records a structured allergy risk", () => {
    const allergy = AllergyIntolerance.record({
      id: "allergy-test-001",
      patientId: "patient-test-001",
      encounterId: "encounter-test-001",
      type: "allergy",
      category: "medication",
      criticality: "high",
      code: {
        system: "http://snomed.info/sct",
        code: "91936005",
        display: "Allergy to penicillin"
      },
      reaction: {
        manifestation: {
          system: "http://snomed.info/sct",
          code: "271807003",
          display: "Skin rash"
        },
        severity: "moderate"
      },
      recordedAt: "2026-05-27T04:30:00.000Z",
      recorderPractitionerId: "practitioner-test-001"
    });

    expect(allergy.toSnapshot()).toMatchObject({
      id: "allergy-test-001",
      patientId: "patient-test-001",
      clinicalStatus: "active",
      verificationStatus: "confirmed",
      criticality: "high"
    });
  });

  it("rejects an empty coded allergen", () => {
    expect(() =>
      AllergyIntolerance.record({
        id: "allergy-test-002",
        patientId: "patient-test-001",
        type: "allergy",
        category: "medication",
        code: {
          system: "http://snomed.info/sct",
          code: "",
          display: "Penicillin"
        },
        recorderPractitionerId: "practitioner-test-001"
      })
    ).toThrow(DomainError);
  });

  it("rejects invalid rehydrated allergy metadata", () => {
    const snapshot = AllergyIntolerance.record({
      id: "allergy-test-003",
      patientId: "patient-test-001",
      encounterId: "encounter-test-001",
      type: "allergy",
      category: "medication",
      criticality: "high",
      code: {
        system: "http://snomed.info/sct",
        code: "91936005",
        display: "Allergy to penicillin"
      },
      reaction: {
        manifestation: {
          system: "http://snomed.info/sct",
          code: "271807003",
          display: "Skin rash"
        },
        severity: "moderate"
      },
      recorderPractitionerId: "practitioner-test-001"
    }).toSnapshot();

    expect(() =>
      AllergyIntolerance.rehydrate({
        ...snapshot,
        clinicalStatus: "unknown" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      AllergyIntolerance.rehydrate({
        ...snapshot,
        verificationStatus: "draft" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      AllergyIntolerance.rehydrate({
        ...snapshot,
        type: "adverse-event" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      AllergyIntolerance.rehydrate({
        ...snapshot,
        category: "device" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      AllergyIntolerance.rehydrate({
        ...snapshot,
        criticality: "medium" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      AllergyIntolerance.rehydrate({
        ...snapshot,
        reaction: {
          ...snapshot.reaction!,
          severity: "extreme" as never
        }
      })
    ).toThrow(DomainError);

    expect(() =>
      AllergyIntolerance.rehydrate({
        ...snapshot,
        recordedAt: "not-a-date"
      })
    ).toThrow(DomainError);

    expect(() =>
      AllergyIntolerance.rehydrate({
        ...snapshot,
        recorderPractitionerId: " "
      })
    ).toThrow(DomainError);

    expect(() =>
      AllergyIntolerance.rehydrate({
        ...snapshot,
        updatedAt: "1999-01-01T00:00:00.000Z"
      })
    ).toThrow(DomainError);
  });

  it("omits FHIR clinicalStatus when allergy is entered in error", () => {
    const allergy = AllergyIntolerance.record({
      id: "allergy-test-004",
      patientId: "patient-test-001",
      type: "allergy",
      category: "medication",
      verificationStatus: "entered-in-error",
      code: {
        system: "http://snomed.info/sct",
        code: "91936005",
        display: "Allergy to penicillin"
      },
      recorderPractitionerId: "practitioner-test-001"
    });

    expect(mapAllergyIntoleranceToFhir(allergy)).toMatchObject({
      resourceType: "AllergyIntolerance",
      verificationStatus: {
        coding: [
          expect.objectContaining({
            code: "entered-in-error"
          })
        ]
      }
    });
    expect(mapAllergyIntoleranceToFhir(allergy).clinicalStatus).toBeUndefined();
  });
});
