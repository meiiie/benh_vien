import type {
  RecordTransferDeliveryAttemptSnapshot,
  RecordTransferSnapshot
} from "@benh-vien-so/domain";
import { RecordTransfer, RecordTransferDeliveryAttempt } from "@benh-vien-so/domain";

export function buildBundleId(
  patientId: string,
  bundleType: "collection" | "document"
): string {
  return bundleType === "document"
    ? `patient-document-${patientId}`
    : `patient-record-${patientId}`;
}

export function toRecordTransferResponse(
  recordTransfer: RecordTransfer
): RecordTransferSnapshot {
  return recordTransfer.toSnapshot();
}

export function toDeliveryAttemptResponse(
  deliveryAttempt: RecordTransferDeliveryAttempt
): RecordTransferDeliveryAttemptSnapshot {
  return deliveryAttempt.toSnapshot();
}
