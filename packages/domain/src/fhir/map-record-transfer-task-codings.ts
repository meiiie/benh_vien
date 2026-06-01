import type {
  RecordTransferBundleType,
  RecordTransferStatus
} from "../record-transfer/record-transfer.types.js";
import type { FhirTask } from "./fhir-types.js";

export const recordTransferTaskProfile = "http://hl7.org/fhir/StructureDefinition/Task";
export const recordTransferIdentifierSystem = "urn:wiiicare:nexus:record-transfer";

export function mapRecordTransferStatus(status: RecordTransferStatus): FhirTask["status"] {
  if (status === "ready") {
    return "ready";
  }

  if (status === "completed") {
    return "completed";
  }

  if (status === "cancelled") {
    return "cancelled";
  }

  if (status === "failed" || status === "dead-lettered") {
    return "failed";
  }

  return status;
}

export function buildRecordTransferBusinessStatus(
  status: RecordTransferStatus
): NonNullable<FhirTask["businessStatus"]> {
  const display = formatRecordTransferStatus(status);

  return {
    coding: [
      {
        system: "urn:wiiicare:nexus:record-transfer-status",
        code: status,
        display
      }
    ],
    text: display
  };
}

export function buildRecordTransferCode(): NonNullable<FhirTask["code"]> {
  return {
    coding: [
      {
        system: "urn:wiiicare:nexus:task-code",
        code: "inter-facility-record-transfer",
        display: "Chuyển hồ sơ bệnh án liên viện"
      }
    ],
    text: "Chuyển hồ sơ bệnh án liên viện"
  };
}

export function formatRecordTransferBundleOutput(
  bundleType: RecordTransferBundleType
): string {
  return bundleType === "document"
    ? "FHIR document Bundle dự kiến chuyển"
    : "FHIR collection Bundle dự kiến chuyển";
}

export function formatRecordTransferStatus(status: RecordTransferStatus): string {
  const labels: Record<RecordTransferStatus, string> = {
    cancelled: "Đã hủy",
    completed: "Đã hoàn tất",
    "dead-lettered": "Đã đưa vào hàng lỗi cuối",
    draft: "Bản nháp",
    failed: "Lỗi chuyển hồ sơ",
    "in-progress": "Đang xử lý",
    ready: "Sẵn sàng gửi",
    requested: "Đã yêu cầu"
  };

  return labels[status];
}
