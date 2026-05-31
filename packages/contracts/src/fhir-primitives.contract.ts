import { z } from "zod";

export const FHIR_UNSIGNED_INT_MAX = 2_147_483_647;

export const FhirUnsignedIntSchema = z
  .number()
  .int()
  .nonnegative()
  .max(FHIR_UNSIGNED_INT_MAX);
