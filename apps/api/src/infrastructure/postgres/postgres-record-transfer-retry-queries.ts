import type {
  FindDueRecordTransferRetriesInput,
  RecordTransfer
} from "@benh-vien-so/domain";
import { rowToRecordTransfer } from "./postgres-record-transfer.mapper.js";
import { selectRecordTransferSql } from "./postgres-record-transfer.sql.js";
import type {
  PostgresQueryable,
  RecordTransferRow
} from "./postgres-record-transfer.types.js";

type RetryComparisonOperator = "<" | ">=";

export async function findDueRecordTransferRetries(
  queryable: PostgresQueryable,
  input: FindDueRecordTransferRetriesInput
): Promise<RecordTransfer[]> {
  return findDueRecordTransfers(queryable, input, "<");
}

export async function findDueRecordTransferDeadLetters(
  queryable: PostgresQueryable,
  input: FindDueRecordTransferRetriesInput
): Promise<RecordTransfer[]> {
  return findDueRecordTransfers(queryable, input, ">=");
}

async function findDueRecordTransfers(
  queryable: PostgresQueryable,
  input: FindDueRecordTransferRetriesInput,
  retryComparisonOperator: RetryComparisonOperator
): Promise<RecordTransfer[]> {
  const limit = normalizeLimit(input.limit);

  if (limit === 0) {
    return [];
  }

  const result = await queryable.query<RecordTransferRow>(
    `${selectRecordTransferSql}
      WHERE status = 'failed'
        AND next_retry_at IS NOT NULL
        AND next_retry_at <= $1
        AND retry_count ${retryComparisonOperator} $2
      ORDER BY next_retry_at ASC, requested_at ASC
      LIMIT $3`,
    [input.dueAt, input.maxRetryCount ?? 2147483647, limit]
  );

  return result.rows.map(rowToRecordTransfer);
}

function normalizeLimit(limit: number): number {
  if (!Number.isInteger(limit) || limit < 1) {
    return 0;
  }

  return limit;
}
