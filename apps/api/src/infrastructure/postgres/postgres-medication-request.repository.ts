import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import type {
  MedicationRequest,
  MedicationRequestRepository,
} from "@benh-vien-so/domain";
import { rowToMedicationRequest } from "./postgres-medication-request.mapper.js";
import { upsertMedicationRequest } from "./postgres-medication-request.persistence.js";
import { selectMedicationRequestSql } from "./postgres-medication-request.sql.js";
import type { MedicationRequestRow } from "./postgres-medication-request.types.js";

export class PostgresMedicationRequestRepository implements MedicationRequestRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByPatientId(patientId: string): Promise<MedicationRequest[]> {
    const result = await this.pool.query<MedicationRequestRow>(
      `${selectMedicationRequestSql}
      WHERE patient_id = $1
      ORDER BY authored_on DESC`,
      [patientId]
    );

    return result.rows.map(rowToMedicationRequest);
  }

  async findById(id: string): Promise<MedicationRequest | undefined> {
    const result = await this.pool.query<MedicationRequestRow>(
      `${selectMedicationRequestSql}
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToMedicationRequest(row) : undefined;
  }

  async save(medicationRequest: MedicationRequest): Promise<void> {
    await upsertMedicationRequest(this.pool, medicationRequest);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export async function seedMedicationRequestsIfEmpty(
  repository: MedicationRequestRepository,
  seedMedicationRequests: readonly MedicationRequest[]
): Promise<void> {
  const firstPatientId = seedMedicationRequests[0]?.patientId;

  if (!firstPatientId) {
    return;
  }

  const medicationRequests = await repository.findByPatientId(firstPatientId);

  if (medicationRequests.length > 0) {
    return;
  }

  for (const medicationRequest of seedMedicationRequests) {
    await repository.save(medicationRequest);
  }
}
