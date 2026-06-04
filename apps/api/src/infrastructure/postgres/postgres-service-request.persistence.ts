import type pg from "pg";
import type { ServiceRequest } from "@benh-vien-so/domain";
import { serviceRequestToUpsertValues } from "./postgres-service-request.mapper.js";
import { upsertServiceRequestSql } from "./postgres-service-request.sql.js";

export async function upsertServiceRequest(
  queryable: Pick<pg.Pool | pg.PoolClient, "query">,
  serviceRequest: ServiceRequest
): Promise<void> {
  await queryable.query(
    upsertServiceRequestSql,
    serviceRequestToUpsertValues(serviceRequest)
  );
}
