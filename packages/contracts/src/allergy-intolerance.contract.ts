import { z } from "zod";

export const AllergyClinicalStatusSchema = z.enum(["active", "inactive", "resolved"]);
export const AllergyVerificationStatusSchema = z.enum([
  "unconfirmed",
  "confirmed",
  "refuted",
  "entered-in-error"
]);
export const AllergyTypeSchema = z.enum(["allergy", "intolerance"]);
export const AllergyCategorySchema = z.enum(["food", "medication", "environment", "biologic"]);
export const AllergyCriticalitySchema = z.enum(["low", "high", "unable-to-assess"]);
export const AllergyReactionSeveritySchema = z.enum(["mild", "moderate", "severe"]);

export const AllergyCodeSchema = z.object({
  system: z.string().min(1),
  code: z.string().min(1),
  display: z.string().min(1)
});

export const AllergyReactionSchema = z.object({
  manifestation: AllergyCodeSchema,
  severity: AllergyReactionSeveritySchema.optional(),
  description: z.string().min(1).optional()
});

export const PatientAllergyIntolerancesParamsSchema = z.object({
  patientId: z.string().min(1)
});

export const AllergyIntoleranceIdParamsSchema = z.object({
  id: z.string().min(1)
});

export const CreateAllergyIntoleranceRequestSchema = z.object({
  encounterId: z.string().min(1).optional(),
  clinicalStatus: AllergyClinicalStatusSchema.optional(),
  verificationStatus: AllergyVerificationStatusSchema.optional(),
  type: AllergyTypeSchema,
  category: AllergyCategorySchema,
  criticality: AllergyCriticalitySchema.optional(),
  code: AllergyCodeSchema,
  reaction: AllergyReactionSchema.optional(),
  recordedAt: z.string().datetime().optional(),
  recorderPractitionerId: z.string().min(1),
  note: z.string().min(1).optional()
});

export type AllergyClinicalStatus = z.infer<typeof AllergyClinicalStatusSchema>;
export type AllergyVerificationStatus = z.infer<typeof AllergyVerificationStatusSchema>;
export type AllergyType = z.infer<typeof AllergyTypeSchema>;
export type AllergyCategory = z.infer<typeof AllergyCategorySchema>;
export type AllergyCriticality = z.infer<typeof AllergyCriticalitySchema>;
export type AllergyReactionSeverity = z.infer<typeof AllergyReactionSeveritySchema>;
export type PatientAllergyIntolerancesParams = z.infer<
  typeof PatientAllergyIntolerancesParamsSchema
>;
export type AllergyIntoleranceIdParams = z.infer<typeof AllergyIntoleranceIdParamsSchema>;
export type CreateAllergyIntoleranceRequest = z.infer<
  typeof CreateAllergyIntoleranceRequestSchema
>;
