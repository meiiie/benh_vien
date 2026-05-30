import { z } from "zod";

export const ConditionClinicalStatusSchema = z.enum([
  "active",
  "recurrence",
  "relapse",
  "inactive",
  "remission",
  "resolved"
]);

export const ConditionVerificationStatusSchema = z.enum([
  "unconfirmed",
  "provisional",
  "differential",
  "confirmed",
  "refuted",
  "entered-in-error"
]);

export const ConditionCategorySchema = z.enum(["problem-list-item", "encounter-diagnosis"]);

export const ConditionSeveritySchema = z.enum(["mild", "moderate", "severe"]);

export const ConditionCodeSchema = z.object({
  system: z.string().min(1),
  code: z.string().min(1),
  display: z.string().min(1)
});

export const PatientConditionsParamsSchema = z.object({
  patientId: z.string().min(1)
});

export const ConditionIdParamsSchema = z.object({
  id: z.string().min(1)
});

export const CreateConditionRequestSchema = z.object({
  encounterId: z.string().min(1).optional(),
  clinicalStatus: ConditionClinicalStatusSchema.optional(),
  verificationStatus: ConditionVerificationStatusSchema.optional(),
  category: ConditionCategorySchema,
  code: ConditionCodeSchema,
  severity: ConditionSeveritySchema.optional(),
  onsetAt: z.string().datetime().optional(),
  recordedAt: z.string().datetime().optional(),
  recorderPractitionerId: z.string().min(1),
  note: z.string().min(1).optional()
}).strict();

export type ConditionClinicalStatus = z.infer<typeof ConditionClinicalStatusSchema>;
export type ConditionVerificationStatus = z.infer<typeof ConditionVerificationStatusSchema>;
export type ConditionCategory = z.infer<typeof ConditionCategorySchema>;
export type ConditionSeverity = z.infer<typeof ConditionSeveritySchema>;
export type PatientConditionsParams = z.infer<typeof PatientConditionsParamsSchema>;
export type ConditionIdParams = z.infer<typeof ConditionIdParamsSchema>;
export type CreateConditionRequest = z.infer<typeof CreateConditionRequestSchema>;
