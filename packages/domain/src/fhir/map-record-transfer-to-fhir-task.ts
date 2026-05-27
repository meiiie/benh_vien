import type { RecordTransfer } from "../record-transfer/record-transfer.js";
import type { FhirTask } from "./fhir-types.js";

export function mapRecordTransferToFhirTask(recordTransfer: RecordTransfer): FhirTask {
  const snapshot = recordTransfer.toSnapshot();

  return {
    resourceType: "Task",
    id: snapshot.id,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Task"]
    },
    identifier: [
      {
        system: "urn:wiiicare:nexus:record-transfer",
        value: snapshot.id
      }
    ],
    status: mapRecordTransferStatus(snapshot.status),
    businessStatus: {
      coding: [
        {
          system: "urn:wiiicare:nexus:record-transfer-status",
          code: snapshot.status,
          display: formatRecordTransferStatus(snapshot.status)
        }
      ],
      text: formatRecordTransferStatus(snapshot.status)
    },
    intent: "order",
    priority: snapshot.priority,
    code: {
      coding: [
        {
          system: "urn:wiiicare:nexus:task-code",
          code: "inter-facility-record-transfer",
          display: "Chuyển hồ sơ bệnh án liên viện"
        }
      ],
      text: "Chuyển hồ sơ bệnh án liên viện"
    },
    description: snapshot.reason,
    focus: {
      reference: `Bundle/${snapshot.bundleId}`
    },
    for: {
      reference: `Patient/${snapshot.patientId}`
    },
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
          text:
            snapshot.bundleType === "document"
              ? "FHIR document Bundle dự kiến chuyển"
              : "FHIR collection Bundle dự kiến chuyển"
        },
        valueReference: {
          reference: `Bundle/${snapshot.bundleId}`,
          display: snapshot.bundleId
        }
      }
    ],
    note: snapshot.note ? [{ text: snapshot.note }] : undefined
  };
}

function mapRecordTransferStatus(
  status: ReturnType<RecordTransfer["toSnapshot"]>["status"]
): FhirTask["status"] {
  if (status === "ready") {
    return "ready";
  }

  if (status === "completed") {
    return "completed";
  }

  if (status === "cancelled") {
    return "cancelled";
  }

  if (status === "failed") {
    return "failed";
  }

  return status;
}

function formatRecordTransferStatus(
  status: ReturnType<RecordTransfer["toSnapshot"]>["status"]
): string {
  const labels: Record<ReturnType<RecordTransfer["toSnapshot"]>["status"], string> = {
    cancelled: "Đã hủy",
    completed: "Đã hoàn tất",
    draft: "Bản nháp",
    failed: "Lỗi chuyển hồ sơ",
    "in-progress": "Đang xử lý",
    ready: "Sẵn sàng gửi",
    requested: "Đã yêu cầu"
  };

  return labels[status];
}
