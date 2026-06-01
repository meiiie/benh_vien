import type { RecordTransfer } from "../record-transfer/record-transfer.js";
import type { FhirTask } from "./fhir-types.js";
import {
  buildRecordTransferBusinessStatus,
  buildRecordTransferCode,
  formatRecordTransferBundleOutput,
  mapRecordTransferStatus,
  recordTransferIdentifierSystem,
  recordTransferTaskProfile
} from "./map-record-transfer-task-codings.js";

export function mapRecordTransferToFhirTask(recordTransfer: RecordTransfer): FhirTask {
  const snapshot = recordTransfer.toSnapshot();

  return {
    resourceType: "Task",
    id: snapshot.id,
    meta: {
      profile: [recordTransferTaskProfile]
    },
    identifier: [
      {
        system: recordTransferIdentifierSystem,
        value: snapshot.id
      }
    ],
    status: mapRecordTransferStatus(snapshot.status),
    businessStatus: buildRecordTransferBusinessStatus(snapshot.status),
    intent: "order",
    priority: snapshot.priority,
    code: buildRecordTransferCode(),
    description: snapshot.reason,
    focus: {
      reference: `Bundle/${snapshot.bundleId}`
    },
    for: {
      reference: `Patient/${snapshot.patientId}`
    },
    executionPeriod:
      snapshot.sentAt || snapshot.receivedAt
        ? {
            start: snapshot.sentAt,
            end: snapshot.receivedAt
          }
        : undefined,
    authoredOn: snapshot.requestedAt,
    lastModified: snapshot.updatedAt,
    requester: {
      reference: `Organization/${snapshot.sourceOrganizationId}`
    },
    owner: {
      reference: `Organization/${snapshot.recipientOrganizationId}`
    },
    input: [
      {
        type: {
          text: "Consent dùng để chia sẻ hồ sơ"
        },
        valueReference: {
          reference: `Consent/${snapshot.consentReference}`,
          display: snapshot.consentReference
        }
      }
    ],
    output: [
      {
        type: {
          text: formatRecordTransferBundleOutput(snapshot.bundleType)
        },
        valueReference: {
          reference: `Bundle/${snapshot.bundleId}`,
          display: snapshot.bundleId
        }
      }
    ],
    note: buildRecordTransferNotes(snapshot)
  };
}

function buildRecordTransferNotes(
  snapshot: ReturnType<RecordTransfer["toSnapshot"]>
): FhirTask["note"] {
  const notes = [
    snapshot.note,
    snapshot.receivedByActorId
      ? `Người xác nhận nhận hồ sơ: ${snapshot.receivedByActorId}`
      : undefined,
    snapshot.acknowledgementReference
      ? `Biên nhận tiếp nhận: ${snapshot.acknowledgementReference}`
      : undefined,
    snapshot.failureReason
      ? `Lý do lỗi chuyển hồ sơ: ${snapshot.failureReason}`
      : undefined,
    snapshot.failedAt ? `Thời điểm lỗi: ${snapshot.failedAt}` : undefined,
    snapshot.nextRetryAt ? `Hẹn thử gửi lại: ${snapshot.nextRetryAt}` : undefined,
    snapshot.retryCount > 0 ? `Số lần thử gửi lại: ${snapshot.retryCount}` : undefined,
    snapshot.deadLetteredAt
      ? `Đưa vào hàng lỗi cuối lúc: ${snapshot.deadLetteredAt}`
      : undefined
  ].filter((note): note is string => Boolean(note));

  return notes.length > 0 ? notes.map((text) => ({ text })) : undefined;
}
