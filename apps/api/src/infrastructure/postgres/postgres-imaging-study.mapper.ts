import { ImagingStudy } from "@benh-vien-so/domain";
import type {
  ImagingStudySeries,
  ImagingStudySnapshot
} from "@benh-vien-so/domain";
import type { ImagingStudyRow } from "./postgres-imaging-study.types.js";

export function rowToImagingStudy(row: ImagingStudyRow): ImagingStudy {
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
    series: parseJson<ImagingStudySeries[]>(row.series),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return ImagingStudy.rehydrate(snapshot);
}

export function imagingStudyToUpsertValues(imagingStudy: ImagingStudy): unknown[] {
  const snapshot = imagingStudy.toSnapshot();

  return [
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
  ];
}

function parseJson<T>(value: T | string): T {
  return typeof value === "string" ? (JSON.parse(value) as T) : value;
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
