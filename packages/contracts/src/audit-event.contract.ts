import { z } from "zod";

export const PatientAuditEventsParamsSchema = z.object({
  patientId: z.string().min(1)
});

export type PatientAuditEventsParams = z.infer<typeof PatientAuditEventsParamsSchema>;
