import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import { ImagingStudy } from "@benh-vien-so/domain";
import type {
  ImagingStudyRepository,
  ImagingStudySeries,
  ImagingStudySnapshot,
  ImagingStudyStatus
} from "@benh-vien-so/domain";

type ImagingStudyRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  based_on_service_request_id: string | null;
  diagnostic_report_id: string | null;
  status: ImagingStudyStatus;
  study_instance_uid: string;
  accession_number: string | null;
  description: string | null;
  started_at: Date | string | null;
  referrer_practitioner_id: string | null;
  interpreter_practitioner_id: string | null;
  endpoint_id: string | null;
  number_of_series: number;
  number_of_instances: number;
  series: ImagingStudySeries[] | string;
  created_at: Date | string;
  updated_at: Date | string;
};

export class PostgresImagingStudyRepository implements ImagingStudyRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByPatientId(patientId: string): Promise<ImagingStudy[]> {
    const result = await this.pool.query<ImagingStudyRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        based_on_service_request_id,
        diagnostic_report_id,
        status,
        study_instance_uid,
        accession_number,
        description,
        started_at,
        referrer_practitioner_id,
        interpreter_practitioner_id,
        endpoint_id,
        number_of_series,
        number_of_instances,
        series,
        created_at,
        updated_at
      FROM imaging_studies
      WHERE patient_id = $1
      ORDER BY COALESCE(started_at, created_at) DESC`,
      [patientId]
    );

    return result.rows.map(rowToImagingStudy);
  }

  async findById(id: string): Promise<ImagingStudy | undefined> {
    const result = await this.pool.query<ImagingStudyRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        based_on_service_request_id,
        diagnostic_report_id,
        status,
        study_instance_uid,
        accession_number,
        description,
        started_at,
        referrer_practitioner_id,
        interpreter_practitioner_id,
        endpoint_id,
        number_of_series,
        number_of_instances,
        series,
        created_at,
        updated_at
      FROM imaging_studies
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToImagingStudy(row) : undefined;
  }

  async save(imagingStudy: ImagingStudy): Promise<void> {
    const snapshot = imagingStudy.toSnapshot();

    await this.pool.query(
      `INSERT INTO imaging_studies (
        id,
        patient_id,
        encounter_id,
        based_on_service_request_id,
        diagnostic_report_id,
        status,
        study_instance_uid,
        accession_number,
        description,
        started_at,
        referrer_practitioner_id,
        interpreter_practitioner_id,
        endpoint_id,
        number_of_series,
        number_of_instances,
        series,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16::jsonb, $17, $18)
      ON CONFLICT (id) DO UPDATE SET
        patient_id = EXCLUDED.patient_id,
        encounter_id = EXCLUDED.encounter_id,
        based_on_service_request_id = EXCLUDED.based_on_service_request_id,
        diagnostic_report_id = EXCLUDED.diagnostic_report_id,
        status = EXCLUDED.status,
        study_instance_uid = EXCLUDED.study_instance_uid,
        accession_number = EXCLUDED.accession_number,
        description = EXCLUDED.description,
        started_at = EXCLUDED.started_at,
        referrer_practitioner_id = EXCLUDED.referrer_practitioner_id,
        interpreter_practitioner_id = EXCLUDED.interpreter_practitioner_id,
        endpoint_id = EXCLUDED.endpoint_id,
        number_of_series = EXCLUDED.number_of_series,
        number_of_instances = EXCLUDED.number_of_instances,
        series = EXCLUDED.series,
        updated_at = EXCLUDED.updated_at`,
      [
        snapshot.id,
        snapshot.patientId,
        snapshot.encounterId ?? null,
        snapshot.basedOnServiceRequestId ?? null,
        snapshot.diagnosticReportId ?? null,
        snapshot.status,
        snapshot.studyInstanceUid,
        snapshot.accessionNumber ?? null,
        snapshot.description ?? null,
        snapshot.startedAt ?? null,
        snapshot.referrerPractitionerId ?? null,
        snapshot.interpreterPractitionerId ?? null,
        snapshot.endpointId ?? null,
        snapshot.numberOfSeries,
        snapshot.numberOfInstances,
        JSON.stringify(snapshot.series),
        snapshot.createdAt,
        snapshot.updatedAt
      ]
    );
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

function rowToImagingStudy(row: ImagingStudyRow): ImagingStudy {
  const series =
    typeof row.series === "string" ? (JSON.parse(row.series) as ImagingStudySeries[]) : row.series;

  const snapshot: ImagingStudySnapshot = {
    id: row.id,
    patientId: row.patient_id,
    encounterId: row.encounter_id ?? undefined,
    basedOnServiceRequestId: row.based_on_service_request_id ?? undefined,
    diagnosticReportId: row.diagnostic_report_id ?? undefined,
    status: row.status,
    studyInstanceUid: row.study_instance_uid,
    accessionNumber: row.accession_number ?? undefined,
    description: row.description ?? undefined,
    startedAt: row.started_at ? toIsoString(row.started_at) : undefined,
    referrerPractitionerId: row.referrer_practitioner_id ?? undefined,
    interpreterPractitionerId: row.interpreter_practitioner_id ?? undefined,
    endpointId: row.endpoint_id ?? undefined,
    numberOfSeries: row.number_of_series,
    numberOfInstances: row.number_of_instances,
    series,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return ImagingStudy.rehydrate(snapshot);
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
