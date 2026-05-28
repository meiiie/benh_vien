import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import { Patient, PatientIdentifierConflictError } from "@benh-vien-so/domain";
import type {
  PatientIdentifier,
  PatientRecordStatus,
  PatientRepository,
  PatientSnapshot
} from "@benh-vien-so/domain";

type PatientRow = {
  id: string;
  identifiers: PatientIdentifier[] | string;
  full_name: string;
  birth_date: string | null;
  gender: PatientSnapshot["gender"];
  address: string | null;
  phone: string | null;
  managing_organization_id: string;
  status: PatientRecordStatus;
  created_at: Date | string;
  updated_at: Date | string;
};

export class PostgresPatientRepository implements PatientRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findAll(): Promise<Patient[]> {
    const result = await this.pool.query<PatientRow>(
      `SELECT
        id,
        identifiers,
        full_name,
        birth_date::text AS birth_date,
        gender,
        address,
        phone,
        managing_organization_id,
        status,
        created_at,
        updated_at
      FROM patients
      ORDER BY created_at DESC`
    );

    return result.rows.map(rowToPatient);
  }

  async findById(id: string): Promise<Patient | undefined> {
    const result = await this.pool.query<PatientRow>(
      `SELECT
        id,
        identifiers,
        full_name,
        birth_date::text AS birth_date,
        gender,
        address,
        phone,
        managing_organization_id,
        status,
        created_at,
        updated_at
      FROM patients
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToPatient(row) : undefined;
  }

  async findByIdentifier(identifier: {
    readonly system: string;
    readonly value: string;
  }): Promise<Patient | undefined> {
    const result = await this.pool.query<PatientRow>(
      `SELECT
        p.id,
        p.identifiers,
        p.full_name,
        p.birth_date::text AS birth_date,
        p.gender,
        p.address,
        p.phone,
        p.managing_organization_id,
        p.status,
        p.created_at,
        p.updated_at
      FROM patients p
      INNER JOIN patient_identifier_index pii ON pii.patient_id = p.id
      WHERE pii.system = $1 AND pii.value = $2
      ORDER BY p.created_at ASC
      LIMIT 1`,
      [identifier.system, identifier.value]
    );

    const row = result.rows[0];
    return row ? rowToPatient(row) : undefined;
  }

  async save(patient: Patient): Promise<void> {
    const snapshot = patient.toSnapshot();
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO patients (
          id,
          identifiers,
          full_name,
          birth_date,
          gender,
          address,
          phone,
          managing_organization_id,
          status,
          created_at,
          updated_at
        )
        VALUES ($1, $2::jsonb, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          identifiers = EXCLUDED.identifiers,
          full_name = EXCLUDED.full_name,
          birth_date = EXCLUDED.birth_date,
          gender = EXCLUDED.gender,
          address = EXCLUDED.address,
          phone = EXCLUDED.phone,
          managing_organization_id = EXCLUDED.managing_organization_id,
          status = EXCLUDED.status,
          updated_at = EXCLUDED.updated_at`,
        [
          snapshot.id,
          JSON.stringify(snapshot.identifiers),
          snapshot.fullName,
          snapshot.birthDate ?? null,
          snapshot.gender,
          snapshot.address ?? null,
          snapshot.phone ?? null,
          snapshot.managingOrganizationId,
          snapshot.status,
          snapshot.createdAt,
          snapshot.updatedAt
        ]
      );

      await client.query("DELETE FROM patient_identifier_index WHERE patient_id = $1", [
        snapshot.id
      ]);

      for (const identifier of snapshot.identifiers) {
        await client.query(
          `INSERT INTO patient_identifier_index (patient_id, system, value, type)
          VALUES ($1, $2, $3, $4)`,
          [snapshot.id, identifier.system, identifier.value, identifier.type]
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);

      if (isUniqueViolation(error)) {
        const conflict = await findConflictingIdentifier(this, snapshot);
        throw new PatientIdentifierConflictError(
          conflict ?? {
            existingPatientId: "unknown",
            identifier: snapshot.identifiers[0]
          }
        );
      }

      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export async function seedPatientsIfEmpty(
  repository: PatientRepository,
  seedPatients: readonly Patient[]
): Promise<void> {
  const patients = await repository.findAll();

  if (patients.length > 0) {
    return;
  }

  for (const patient of seedPatients) {
    await repository.save(patient);
  }
}

function rowToPatient(row: PatientRow): Patient {
  const identifiers =
    typeof row.identifiers === "string"
      ? (JSON.parse(row.identifiers) as PatientIdentifier[])
      : row.identifiers;

  return Patient.rehydrate({
    id: row.id,
    identifiers,
    fullName: row.full_name,
    birthDate: row.birth_date ?? undefined,
    gender: row.gender,
    address: row.address ?? undefined,
    phone: row.phone ?? undefined,
    managingOrganizationId: row.managing_organization_id,
    status: row.status,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  });
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

async function findConflictingIdentifier(
  repository: PostgresPatientRepository,
  snapshot: PatientSnapshot
) {
  for (const identifier of snapshot.identifiers) {
    const existing = await repository.findByIdentifier(identifier);

    if (existing && existing.id !== snapshot.id) {
      return {
        existingPatientId: existing.id,
        identifier
      };
    }
  }

  return undefined;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { readonly code?: string }).code === "23505"
  );
}
