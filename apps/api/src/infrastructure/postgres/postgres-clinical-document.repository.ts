import pg from "pg";
import { ClinicalDocument } from "@benh-vien-so/domain";
import type {
  ClinicalDocumentRepository,
  ClinicalDocumentSnapshot,
  ClinicalDocumentStatus,
  ClinicalDocumentType
} from "@benh-vien-so/domain";

const { Pool } = pg;

type ClinicalDocumentRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  document_type: ClinicalDocumentType;
  title: string;
  status: ClinicalDocumentStatus;
  storage_uri: string;
  author_practitioner_id: string;
  signed_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export class PostgresClinicalDocumentRepository implements ClinicalDocumentRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 10
    });
  }

  async findByPatientId(patientId: string): Promise<ClinicalDocument[]> {
    const result = await this.pool.query<ClinicalDocumentRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        document_type,
        title,
        status,
        storage_uri,
        author_practitioner_id,
        signed_at,
        created_at,
        updated_at
      FROM clinical_documents
      WHERE patient_id = $1
      ORDER BY created_at DESC`,
      [patientId]
    );

    return result.rows.map(rowToClinicalDocument);
  }

  async findById(id: string): Promise<ClinicalDocument | undefined> {
    const result = await this.pool.query<ClinicalDocumentRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        document_type,
        title,
        status,
        storage_uri,
        author_practitioner_id,
        signed_at,
        created_at,
        updated_at
      FROM clinical_documents
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToClinicalDocument(row) : undefined;
  }

  async save(document: ClinicalDocument): Promise<void> {
    const snapshot = document.toSnapshot();

    await this.pool.query(
      `INSERT INTO clinical_documents (
        id,
        patient_id,
        encounter_id,
        document_type,
        title,
        status,
        storage_uri,
        author_practitioner_id,
        signed_at,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        patient_id = EXCLUDED.patient_id,
        encounter_id = EXCLUDED.encounter_id,
        document_type = EXCLUDED.document_type,
        title = EXCLUDED.title,
        status = EXCLUDED.status,
        storage_uri = EXCLUDED.storage_uri,
        author_practitioner_id = EXCLUDED.author_practitioner_id,
        signed_at = EXCLUDED.signed_at,
        updated_at = EXCLUDED.updated_at`,
      [
        snapshot.id,
        snapshot.patientId,
        snapshot.encounterId ?? null,
        snapshot.type,
        snapshot.title,
        snapshot.status,
        snapshot.storageUri,
        snapshot.authorPractitionerId,
        snapshot.signedAt ?? null,
        snapshot.createdAt,
        snapshot.updatedAt
      ]
    );
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export async function seedClinicalDocumentsIfEmpty(
  repository: ClinicalDocumentRepository,
  seedDocuments: readonly ClinicalDocument[]
): Promise<void> {
  const firstPatientId = seedDocuments[0]?.patientId;

  if (!firstPatientId) {
    return;
  }

  const documents = await repository.findByPatientId(firstPatientId);

  if (documents.length > 0) {
    return;
  }

  for (const document of seedDocuments) {
    await repository.save(document);
  }
}

function rowToClinicalDocument(row: ClinicalDocumentRow): ClinicalDocument {
  const snapshot: ClinicalDocumentSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    encounterId: row.encounter_id ?? undefined,
    type: row.document_type,
    title: row.title,
    status: row.status,
    storageUri: row.storage_uri,
    authorPractitionerId: row.author_practitioner_id,
    signedAt: row.signed_at ? toIsoString(row.signed_at) : undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return ClinicalDocument.rehydrate(snapshot);
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
