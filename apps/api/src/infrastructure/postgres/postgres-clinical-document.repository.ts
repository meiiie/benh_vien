import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import type {
  ClinicalDocument,
  ClinicalDocumentRepository,
} from "@benh-vien-so/domain";
import { rowToClinicalDocument } from "./postgres-clinical-document.mapper.js";
import { upsertClinicalDocument } from "./postgres-clinical-document.persistence.js";
import { selectClinicalDocumentSql } from "./postgres-clinical-document.sql.js";
import type { ClinicalDocumentRow } from "./postgres-clinical-document.types.js";

export class PostgresClinicalDocumentRepository implements ClinicalDocumentRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByPatientId(patientId: string): Promise<ClinicalDocument[]> {
    const result = await this.pool.query<ClinicalDocumentRow>(
      `${selectClinicalDocumentSql}
      WHERE patient_id = $1
      ORDER BY created_at DESC`,
      [patientId]
    );

    return result.rows.map(rowToClinicalDocument);
  }

  async findById(id: string): Promise<ClinicalDocument | undefined> {
    const result = await this.pool.query<ClinicalDocumentRow>(
      `${selectClinicalDocumentSql}
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToClinicalDocument(row) : undefined;
  }

  async save(document: ClinicalDocument): Promise<void> {
    await upsertClinicalDocument(this.pool, document);
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
