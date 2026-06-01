export type ObservationStatus =
  | "registered"
  | "preliminary"
  | "final"
  | "amended"
  | "cancelled"
  | "entered-in-error";
export type ObservationCategory = "vital-signs" | "laboratory";

export type ObservationCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type ObservationQuantity = {
  readonly value: number;
  readonly unit: string;
  readonly system?: string;
  readonly code?: string;
};

export type Observation = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly status: ObservationStatus;
  readonly category: ObservationCategory;
  readonly code: ObservationCode;
  readonly effectiveAt: string;
  readonly valueQuantity?: ObservationQuantity;
  readonly valueText?: string;
  readonly performerPractitionerId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ObservationsResponse = {
  readonly items: readonly Observation[];
};

export type NewObservationForm = {
  encounterId: string;
  category: ObservationCategory;
  codeSystem: string;
  code: string;
  codeDisplay: string;
  value: string;
  unit: string;
  unitSystem: string;
  unitCode: string;
  effectiveAt: string;
  performerPractitionerId: string;
};
