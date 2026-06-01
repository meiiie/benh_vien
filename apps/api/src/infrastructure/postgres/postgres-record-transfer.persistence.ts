import type { RecordTransfer } from "@benh-vien-so/domain";
import { recordTransferToUpsertValues } from "./postgres-record-transfer.mapper.js";
import { upsertRecordTransferSql } from "./postgres-record-transfer.sql.js";
import type { PostgresQueryable } from "./postgres-record-transfer.types.js";

export async function upsertRecordTransfer(
  queryable: PostgresQueryable,
  recordTransfer: RecordTransfer
): Promise<void> {
  await queryable.query(upsertRecordTransferSql, recordTransferToUpsertValues(recordTransfer));
}
