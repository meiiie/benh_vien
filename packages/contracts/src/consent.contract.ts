import { z } from "zod";

export const PatientConsentsParamsSchema = z.object({
  patientId: z.string().min(1)
});

export const CreateConsentRequestSchema = z.object({
  category: z.literal("record-sharing").default("record-sharing"),
  granteeOrganizationId: z.string().min(1),
  evidenceDocumentId: z.string().min(1).optional(),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime().optional()
});

export type PatientConsentsParams = z.infer<typeof PatientConsentsParamsSchema>;
export type CreateConsentRequest = z.infer<typeof CreateConsentRequestSchema>;
