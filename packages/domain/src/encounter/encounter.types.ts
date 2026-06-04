export type EncounterClass = "ambulatory" | "inpatient" | "emergency" | "virtual";

export type EncounterStatus =
  | "planned"
  | "in-progress"
  | "finished"
  | "cancelled"
  | "entered-in-error";

export const encounterClasses = new Set<EncounterClass>([
  "ambulatory",
  "inpatient",
  "emergency",
  "virtual"
]);

export const encounterStatuses = new Set<EncounterStatus>([
  "planned",
  "in-progress",
  "finished",
  "cancelled",
  "entered-in-error"
]);

export type EncounterSnapshot = {
  readonly id: string;
  readonly patientId: string;
  readonly status: EncounterStatus;
  readonly class: EncounterClass;
  readonly serviceType: string;
  readonly reasonText: string;
  readonly departmentId?: string;
  readonly attendingPractitionerId: string;
  readonly startedAt: string;
  readonly endedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateEncounterInput = Omit<
  EncounterSnapshot,
  "status" | "endedAt" | "createdAt" | "updatedAt"
> & {
  readonly status?: EncounterStatus;
  readonly endedAt?: string;
};
