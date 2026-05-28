import { afterEach, describe, expect, it } from "vitest";
import {
  Consent,
  Patient,
  RecordTransfer,
  RecordTransferDeliveryAttempt
} from "@benh-vien-so/domain";
import { InMemoryAllergyIntoleranceRepository } from "../allergy-intolerances/in-memory-allergy-intolerance.repository.js";
import { InMemoryAuditEventRepository } from "../audit-events/in-memory-audit-event.repository.js";
import { InMemoryClinicalDocumentRepository } from "../clinical-documents/in-memory-clinical-document.repository.js";
import { InMemoryConditionRepository } from "../conditions/in-memory-condition.repository.js";
import { InMemoryConsentRepository } from "../consents/in-memory-consent.repository.js";
import { InMemoryDiagnosticReportRepository } from "../diagnostic-reports/in-memory-diagnostic-report.repository.js";
import { InMemoryEncounterRepository } from "../encounters/in-memory-encounter.repository.js";
import { InMemoryImagingStudyRepository } from "../imaging-studies/in-memory-imaging-study.repository.js";
import { InMemoryMedicationAdministrationRepository } from "../medication-administrations/in-memory-medication-administration.repository.js";
import { InMemoryMedicationDispenseRepository } from "../medication-dispenses/in-memory-medication-dispense.repository.js";
import { InMemoryMedicationRequestRepository } from "../medication-requests/in-memory-medication-request.repository.js";
import { InMemoryObservationRepository } from "../observations/in-memory-observation.repository.js";
import { InMemoryPatientRepository } from "../patients/in-memory-patient.repository.js";
import { InMemoryProcedureRepository } from "../procedures/in-memory-procedure.repository.js";
import { InMemoryProviderDirectoryRepository } from "../provider-directory/in-memory-provider-directory.repository.js";
import { InMemoryRecordTransferRepository } from "../record-transfers/in-memory-record-transfer.repository.js";
import { InMemoryServiceRequestRepository } from "../service-requests/in-memory-service-request.repository.js";
import { InMemoryWorkflowTaskRepository } from "../workflow-tasks/in-memory-workflow-task.repository.js";
import { InMemoryRecordTransferDeliveryAttemptRepository } from "./in-memory-record-transfer-delivery-attempt.repository.js";
import { processQueuedRecordTransferDeliveries } from "./record-transfer-delivery-worker.js";
import type {
  RecordTransferDeliveryWorkerDependencies,
  RecordTransferFhirBundleSendInput
} from "./record-transfer-delivery-worker.js";

const originalNodeEnv = process.env.NODE_ENV;

