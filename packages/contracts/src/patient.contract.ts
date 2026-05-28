import { z } from "zod";

export const PatientIdentifierSchema = z.object({
  system: z.string().min(1),
  value: z.string().min(1),
  type: z.enum(["national-id", "insurance-id", "hospital-mrn", "legacy-id"])
});

export const CreatePatientRequestSchema = z.object({
  identifiers: z.array(PatientIdentifierSchema).min(1),
  fullName: z.string().min(1),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  gender: z.enum(["male", "female", "other", "unknown"]).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  managingOrganizationId: z.string().min(1)
}).strict();

export const PatientIdParamsSchema = z.object({
  id: z.string().min(1)
});

export const MergePatientRequestSchema = z.object({
  targetPatientId: z.string().min(1),
  reason: z.string().min(1).max(500)
}).strict();

export type CreatePatientRequest = z.infer<typeof CreatePatientRequestSchema>;
export type MergePatientRequest = z.infer<typeof MergePatientRequestSchema>;
export type PatientIdParams = z.infer<typeof PatientIdParamsSchema>;
