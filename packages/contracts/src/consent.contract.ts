import { z } from "zod";

export const PatientConsentsParamsSchema = z.object({
  patientId: z.string().min(1)
});

export const PatientConsentParamsSchema = z.object({
  patientId: z.string().min(1),
  consentId: z.string().min(1)
});

export const CreateConsentRequestSchema = z.object({
  category: z.literal("record-sharing").default("record-sharing"),
  granteeOrganizationId: z.string().min(1),
  evidenceDocumentId: z.string().min(1).optional(),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime().optional()
});

export const RevokeConsentRequestSchema = z.object({
  reason: z.string().min(1).max(500).optional()
});

export type PatientConsentsParams = z.infer<typeof PatientConsentsParamsSchema>;
export type PatientConsentParams = z.infer<typeof PatientConsentParamsSchema>;
export type CreateConsentRequest = z.infer<typeof CreateConsentRequestSchema>;
export type RevokeConsentRequest = z.infer<typeof RevokeConsentRequestSchema>;