describe("record transfer delivery worker", () => {
  afterEach(() => {
    restoreEnv("NODE_ENV", originalNodeEnv);
  });

  it("posts a queued FHIR Bundle and marks the delivery attempt as succeeded", async () => {
    const sentBundles: RecordTransferFhirBundleSendInput[] = [];
    const dependencies = await createDeliveryWorkerDependencies({
      sender: {
        async send(input) {
          sentBundles.push(input);
          return {
            httpStatus: 201,
            responseBodyPreview: '{"resourceType":"OperationOutcome"}'
          };
        }
      }
    });

    const result = await processQueuedRecordTransferDeliveries(dependencies, {
      checkedAt: new Date("2026-05-28T07:00:05.000Z"),
      actorId: "system:test-delivery-worker"
    });

    expect(result).toMatchObject({
      status: "ok",
      queuedCount: 1,
      deliveredCount: 1,
      failedCount: 0,
      deliveredAttemptIds: ["record-transfer-delivery-worker-001"]
    });
    expect(sentBundles).toHaveLength(1);
    expect(sentBundles[0]?.bundle).toMatchObject({
      resourceType: "Bundle",
      id: "patient-document-patient-worker-001",
      type: "document"
    });

    const attempts = await dependencies.deliveryAttemptRepository.findByRecordTransferId(
      "record-transfer-worker-001"
    );
    expect(attempts[0]?.toSnapshot()).toMatchObject({
      status: "succeeded",
      completedAt: "2026-05-28T07:00:05.000Z",
      httpStatus: 201,
      responseBodyPreview: '{"resourceType":"OperationOutcome"}'
    });

    const transfer = await dependencies.recordTransferRepository.findById(
      "record-transfer-worker-001"
    );
    expect(transfer?.toSnapshot()).toMatchObject({
      status: "in-progress",
      sentAt: "2026-05-28T07:00:00.000Z"
    });

    const auditEvents = await dependencies.auditRepository.findByPatientId(
      "patient-worker-001"
    );
    expect(auditEvents[0]?.toSnapshot()).toMatchObject({
      actorId: "system:test-delivery-worker",
      action: "record-transfer.send",
      purposeOfUse: "OPERATIONS",
      metadata: expect.objectContaining({
        worker: "record-transfer-delivery-worker",
        deliveryStatus: "succeeded",
        httpStatus: 201,
        idempotencyKey: "wiiicare-record-transfer-worker-key"
      })
    });
  });

  it("marks the attempt and record transfer as failed when the endpoint rejects the Bundle", async () => {
    const dependencies = await createDeliveryWorkerDependencies({
      sender: {
        async send() {
          return {
            httpStatus: 503,
            responseBodyPreview: "Service unavailable"
          };
        }
      }
    });

    const result = await processQueuedRecordTransferDeliveries(dependencies, {
      checkedAt: new Date("2026-05-28T07:00:05.000Z"),
      retryDelayMs: 120_000,
      actorId: "system:test-delivery-worker"
    });

    expect(result).toMatchObject({
      queuedCount: 1,
      deliveredCount: 0,
      failedCount: 1,
      failedAttemptIds: ["record-transfer-delivery-worker-001"]
    });

    const attempts = await dependencies.deliveryAttemptRepository.findByRecordTransferId(
      "record-transfer-worker-001"
    );
    expect(attempts[0]?.toSnapshot()).toMatchObject({
      status: "failed",
      completedAt: "2026-05-28T07:00:05.000Z",
      httpStatus: 503,
      responseBodyPreview: "Service unavailable",
      errorMessage: "FHIR endpoint returned HTTP 503."
    });

    const transfer = await dependencies.recordTransferRepository.findById(
      "record-transfer-worker-001"
    );
    expect(transfer?.toSnapshot()).toMatchObject({
      status: "failed",
      failedAt: "2026-05-28T07:00:05.000Z",
      failureReason: "FHIR endpoint returned HTTP 503.",
      nextRetryAt: "2026-05-28T07:02:05.000Z"
    });

    const auditEvents = await dependencies.auditRepository.findByPatientId(
      "patient-worker-001"
    );
    expect(auditEvents[0]?.toSnapshot()).toMatchObject({
      action: "record-transfer.fail",
      purposeOfUse: "OPERATIONS",
      metadata: expect.objectContaining({
        worker: "record-transfer-delivery-worker",
        deliveryStatus: "failed",
        httpStatus: 503,
        nextRetryAt: "2026-05-28T07:02:05.000Z"
      })
    });
  });

  it("does not call the sender when production endpoint policy rejects the target endpoint", async () => {
    process.env.NODE_ENV = "production";
    let senderCalled = false;
    const dependencies = await createDeliveryWorkerDependencies({
      targetEndpointAddress: "http://localhost:8090/fhir",
      sender: {
        async send() {
          senderCalled = true;
          return {
            httpStatus: 200
          };
        }
      }
    });

    const result = await processQueuedRecordTransferDeliveries(dependencies, {
      checkedAt: new Date("2026-05-28T07:00:05.000Z"),
      retryDelayMs: 120_000,
      actorId: "system:test-delivery-worker"
    });

    expect(senderCalled).toBe(false);
    expect(result).toMatchObject({
      queuedCount: 1,
      deliveredCount: 0,
      failedCount: 1,
      failedAttemptIds: ["record-transfer-delivery-worker-001"]
    });

    const attempts = await dependencies.deliveryAttemptRepository.findByRecordTransferId(
      "record-transfer-worker-001"
    );
    expect(attempts[0]?.toSnapshot()).toMatchObject({
      status: "failed",
      completedAt: "2026-05-28T07:00:05.000Z",
      errorMessage:
        "Trong production, endpoint FHIR nhận hồ sơ bệnh án phải dùng HTTPS."
    });

    const transfer = await dependencies.recordTransferRepository.findById(
      "record-transfer-worker-001"
    );
    expect(transfer?.toSnapshot()).toMatchObject({
      status: "failed",
      failedAt: "2026-05-28T07:00:05.000Z",
      failureReason:
        "Trong production, endpoint FHIR nhận hồ sơ bệnh án phải dùng HTTPS.",
      nextRetryAt: "2026-05-28T07:02:05.000Z"
    });

    const auditEvents = await dependencies.auditRepository.findByPatientId(
      "patient-worker-001"
    );
    expect(auditEvents[0]?.toSnapshot()).toMatchObject({
      action: "record-transfer.fail",
      purposeOfUse: "OPERATIONS",
      metadata: expect.objectContaining({
        worker: "record-transfer-delivery-worker",
        deliveryStatus: "failed",
        errorMessage:
          "Trong production, endpoint FHIR nhận hồ sơ bệnh án phải dùng HTTPS."
      })
    });
  });
});

