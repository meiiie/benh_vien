import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import type {
  ServiceRequest,
  ServiceRequestRepository,
} from "@benh-vien-so/domain";
import { rowToServiceRequest } from "./postgres-service-request.mapper.js";
import { upsertServiceRequest } from "./postgres-service-request.persistence.js";
import { selectServiceRequestSql } from "./postgres-service-request.sql.js";
import type { ServiceRequestRow } from "./postgres-service-request.types.js";

export class PostgresServiceRequestRepository implements ServiceRequestRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByPatientId(patientId: string): Promise<ServiceRequest[]> {
    const result = await this.pool.query<ServiceRequestRow>(
      `${selectServiceRequestSql}
      WHERE patient_id = $1
      ORDER BY authored_on DESC`,
      [patientId]
    );

    return result.rows.map(rowToServiceRequest);
  }

  async findById(id: string): Promise<ServiceRequest | undefined> {
    const result = await this.pool.query<ServiceRequestRow>(
      `${selectServiceRequestSql}
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToServiceRequest(row) : undefined;
  }

  async save(serviceRequest: ServiceRequest): Promise<void> {
    await upsertServiceRequest(this.pool, serviceRequest);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export async function seedServiceRequestsIfEmpty(
  repository: ServiceRequestRepository,
  seedServiceRequests: readonly ServiceRequest[]
): Promise<void> {
  const firstPatientId = seedServiceRequests[0]?.patientId;

  if (!firstPatientId) {
    return;
  }

  const serviceRequests = await repository.findByPatientId(firstPatientId);

  if (serviceRequests.length > 0) {
    return;
  }

  for (const serviceRequest of seedServiceRequests) {
    await repository.save(serviceRequest);
  }
}
