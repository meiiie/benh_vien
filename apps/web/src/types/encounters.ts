export type EncounterClass = "ambulatory" | "inpatient" | "emergency" | "virtual";
export type EncounterStatus = "planned" | "in-progress" | "finished" | "cancelled" | "entered-in-error";

export type Encounter = {
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

export type EncountersResponse = {
  readonly items: readonly Encounter[];
};

export type NewEncounterForm = {
  class: EncounterClass;
  serviceType: string;
  reasonText: string;
  departmentId: string;
  attendingPractitionerId: string;
  startedAt: string;
};
