export type PatientOwnedReferenceValidationError = {
  readonly error: string;
  readonly message: string;
};

type PatientOwnedRepository = {
  readonly findById: (
    id: string
  ) => Promise<{ readonly patientId: string } | undefined>;
};

type PatientOwnedReferenceValidation =
  PatientOwnedReferenceValidationError & {
    readonly id?: string;
    readonly repository: PatientOwnedRepository;
  };

export async function validatePatientOwnedReference(
  patientId: string,
  reference: PatientOwnedReferenceValidation
): Promise<PatientOwnedReferenceValidationError | undefined> {
  if (!reference.id) {
    return undefined;
  }

  const resource = await reference.repository.findById(reference.id);

  return resource?.patientId === patientId
    ? undefined
    : { error: reference.error, message: reference.message };
}

export async function validatePatientOwnedReferences(
  patientId: string,
  references: readonly PatientOwnedReferenceValidation[]
): Promise<PatientOwnedReferenceValidationError | undefined> {
  for (const reference of references) {
    const error = await validatePatientOwnedReference(patientId, reference);

    if (error) {
      return error;
    }
  }

  return undefined;
}
