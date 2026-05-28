import { z } from "zod";

export const RecordTransferStatusSchema = z.enum([
  "draft",
  "requested",
  "ready",
  "in-progress",
  "completed",
  "cancelled",
  "failed",
  "dead-lettered"
]);

export const CreateRecordTransferStatusSchema = z.enum([
  "draft",
  "requested",
  "ready"
]);

export const RecordTransferPrioritySchema = z.enum(["routine", "urgent", "asap", "stat"]);
export const RecordTransferBundleTypeSchema = z.enum(["collection", "document"]);

export const PatientRecordTransfersParamsSchema = z.object({
  patientId: z.string().min(1)
});

export const RecordTransferIdParamsSchema = z.object({
  id: z.string().min(1)
});

export const CreateRecordTransferRequestSchema = z.object({
  status: CreateRecordTransferStatusSchema.optional(),
  priority: RecordTransferPrioritySchema.optional(),
  bundleType: RecordTransferBundleTypeSchema.default("document"),
  sourceOrganizationId: z.string().min(1),
  recipientOrganizationId: z.string().min(1),
  consentReference: z.string().min(1),
  reason: z.string().min(1),
  requestedAt: z.string().datetime().optional(),
  sentAt: z.string().datetime().optional(),
  receivedAt: z.string().datetime().optional(),
  note: z.string().min(1).optional()
});

export const MarkRecordTransferSentRequestSchema = z.object({
  sentAt: z.string().datetime().optional(),
  note: z.string().min(1).optional()
});

export const MarkRecordTransferReceivedRequestSchema = z.object({
  receivedAt: z.string().datetime().optional(),
  receivedByActorId: z.string().min(1).optional(),
  acknowledgementReference: z.string().min(1).optional(),
  note: z.string().min(1).optional()
});

export const RecordTransferAcknowledgementCallbackRequestSchema = z.object({
  recipientOrganizationId: z.string().min(1),
  acknowledgementReference: z.string().min(1),
  receivedAt: z.string().datetime().optional(),
  receivedByActorId: z.string().min(1).optional(),
  targetEndpointId: z.string().min(1).optional(),
  deliveryIdempotencyKey: z.string().min(1).optional(),
  note: z.string().min(1).optional()
});

export const MarkRecordTransferFailedRequestSchema = z.object({
  failedAt: z.string().datetime().optional(),
  failureReason: z.string().min(1),
  nextRetryAt: z.string().datetime().optional(),
  note: z.string().min(1).optional()
});

export const RetryRecordTransferRequestSchema = z.object({
  retryAt: z.string().datetime().optional(),
  note: z.string().min(1).optional()
});

export type RecordTransferStatus = z.infer<typeof RecordTransferStatusSchema>;
export type CreateRecordTransferStatus = z.infer<
  typeof CreateRecordTransferStatusSchema
>;
export type RecordTransferPriority = z.infer<typeof RecordTransferPrioritySchema>;
export type RecordTransferBundleType = z.infer<typeof RecordTransferBundleTypeSchema>;
export type PatientRecordTransfersParams = z.infer<
  typeof PatientRecordTransfersParamsSchema
>;
export type RecordTransferIdParams = z.infer<typeof RecordTransferIdParamsSchema>;
export type CreateRecordTransferRequest = z.infer<typeof CreateRecordTransferRequestSchema>;
export type MarkRecordTransferSentRequest = z.infer<
  typeof MarkRecordTransferSentRequestSchema
>;
export type MarkRecordTransferReceivedRequest = z.infer<
  typeof MarkRecordTransferReceivedRequestSchema
>;
export type RecordTransferAcknowledgementCallbackRequest = z.infer<
  typeof RecordTransferAcknowledgementCallbackRequestSchema
>;
export type MarkRecordTransferFailedRequest = z.infer<
  typeof MarkRecordTransferFailedRequestSchema
>;
export type RetryRecordTransferRequest = z.infer<typeof RetryRecordTransferRequestSchema>;
