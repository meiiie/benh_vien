import pg from "pg";
import { Consent } from "@benh-vien-so/domain";
import type {
  ConsentCategory,
  ConsentRepository,
  ConsentSnapshot,
  ConsentStatus
} from "@benh-vien-so/domain";

const { Pool } = pg;

type ConsentRow = {
  id: string;
  patient_id: string;
  status: ConsentStatus;
  category: ConsentCategory;
  grantee_organization_id: string;
  grantor_actor_id: string;
  evidence_document_id: string | null;
  valid_from: Date | string;
  valid_until: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export class PostgresConsentRepository implements ConsentRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 10
    });
  }

  async findByPatientId(patientId: string): Promise<Consent[]> {
    const result = await this.pool.query<ConsentRow>(
      `SELECT
        id,
        patient_id,
        status,
        category,
        grantee_organization_id,
        grantor_actor_id,
        evidence_document_id,
        valid_from,
        valid_until,
        created_at,
        updated_at
      FROM consents
      WHERE patient_id = $1
      ORDER BY created_at DESC`,
      [patientId]
    );

    return result.rows.map(rowToConsent);
  }

  async findById(id: string): Promise<Consent | undefined> {
    const result = await this.pool.query<ConsentRow>(
      `SELECT
        id,
        patient_id,
        status,
        category,
        grantee_organization_id,
        grantor_actor_id,
        evidence_document_id,
        valid_from,
        valid_until,
        created_at,
        updated_at
      FROM consents
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToConsent(row) : undefined;
  }

  async save(consent: Consent): Promise<void> {
    const snapshot = consent.toSnapshot();

    await this.pool.query(
      `INSERT INTO consents (
        id,
        patient_id,
        status,
        category,
        grantee_organization_id,
        grantor_actor_id,
        evidence_document_id,
        valid_from,
        valid_until,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        patient_id = EXCLUDED.patient_id,
        status = EXCLUDED.status,
        category = EXCLUDED.category,
        grantee_organization_id = EXCLUDED.grantee_organization_id,
        grantor_actor_id = EXCLUDED.grantor_actor_id,
        evidence_document_id = EXCLUDED.evidence_document_id,
        valid_from = EXCLUDED.valid_from,
        valid_until = EXCLUDED.valid_until,
        updated_at = EXCLUDED.updated_at`,
      [
        snapshot.id,
        snapshot.patientId,
        snapshot.status,
        snapshot.category,
        snapshot.granteeOrganizationId,
        snapshot.grantorActorId,
        snapshot.evidenceDocumentId ?? null,
        snapshot.validFrom,
        snapshot.validUntil ?? null,
        snapshot.createdAt,
        snapshot.updatedAt
      ]
    );
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export async function seedConsentsIfEmpty(
  repository: ConsentRepository,
  seedConsents: readonly Consent[]
): Promise<void> {
  const firstPatientId = seedConsents[0]?.patientId;

  if (!firstPatientId) {
    return;
  }

  const consents = await repository.findByPatientId(firstPatientId);

  if (consents.length > 0) {
    return;
  }

  for (const consent of seedConsents) {
    await repository.save(consent);
  }
}

function rowToConsent(row: ConsentRow): Consent {
  const snapshot: ConsentSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    status: row.status,
    category: row.category,
    granteeOrganizationId: row.grantee_organization_id,
    grantorActorId: row.grantor_actor_id,
    evidenceDocumentId: row.evidence_document_id ?? undefined,
    validFrom: toIsoString(row.valid_from),
    validUntil: row.valid_until ? toIsoString(row.valid_until) : undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return Consent.rehydrate(snapshot);
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
