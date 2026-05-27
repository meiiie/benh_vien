import { z } from "zod";

export const ServiceRequestStatusSchema = z.enum([
  "draft",
  "active",
  "on-hold",
  "revoked",
  "completed",
  "entered-in-error",
  "unknown"
]);

export const ServiceRequestIntentSchema = z.enum([
  "proposal",
  "plan",
  "directive",
  "order",
  "original-order",
  "reflex-order",
  "filler-order",
  "instance-order",
  "option"
]);

export const ServiceRequestCategorySchema = z.enum([
  "laboratory",
  "imaging",
  "procedure",
  "consultation",
  "therapy"
]);

export const ServiceRequestPrioritySchema = z.enum(["routine", "urgent", "asap", "stat"]);

export const ServiceRequestCodeSchema = z.object({
  system: z.string().min(1),
  code: z.string().min(1),
  display: z.string().min(1)
});

export const PatientServiceRequestsParamsSchema = z.object({
  patientId: z.string().min(1)
});

export const ServiceRequestIdParamsSchema = z.object({
  id: z.string().min(1)
});

export const CreateServiceRequestRequestSchema = z.object({
  encounterId: z.string().min(1).optional(),
  reasonConditionId: z.string().min(1).optional(),
  status: ServiceRequestStatusSchema.optional(),
  intent: ServiceRequestIntentSchema.optional(),
  category: ServiceRequestCategorySchema,
  priority: ServiceRequestPrioritySchema.optional(),
  code: ServiceRequestCodeSchema,
  occurrenceAt: z.string().datetime().optional(),
  authoredOn: z.string().datetime().optional(),
  requesterPractitionerId: z.string().min(1),
  performerOrganizationId: z.string().min(1).optional(),
  patientInstruction: z.string().min(1).optional(),
  note: z.string().min(1).optional()
});

export type ServiceRequestStatus = z.infer<typeof ServiceRequestStatusSchema>;
export type ServiceRequestIntent = z.infer<typeof ServiceRequestIntentSchema>;
export type ServiceRequestCategory = z.infer<typeof ServiceRequestCategorySchema>;
export type ServiceRequestPriority = z.infer<typeof ServiceRequestPrioritySchema>;
export type PatientServiceRequestsParams = z.infer<typeof PatientServiceRequestsParamsSchema>;
export type ServiceRequestIdParams = z.infer<typeof ServiceRequestIdParamsSchema>;
export type CreateServiceRequestRequest = z.infer<typeof CreateServiceRequestRequestSchema>;
