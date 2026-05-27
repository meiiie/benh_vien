import { describe, expect, it } from "vitest";
import { mapServiceRequestToFhir } from "../fhir/map-service-request-to-fhir.js";
import { DomainError } from "../shared/domain-error.js";
import { ServiceRequest } from "./service-request.js";

describe("ServiceRequest", () => {
  it("records a structured diagnostic or procedure order", () => {
    const serviceRequest = ServiceRequest.order({
      id: "service-request-001",
      patientId: "patient-001",
      encounterId: "encounter-001",
      reasonConditionId: "condition-001",
      category: "laboratory",
      priority: "urgent",
      code: {
        system: "http://loinc.org",
        code: "58410-2",
        display: "Complete blood count panel"
      },
      occurrenceAt: "2026-05-28T02:00:00.000Z",
      authoredOn: "2026-05-28T01:30:00.000Z",
      requesterPractitionerId: "practitioner-001",
      performerOrganizationId: "department-laboratory",
      patientInstruction: "Nhịn ăn theo hướng dẫn của khoa xét nghiệm.",
      note: "Ưu tiên trước khi hội chẩn."
    });

    expect(serviceRequest.toSnapshot()).toMatchObject({
      id: "service-request-001",
      patientId: "patient-001",
      encounterId: "encounter-001",
      reasonConditionId: "condition-001",
      status: "active",
      intent: "order",
      category: "laboratory",
      priority: "urgent",
      occurrenceAt: "2026-05-28T02:00:00.000Z",
      authoredOn: "2026-05-28T01:30:00.000Z",
      requesterPractitionerId: "practitioner-001",
      performerOrganizationId: "department-laboratory"
    });
  });

  it("normalizes free text identifiers and display names", () => {
    const serviceRequest = ServiceRequest.order({
      id: " service-request-002 ",
      patientId: " patient-001 ",
      category: "imaging",
      code: {
        system: " http://snomed.info/sct ",
        code: " 363680008 ",
        display: "  X-ray imaging  "
      },
      requesterPractitionerId: " practitioner-001 "
    });

    expect(serviceRequest.toSnapshot()).toMatchObject({
      id: "service-request-002",
      patientId: "patient-001",
      code: {
        system: "http://snomed.info/sct",
        code: "363680008",
        display: "X-ray imaging"
      },
      requesterPractitionerId: "practitioner-001"
    });
  });

  it("maps internal categories to SNOMED CT category codings for FHIR export", () => {
    const serviceRequest = ServiceRequest.order({
      id: "service-request-005",
      patientId: "patient-001",
      category: "laboratory",
      code: {
        system: "http://loinc.org",
        code: "58410-2",
        display: "Complete blood count panel"
      },
      requesterPractitionerId: "practitioner-001"
    });

    expect(mapServiceRequestToFhir(serviceRequest).category?.[0]?.coding?.[0]).toEqual({
      system: "http://snomed.info/sct",
      code: "108252007",
      display: "Laboratory procedure"
    });
  });

  it("rejects missing service codes", () => {
    expect(() =>
      ServiceRequest.order({
        id: "service-request-003",
        patientId: "patient-001",
        category: "procedure",
        code: {
          system: "http://snomed.info/sct",
          code: "",
          display: "Nội soi tiêu hóa"
        },
        requesterPractitionerId: "practitioner-001"
      })
    ).toThrow(DomainError);
  });

  it("rejects invalid requested occurrence date", () => {
    expect(() =>
      ServiceRequest.order({
        id: "service-request-004",
        patientId: "patient-001",
        category: "consultation",
        code: {
          system: "http://snomed.info/sct",
          code: "11429006",
          display: "Consultation"
        },
        occurrenceAt: "not-a-date",
        requesterPractitionerId: "practitioner-001"
      })
    ).toThrow(DomainError);
  });
});
