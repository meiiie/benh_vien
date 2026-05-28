import { z } from "zod";

export const WorkflowTaskStatusSchema = z.enum([
  "draft",
  "requested",
  "received",
  "accepted",
  "rejected",
  "ready",
  "cancelled",
  "in-progress",
  "on-hold",
  "failed",
  "completed",
  "entered-in-error"
]);

export const WorkflowTaskIntentSchema = z.enum([
  "unknown",
  "proposal",
  "plan",
  "order",
  "original-order",
  "reflex-order",
  "filler-order",
  "instance-order",
  "option"
]);

export const WorkflowTaskPrioritySchema = z.enum(["routine", "urgent", "asap", "stat"]);

export const WorkflowTaskCodeSchema = z.object({
  system: z.string().min(1),
  code: z.string().min(1),
  display: z.string().min(1)
});

export const WorkflowTaskBusinessStatusSchema = z.object({
  code: z.string().min(1),
  display: z.string().min(1)
});

export const WorkflowTaskReferenceResourceTypeSchema = z.enum([
  "ServiceRequest",
  "Observation",
  "DiagnosticReport",
  "ImagingStudy",
  "DocumentReference"
]);

export const WorkflowTaskReferenceSchema = z.object({
  resourceType: WorkflowTaskReferenceResourceTypeSchema,
  id: z.string().min(1),
  label: z.string().min(1).optional()
});

export const WorkflowTaskExecutionPeriodSchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional()
});

export const PatientWorkflowTasksParamsSchema = z.object({
  patientId: z.string().min(1)
});

export const WorkflowTaskIdParamsSchema = z.object({
  id: z.string().min(1)
});

export const CreateWorkflowTaskRequestSchema = z.object({
  encounterId: z.string().min(1).optional(),
  basedOnServiceRequestId: z.string().min(1).optional(),
  status: WorkflowTaskStatusSchema,
  intent: WorkflowTaskIntentSchema.optional(),
  priority: WorkflowTaskPrioritySchema.optional(),
  code: WorkflowTaskCodeSchema,
  description: z.string().min(1).optional(),
  businessStatus: WorkflowTaskBusinessStatusSchema.optional(),
  requesterPractitionerId: z.string().min(1).optional(),
  ownerOrganizationId: z.string().min(1).optional(),
  ownerPractitionerId: z.string().min(1).optional(),
  authoredOn: z.string().datetime().optional(),
  lastModified: z.string().datetime().optional(),
  executionPeriod: WorkflowTaskExecutionPeriodSchema.optional(),
  inputReferences: z.array(WorkflowTaskReferenceSchema).optional(),
  outputReferences: z.array(WorkflowTaskReferenceSchema).optional(),
  note: z.string().min(1).optional()
}).strict();

export type WorkflowTaskStatus = z.infer<typeof WorkflowTaskStatusSchema>;
export type WorkflowTaskIntent = z.infer<typeof WorkflowTaskIntentSchema>;
export type WorkflowTaskPriority = z.infer<typeof WorkflowTaskPrioritySchema>;
export type WorkflowTaskReferenceResourceType = z.infer<
  typeof WorkflowTaskReferenceResourceTypeSchema
>;
export type PatientWorkflowTasksParams = z.infer<typeof PatientWorkflowTasksParamsSchema>;
export type WorkflowTaskIdParams = z.infer<typeof WorkflowTaskIdParamsSchema>;
export type CreateWorkflowTaskRequest = z.infer<typeof CreateWorkflowTaskRequestSchema>;
