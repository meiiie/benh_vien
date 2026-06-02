import type { RecordTransferSnapshot } from "../record-transfer/record-transfer.types.js";
import type { FhirTask } from "./fhir-types.js";

export function buildRecordTransferNotes(snapshot: RecordTransferSnapshot): FhirTask["note"] {
  const notes = [
    snapshot.note,
    snapshot.receivedByActorId
      ? `Người xác nhận nhận hồ sơ: ${snapshot.receivedByActorId}`
      : undefined,
    snapshot.acknowledgementReference
      ? `Biên nhận tiếp nhận: ${snapshot.acknowledgementReference}`
      : undefined,
    snapshot.failureReason ? `Lý do lỗi chuyển hồ sơ: ${snapshot.failureReason}` : undefined,
    snapshot.failedAt ? `Thời điểm lỗi: ${snapshot.failedAt}` : undefined,
    snapshot.nextRetryAt ? `Hẹn thử gửi lại: ${snapshot.nextRetryAt}` : undefined,
    snapshot.retryCount > 0 ? `Số lần thử gửi lại: ${snapshot.retryCount}` : undefined,
    snapshot.deadLetteredAt
      ? `Đưa vào hàng lỗi cuối lúc: ${snapshot.deadLetteredAt}`
      : undefined
  ].filter((note): note is string => Boolean(note));

  return notes.length > 0 ? notes.map((text) => ({ text })) : undefined;
}
