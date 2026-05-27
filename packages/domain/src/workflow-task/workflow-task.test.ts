import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
import { mapWorkflowTaskToFhir } from "../fhir/map-workflow-task-to-fhir.js";
import { WorkflowTask } from "./workflow-task.js";

describe("WorkflowTask", () => {
  it("tracks fulfillment of a clinical service request", () => {
    const task = WorkflowTask.create({
      id: "task-test-001",
      patientId: "patient-test-001",
      encounterId: "encounter-test-001",
      basedOnServiceRequestId: "service-request-test-001",
      status: "completed",
      priority: "urgent",
      code: {
        system: "urn:wiiicare:nexus:task-code",
        code: "fulfill-laboratory-order",
        display: "Thực hiện chỉ định xét nghiệm"
      },
      businessStatus: {
        code: "result-issued",
        display: "Kết quả đã phát hành"
      },
      requesterPractitionerId: "practitioner-test-001",
      ownerOrganizationId: "department-laboratory",
      authoredOn: "2026-05-27T03:40:00.000Z",
      lastModified: "2026-05-27T04:45:00.000Z",
      executionPeriod: {
        start: "2026-05-27T04:00:00.000Z",
        end: "2026-05-27T04:45:00.000Z"
      },
      inputReferences: [
        {
          resourceType: "ServiceRequest",
          id: "service-request-test-001",
          label: "CBC order"
        }
      ],
      outputReferences: [
        {
          resourceType: "DiagnosticReport",
          id: "diagnostic-report-test-001",
          label: "CBC report"
        }
      ]
    });

    expect(task.toSnapshot()).toMatchObject({
      patientId: "patient-test-001",
      status: "completed",
      intent: "order",
      ownerOrganizationId: "department-laboratory"
    });
  });

  it("exports a FHIR Task linked back to the original ServiceRequest", () => {
    const task = WorkflowTask.create({
      id: "task-test-002",
      patientId: "patient-test-001",
      basedOnServiceRequestId: "service-request-test-001",
      status: "accepted",
      code: {
        system: "urn:wiiicare:nexus:task-code",
        code: "fulfill-imaging-order",
        display: "Thực hiện chỉ định chẩn đoán hình ảnh"
      },
      inputReferences: [],
      outputReferences: []
    });

    expect(mapWorkflowTaskToFhir(task)).toMatchObject({
      resourceType: "Task",
      id: "task-test-002",
      status: "accepted",
      focus: {
        reference: "ServiceRequest/service-request-test-001"
      },
      for: {
        reference: "Patient/patient-test-001"
      }
    });
  });

  it("rejects completed tasks without traceable outputs", () => {
    expect(() =>
      WorkflowTask.create({
        id: "task-test-003",
        patientId: "patient-test-001",
        status: "completed",
        code: {
          system: "urn:wiiicare:nexus:task-code",
          code: "fulfill-laboratory-order",
          display: "Thực hiện chỉ định xét nghiệm"
        },
        inputReferences: [],
        outputReferences: []
      })
    ).toThrow(DomainError);
  });
});
