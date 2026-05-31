import { describe, expect, it } from "vitest";
import { mapDiagnosticReportToFhir } from "../fhir/map-diagnostic-report-to-fhir.js";
import { DomainError } from "../shared/domain-error.js";
import { DiagnosticReport } from "./diagnostic-report.js";

describe("DiagnosticReport", () => {
  it("issues a result report linked to a service request and observations", () => {
    const diagnosticReport = DiagnosticReport.issue({
      id: "diagnostic-report-001",
      patientId: "patient-001",
      encounterId: "encounter-001",
      basedOnServiceRequestId: "service-request-001",
      category: "laboratory",
      code: {
        system: "http://loinc.org",
        code: "58410-2",
        display: "Complete blood count panel"
      },
      effectiveAt: "2026-05-28T02:30:00.000Z",
      issuedAt: "2026-05-28T03:00:00.000Z",
      performerOrganizationId: "department-laboratory",
      resultsInterpreterPractitionerId: "practitioner-001",
      resultObservationIds: ["observation-001", "observation-001", " observation-002 "],
      conclusion: "Các chỉ số trong giới hạn theo bối cảnh lâm sàng."
    });

    expect(diagnosticReport.toSnapshot()).toMatchObject({
      id: "diagnostic-report-001",
      patientId: "patient-001",
      encounterId: "encounter-001",
      basedOnServiceRequestId: "service-request-001",
      status: "final",
      category: "laboratory",
      effectiveAt: "2026-05-28T02:30:00.000Z",
      issuedAt: "2026-05-28T03:00:00.000Z",
      resultObservationIds: ["observation-001", "observation-002"]
    });
  });

  it("maps report category, order and atomic results to FHIR", () => {
    const diagnosticReport = DiagnosticReport.issue({
      id: "diagnostic-report-002",
      patientId: "patient-001",
      basedOnServiceRequestId: "service-request-001",
      category: "imaging",
      code: {
        system: "http://loinc.org",
        code: "30746-2",
        display: "Chest X-ray report"
      },
      effectiveAt: "2026-05-28T02:30:00.000Z",
      resultObservationIds: ["observation-001"],
      conclusion: "Không thấy tổn thương cấp tính."
    });

    expect(mapDiagnosticReportToFhir(diagnosticReport)).toMatchObject({
      resourceType: "DiagnosticReport",
      basedOn: [{ reference: "ServiceRequest/service-request-001" }],
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v2-0074",
              code: "RAD",
              display: "Radiology"
            }
          ]
        }
      ],
      result: [{ reference: "Observation/observation-001" }]
    });
  });

  it("rejects reports without atomic results, conclusion or attachment", () => {
    expect(() =>
      DiagnosticReport.issue({
        id: "diagnostic-report-003",
        patientId: "patient-001",
        category: "laboratory",
        code: {
          system: "http://loinc.org",
          code: "58410-2",
          display: "Complete blood count panel"
        },
        effectiveAt: "2026-05-28T02:30:00.000Z",
        resultObservationIds: []
      })
    ).toThrow(DomainError);
  });

  it("rejects invalid effective date", () => {
    expect(() =>
      DiagnosticReport.issue({
        id: "diagnostic-report-004",
        patientId: "patient-001",
        category: "pathology",
        code: {
          system: "http://loinc.org",
          code: "60568-3",
          display: "Pathology report"
        },
        effectiveAt: "not-a-date",
        conclusion: "Cần kiểm tra lại."
      })
    ).toThrow(DomainError);
  });

  it("rejects reports issued before their effective time", () => {
    expect(() =>
      DiagnosticReport.issue({
        id: "diagnostic-report-invalid-timeline-001",
        patientId: "patient-001",
        category: "laboratory",
        code: {
          system: "http://loinc.org",
          code: "58410-2",
          display: "Complete blood count panel"
        },
        effectiveAt: "2026-05-28T03:00:00.000Z",
        issuedAt: "2026-05-28T02:59:59.000Z",
        resultObservationIds: ["observation-001"]
      })
    ).toThrow(DomainError);
  });

  it("rejects invalid rehydrated diagnostic report metadata", () => {
    const snapshot = DiagnosticReport.issue({
      id: "diagnostic-report-005",
      patientId: "patient-001",
      encounterId: "encounter-001",
      basedOnServiceRequestId: "service-request-001",
      category: "laboratory",
      code: {
        system: "http://loinc.org",
        code: "58410-2",
        display: "Complete blood count panel"
      },
      effectiveAt: "2026-05-28T02:30:00.000Z",
      issuedAt: "2026-05-28T03:00:00.000Z",
      resultObservationIds: ["observation-001"],
      conclusion: "Within expected range for the clinical context."
    }).toSnapshot();

    expect(() =>
      DiagnosticReport.rehydrate({
        ...snapshot,
        status: "signed" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      DiagnosticReport.rehydrate({
        ...snapshot,
        category: "microbiology" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      DiagnosticReport.rehydrate({
        ...snapshot,
        code: {
          ...snapshot.code,
          code: " "
        }
      })
    ).toThrow(DomainError);

    expect(() =>
      DiagnosticReport.rehydrate({
        ...snapshot,
        effectiveAt: "not-a-date"
      })
    ).toThrow(DomainError);

    expect(() =>
      DiagnosticReport.rehydrate({
        ...snapshot,
        resultObservationIds: [],
        conclusion: " ",
        presentedFormUrl: undefined
      })
    ).toThrow(DomainError);

    expect(() =>
      DiagnosticReport.rehydrate({
        ...snapshot,
        presentedFormUrl: undefined,
        presentedFormTitle: "Signed PDF"
      })
    ).toThrow(DomainError);

    expect(() =>
      DiagnosticReport.rehydrate({
        ...snapshot,
        patientId: " "
      })
    ).toThrow(DomainError);

    expect(() =>
      DiagnosticReport.rehydrate({
        ...snapshot,
        createdAt: "not-a-date"
      })
    ).toThrow(DomainError);

    expect(() =>
      DiagnosticReport.rehydrate({
        ...snapshot,
        issuedAt: "2026-05-28T02:29:59.000Z"
      })
    ).toThrow(DomainError);

    expect(() =>
      DiagnosticReport.rehydrate({
        ...snapshot,
        updatedAt: "1999-01-01T00:00:00.000Z"
      })
    ).toThrow(DomainError);
  });
});
