import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import type {
  ImagingStudy,
  ImagingStudyRepository,
} from "@benh-vien-so/domain";
import { rowToImagingStudy } from "./postgres-imaging-study.mapper.js";
import { upsertImagingStudy } from "./postgres-imaging-study.persistence.js";
import { selectImagingStudySql } from "./postgres-imaging-study.sql.js";
import type { ImagingStudyRow } from "./postgres-imaging-study.types.js";

export class PostgresImagingStudyRepository implements ImagingStudyRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByPatientId(patientId: string): Promise<ImagingStudy[]> {
    const result = await this.pool.query<ImagingStudyRow>(
      `${selectImagingStudySql}
      WHERE patient_id = $1
      ORDER BY COALESCE(started_at, created_at) DESC`,
      [patientId]
    );

    return result.rows.map(rowToImagingStudy);
  }

  async findById(id: string): Promise<ImagingStudy | undefined> {
    const result = await this.pool.query<ImagingStudyRow>(
      `${selectImagingStudySql}
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToImagingStudy(row) : undefined;
  }

  async save(imagingStudy: ImagingStudy): Promise<void> {
    await upsertImagingStudy(this.pool, imagingStudy);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export async function seedImagingStudiesIfEmpty(
  repository: ImagingStudyRepository,
  seedImagingStudies: readonly ImagingStudy[]
): Promise<void> {
  const firstPatientId = seedImagingStudies[0]?.patientId;

  if (!firstPatientId) {
    return;
  }

  const imagingStudies = await repository.findByPatientId(firstPatientId);

  if (imagingStudies.length > 0) {
    return;
  }

  for (const imagingStudy of seedImagingStudies) {
    await repository.save(imagingStudy);
  }
}
