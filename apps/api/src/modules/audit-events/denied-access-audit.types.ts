export type DeniedAccessError =
  | "FORBIDDEN"
  | "PATIENT_ACCESS_DENIED"
  | "INVALID_PURPOSE_OF_USE";

export type DeniedAccessPayload = {
  readonly error: DeniedAccessError;
  readonly requestId?: string;
  readonly permission?: string;
  readonly patientId?: string;
  readonly actor?: {
    readonly id?: string;
    readonly role?: string;
    readonly purposeOfUse?: string;
  };
};

export const deniedAccessErrorCodes = new Set<DeniedAccessError>([
  "FORBIDDEN",
  "PATIENT_ACCESS_DENIED",
  "INVALID_PURPOSE_OF_USE"
]);
