import type {
  ImagingStudySeries,
  ImagingStudyStatus
} from "@benh-vien-so/domain";

export type ImagingStudyRow = {
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
