import { z } from "zod";

export const PatientAuditEventsParamsSchema = z.object({
  patientId: z.string().min(1)
});

export type PatientAuditEventsParams = z.infer<typeof PatientAuditEventsParamsSchema>;

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
