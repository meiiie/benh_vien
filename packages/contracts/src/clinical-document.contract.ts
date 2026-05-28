import { z } from "zod";

export const ClinicalDocumentTypeSchema = z.enum([
  "admission-note",
  "discharge-summary",
  "lab-report",
  "imaging-report",
  "referral-letter",
  "consent-form",
  "advance-directive",
  "ccda",
  "ccr",
  "medical-record",
  "patient-information"
]);

export const CreateClinicalDocumentRequestSchema = z.object({
  encounterId: z.string().min(1).optional(),
  type: ClinicalDocumentTypeSchema,
  title: z.string().min(1),
  storageUri: z.string().min(1),
  attachmentContentType: z.string().min(1).optional(),
  attachmentSizeBytes: z.number().int().nonnegative().max(4_294_967_295).optional(),
  attachmentHashSha1Base64: z.string().min(1).optional(),
  attachmentCreatedAt: z.string().datetime().optional(),
  authorPractitionerId: z.string().min(1)
});

export const PatientDocumentsParamsSchema = z.object({
  patientId: z.string().min(1)
});

export const ClinicalDocumentIdParamsSchema = z.object({
  id: z.string().min(1)
});

export type ClinicalDocumentType = z.infer<typeof ClinicalDocumentTypeSchema>;
export type CreateClinicalDocumentRequest = z.infer<
  typeof CreateClinicalDocumentRequestSchema
>;
export type PatientDocumentsParams = z.infer<typeof PatientDocumentsParamsSchema>;
export type ClinicalDocumentIdParams = z.infer<typeof ClinicalDocumentIdParamsSchema>;
