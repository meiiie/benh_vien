import { z } from "zod";

export const ProcedureStatusSchema = z.enum([
  "preparation",
  "in-progress",
  "not-done",
  "on-hold",
  "stopped",
  "completed",
  "entered-in-error",
  "unknown"
]);

export const ProcedureCategorySchema = z.enum([
  "surgical",
  "diagnostic",
  "therapeutic",
  "counseling",
  "rehabilitation",
  "other"
]);

export const ProcedureCodingSchema = z.object({
  system: z.string().min(1),
  code: z.string().min(1),
  display: z.string().min(1)
});

export const ProcedurePerformerActorTypeSchema = z.enum([
  "Practitioner",
  "PractitionerRole",
  "Organization"
]);

export const ProcedurePerformerSchema = z.object({
  actorType: ProcedurePerformerActorTypeSchema,
  actorId: z.string().min(1),
  function: ProcedureCodingSchema.optional(),
  onBehalfOfOrganizationId: z.string().min(1).optional()
});

export const ProcedurePerformedPeriodSchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional()
});

export const ProcedureReportReferenceSchema = z.object({
  resourceType: z.enum(["DiagnosticReport", "DocumentReference", "Composition"]),
  id: z.string().min(1)
});

export const PatientProceduresParamsSchema = z.object({
  patientId: z.string().min(1)
});

export const ProcedureIdParamsSchema = z.object({
  id: z.string().min(1)
});

export const CreateProcedureRequestSchema = z.object({
  encounterId: z.string().min(1).optional(),
  basedOnServiceRequestId: z.string().min(1).optional(),
  partOfProcedureId: z.string().min(1).optional(),
  status: ProcedureStatusSchema,
  statusReason: ProcedureCodingSchema.optional(),
  category: ProcedureCategorySchema,
  code: ProcedureCodingSchema,
  performedPeriod: ProcedurePerformedPeriodSchema.optional(),
  recorderPractitionerId: z.string().min(1).optional(),
  asserterPractitionerId: z.string().min(1).optional(),
  performers: z.array(ProcedurePerformerSchema).optional(),
  reasonConditionId: z.string().min(1).optional(),
  bodySite: ProcedureCodingSchema.optional(),
  outcome: ProcedureCodingSchema.optional(),
  reportReferences: z.array(ProcedureReportReferenceSchema).optional(),
  note: z.string().min(1).optional()
}).strict();

export type ProcedureStatus = z.infer<typeof ProcedureStatusSchema>;
export type ProcedureCategory = z.infer<typeof ProcedureCategorySchema>;
export type ProcedurePerformerActorType = z.infer<typeof ProcedurePerformerActorTypeSchema>;
export type PatientProceduresParams = z.infer<typeof PatientProceduresParamsSchema>;
export type ProcedureIdParams = z.infer<typeof ProcedureIdParamsSchema>;
export type CreateProcedureRequest = z.infer<typeof CreateProcedureRequestSchema>;