async function createDeliveryWorkerDependencies(input: {
  readonly sender: RecordTransferDeliveryWorkerDependencies["sender"];
  readonly targetEndpointAddress?: string;
}): Promise<RecordTransferDeliveryWorkerDependencies> {
  const recordTransfer = RecordTransfer.create({
    id: "record-transfer-worker-001",
    patientId: "patient-worker-001",
    status: "in-progress",
    priority: "urgent",
    bundleType: "document",
    bundleId: "patient-document-patient-worker-001",
    sourceOrganizationId: "hospital-hai-phong-demo",
    recipientOrganizationId: "hospital-hai-phong-referral",
    consentReference: "consent-worker-001",
    requestedByActorId: "practitioner-demo-001",
    reason: "Chuyển hồ sơ để tiếp tục điều trị.",
    requestedAt: "2026-05-28T06:55:00.000Z",
    sentAt: "2026-05-28T07:00:00.000Z"
  });
  const deliveryAttempt = RecordTransferDeliveryAttempt.queue({
    id: "record-transfer-delivery-worker-001",
    recordTransferId: recordTransfer.id,
    patientId: recordTransfer.patientId,
    targetEndpointId: "endpoint-fhir-hai-phong-referral",
    targetEndpointAddress:
      input.targetEndpointAddress ?? "https://fhir.referral.demo.wiiicare.vn/fhir",
    bundleId: "patient-document-patient-worker-001",
    bundleType: "document",
    idempotencyKey: "wiiicare-record-transfer-worker-key",
    attemptNumber: 1,
    queuedAt: "2026-05-28T07:00:00.000Z"
  });
  const deliveryAttemptRepository =
    new InMemoryRecordTransferDeliveryAttemptRepository();
  await deliveryAttemptRepository.save(deliveryAttempt);

  return {
    patientRepository: new InMemoryPatientRepository([
      Patient.register({
        id: "patient-worker-001",
        identifiers: [
          {
            system: "urn:benh-vien-so:mrn",
            value: "MRN-WORKER-001",
            type: "hospital-mrn"
          }
        ],
        fullName: "Nguyễn Văn Worker",
        birthDate: "1988-04-12",
        gender: "male",
        managingOrganizationId: "hospital-hai-phong-demo"
      })
    ]),
    encounterRepository: new InMemoryEncounterRepository(),
    allergyIntoleranceRepository: new InMemoryAllergyIntoleranceRepository(),
    clinicalDocumentRepository: new InMemoryClinicalDocumentRepository(),
    conditionRepository: new InMemoryConditionRepository(),
    observationRepository: new InMemoryObservationRepository(),
    diagnosticReportRepository: new InMemoryDiagnosticReportRepository(),
    imagingStudyRepository: new InMemoryImagingStudyRepository(),
    medicationRequestRepository: new InMemoryMedicationRequestRepository(),
    medicationDispenseRepository: new InMemoryMedicationDispenseRepository(),
    medicationAdministrationRepository: new InMemoryMedicationAdministrationRepository(),
    serviceRequestRepository: new InMemoryServiceRequestRepository(),
    workflowTaskRepository: new InMemoryWorkflowTaskRepository(),
    procedureRepository: new InMemoryProcedureRepository(),
    consentRepository: new InMemoryConsentRepository([
      Consent.grant({
        id: "consent-worker-001",
        patientId: "patient-worker-001",
        category: "record-sharing",
        granteeOrganizationId: "hospital-hai-phong-referral",
        grantorActorId: "practitioner-demo-001",
        validFrom: "2026-05-28T00:00:00.000Z",
        validUntil: "2026-12-31T23:59:59.000Z"
      })
    ]),
    providerDirectoryRepository: new InMemoryProviderDirectoryRepository(),
    recordTransferRepository: new InMemoryRecordTransferRepository([recordTransfer]),
    deliveryAttemptRepository,
    auditRepository: new InMemoryAuditEventRepository(),
    sender: input.sender
  };
}

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
