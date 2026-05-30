import { z } from "zod";

export const PatientAuditEventsParamsSchema = z.object({
  patientId: z.string().min(1)
});

export type PatientAuditEventsParams = z.infer<typeof PatientAuditEventsParamsSchema>;

export const AuditEventsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50)
});

export type AuditEventsQuery = z.infer<typeof AuditEventsQuerySchema>;

export const AuditIntegrityReportSchema = z.object({
  patientId: z.string().min(1),
  checkedAt: z.string().datetime(),
  status: z.enum(["verified", "unsealed", "broken"]),
  verified: z.boolean(),
  totalEvents: z.number().int().nonnegative(),
  sealedEvents: z.number().int().nonnegative(),
  latestHash: z.string().optional(),
  brokenAtEventId: z.string().optional(),
  brokenReason: z.string().optional()
});

export type AuditIntegrityReportResponse = z.infer<typeof AuditIntegrityReportSchema>;
