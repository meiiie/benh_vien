export type ObservationStatus =
  | "registered"
  | "preliminary"
  | "final"
  | "amended"
  | "cancelled"
  | "entered-in-error";

export type ObservationCategory = "vital-signs" | "laboratory";

export const observationStatuses = new Set<ObservationStatus>([
  "registered",
  "preliminary",
  "final",
  "amended",
  "cancelled",
  "entered-in-error"
]);

export const observationCategories = new Set<ObservationCategory>([
  "vital-signs",
  "laboratory"
]);

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

export type ObservationSnapshot = {
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

export type CreateObservationInput = Omit<
  ObservationSnapshot,
  "status" | "createdAt" | "updatedAt"
> & {
  readonly status?: ObservationStatus;
};
