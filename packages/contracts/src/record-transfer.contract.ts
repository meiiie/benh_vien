import { z } from "zod";

export const RecordTransferStatusSchema = z.enum([
  "draft",
  "requested",
  "ready",
  "in-progress",
  "completed",
  "cancelled",
  "failed"
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
  status: RecordTransferStatusSchema.optional(),
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

export type RecordTransferStatus = z.infer<typeof RecordTransferStatusSchema>;
export type RecordTransferPriority = z.infer<typeof RecordTransferPrioritySchema>;
export type RecordTransferBundleType = z.infer<typeof RecordTransferBundleTypeSchema>;
export type PatientRecordTransfersParams = z.infer<
  typeof PatientRecordTransfersParamsSchema
>;
export type RecordTransferIdParams = z.infer<typeof RecordTransferIdParamsSchema>;
export type CreateRecordTransferRequest = z.infer<typeof CreateRecordTransferRequestSchema>;
