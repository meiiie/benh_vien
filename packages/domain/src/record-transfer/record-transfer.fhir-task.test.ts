import { describe, expect, it } from "vitest";
import { mapRecordTransferToFhirTask } from "../fhir/map-record-transfer-to-fhir-task.js";
import { RecordTransfer } from "./record-transfer.js";

describe("RecordTransfer FHIR Task mapping", () => {
  it("exports acknowledgement details as Task notes after a transfer is received", () => {
    const transfer = createRecordTransfer("record-transfer-fhir-task-001");

    transfer.markSent({
      sentAt: "2026-05-28T02:30:00.000Z"
    });
    transfer.markReceived({
      receivedAt: "2026-05-28T02:45:00.000Z",
      receivedByActorId: "practitioner-recipient-001",
      acknowledgementReference: "ack-record-transfer-fhir-task-001",
      note: "Bệnh viện nhận đã xác nhận gói hồ sơ."
    });

    const task = mapRecordTransferToFhirTask(transfer);

    expect(task).toMatchObject({
      resourceType: "Task",
      status: "completed",
      focus: {
        reference: "Bundle/patient-document-patient-test-001"
      },
      for: {
        reference: "Patient/patient-test-001"
      },
      requester: {
        reference: "Organization/hospital-source"
      },
      owner: {
        reference: "Organization/hospital-recipient"
      }
    });
    expect(task.note?.map((note) => note.text)).toEqual([
      "Bệnh viện nhận đã xác nhận gói hồ sơ.",
      "Người xác nhận nhận hồ sơ: practitioner-recipient-001",
      "Biên nhận tiếp nhận: ack-record-transfer-fhir-task-001"
    ]);
  });

  it("preserves failed and dead-lettered transfer details in Task businessStatus and notes", () => {
    const transfer = createRecordTransfer("record-transfer-fhir-task-002");

    transfer.markSent({
      sentAt: "2026-05-28T02:30:00.000Z"
    });
    transfer.markFailed({
      failedAt: "2026-05-28T02:35:00.000Z",
      failureReason: "Gateway bệnh viện nhận tạm thời không phản hồi.",
      nextRetryAt: "2026-05-28T02:50:00.000Z"
    });
    transfer.markDeadLettered({
      deadLetteredAt: "2026-05-28T03:10:00.000Z",
      note: "Đã vượt quá số lần thử gửi tự động."
    });

    const task = mapRecordTransferToFhirTask(transfer);

    expect(task.status).toBe("failed");
    expect(task.businessStatus).toMatchObject({
      coding: [
        {
          code: "dead-lettered",
          display: "Đã đưa vào hàng lỗi cuối"
        }
      ],
      text: "Đã đưa vào hàng lỗi cuối"
    });
    expect(task.note?.map((note) => note.text)).toEqual([
      "Đã vượt quá số lần thử gửi tự động.",
      "Lý do lỗi chuyển hồ sơ: Gateway bệnh viện nhận tạm thời không phản hồi.",
      "Thời điểm lỗi: 2026-05-28T02:35:00.000Z",
      "Đưa vào hàng lỗi cuối lúc: 2026-05-28T03:10:00.000Z"
    ]);
  });
});

function createRecordTransfer(id: string): RecordTransfer {
  return RecordTransfer.create({
    id,
    patientId: "patient-test-001",
    bundleType: "document",
    bundleId: "patient-document-patient-test-001",
    sourceOrganizationId: "hospital-source",
    recipientOrganizationId: "hospital-recipient",
    consentReference: "consent-test-001",
    requestedByActorId: "practitioner-test-001",
    reason: "Chuyển hồ sơ để hội chẩn chuyên khoa.",
    requestedAt: "2026-05-28T02:00:00.000Z"
  });
}
