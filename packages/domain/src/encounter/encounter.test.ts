import { describe, expect, it } from "vitest";
import { mapEncounterToFhir } from "../fhir/map-encounter-to-fhir.js";
import { DomainError } from "../shared/domain-error.js";
import { Encounter } from "./encounter.js";

describe("Encounter", () => {
  it("creates an in-progress encounter and exports it as FHIR Encounter", () => {
    const encounter = Encounter.create({
      id: "encounter-test-001",
      patientId: "patient-test-001",
      class: "ambulatory",
      serviceType: "Khám tim mạch",
      reasonText: "Đau ngực cần đánh giá chuyên khoa.",
      departmentId: "department-cardiology",
      attendingPractitionerId: "practitioner-test-001",
      startedAt: "2026-05-28T02:00:00.000Z"
    });

    expect(encounter.toSnapshot()).toMatchObject({
      status: "in-progress",
      class: "ambulatory",
      startedAt: "2026-05-28T02:00:00.000Z"
    });
    expect(mapEncounterToFhir(encounter)).toMatchObject({
      resourceType: "Encounter",
      status: "in-progress",
      class: {
        system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        code: "AMB"
      },
      subject: {
        reference: "Patient/patient-test-001"
      },
      period: {
        start: "2026-05-28T02:00:00.000Z"
      }
    });
  });

  it("finishes an active encounter with a valid end time", () => {
    const encounter = Encounter.create({
      id: "encounter-test-002",
      patientId: "patient-test-001",
      class: "emergency",
      serviceType: "Cấp cứu",
      reasonText: "Khó thở cấp.",
      attendingPractitionerId: "practitioner-test-001",
      startedAt: "2026-05-28T02:00:00.000Z"
    });

    encounter.finish(new Date("2026-05-28T03:30:00.000Z"));

    expect(encounter.toSnapshot()).toMatchObject({
      status: "finished",
      startedAt: "2026-05-28T02:00:00.000Z",
      endedAt: "2026-05-28T03:30:00.000Z"
    });
  });

  it("rejects invalid encounter lifecycle data", () => {
    expect(() =>
      Encounter.create({
        id: "encounter-test-003",
        patientId: "patient-test-001",
        class: "ambulatory",
        serviceType: "Khám nội",
        reasonText: "Theo dõi sau điều trị.",
        attendingPractitionerId: "practitioner-test-001",
        status: "finished",
        startedAt: "2026-05-28T02:00:00.000Z"
      })
    ).toThrow(DomainError);

    expect(() =>
      Encounter.create({
        id: "encounter-test-004",
        patientId: "patient-test-001",
        class: "ambulatory",
        serviceType: "Khám nội",
        reasonText: "Theo dõi sau điều trị.",
        attendingPractitionerId: "practitioner-test-001",
        status: "in-progress",
        startedAt: "2026-05-28T02:00:00.000Z",
        endedAt: "2026-05-28T03:00:00.000Z"
      })
    ).toThrow(DomainError);
  });

  it("rejects invalid rehydrated encounter snapshots", () => {
    const snapshot = Encounter.create({
      id: "encounter-test-005",
      patientId: "patient-test-001",
      class: "virtual",
      serviceType: "Tư vấn từ xa",
      reasonText: "Tái khám qua nền tảng số.",
      attendingPractitionerId: "practitioner-test-001",
      startedAt: "2026-05-28T02:00:00.000Z"
    }).toSnapshot();

    expect(() =>
      Encounter.rehydrate({
        ...snapshot,
        status: "arrived" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      Encounter.rehydrate({
        ...snapshot,
        class: "home" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      Encounter.rehydrate({
        ...snapshot,
        startedAt: "not-a-date"
      })
    ).toThrow(DomainError);

    expect(() =>
      Encounter.rehydrate({
        ...snapshot,
        status: "finished"
      })
    ).toThrow(DomainError);
  });

  it("rejects invalid finish timestamps", () => {
    const encounter = Encounter.create({
      id: "encounter-test-006",
      patientId: "patient-test-001",
      class: "inpatient",
      serviceType: "Điều trị nội trú",
      reasonText: "Theo dõi sau phẫu thuật.",
      attendingPractitionerId: "practitioner-test-001",
      startedAt: "2026-05-28T02:00:00.000Z"
    });

    expect(() => encounter.finish(new Date("not-a-date"))).toThrow(DomainError);
    expect(() => encounter.finish(new Date("2026-05-28T01:59:59.000Z"))).toThrow(
      DomainError
    );
  });
});
