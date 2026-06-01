import type { RecordTransferDeliveryAttempt } from "@benh-vien-so/domain";
import { recordTransferDeliveryAttemptToUpsertValues } from "./postgres-record-transfer-delivery-attempt.mapper.js";
import { upsertRecordTransferDeliveryAttemptSql } from "./postgres-record-transfer-delivery-attempt.sql.js";
import type { PostgresRecordTransferDeliveryAttemptQueryable } from "./postgres-record-transfer-delivery-attempt.types.js";

export async function upsertRecordTransferDeliveryAttempt(
  queryable: PostgresRecordTransferDeliveryAttemptQueryable,
  attempt: RecordTransferDeliveryAttempt
): Promise<void> {
  await queryable.query(
    upsertRecordTransferDeliveryAttemptSql,
    recordTransferDeliveryAttemptToUpsertValues(attempt)
  );
}
