import type pg from "pg";
import type {
  PatientIdentifier,
  PatientRecordStatus,
  PatientSnapshot
} from "@benh-vien-so/domain";

export type PostgresPatientQueryable = Pick<pg.Pool | pg.PoolClient, "query">;

export type PatientRow = {
  id: string;
  identifiers: PatientIdentifier[] | string;
  full_name: string;
  birth_date: string | null;
  gender: PatientSnapshot["gender"];
  address: string | null;
  phone: string | null;
  managing_organization_id: string;
  status: PatientRecordStatus;
  merged_into_patient_id: string | null;
  merged_at: Date | string | null;
  merged_by_actor_id: string | null;
  merge_reason: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};
