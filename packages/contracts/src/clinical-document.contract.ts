import { z } from "zod";

const MimeTypeSchema = z
  .string()
  .trim()
  .regex(
    /^[A-Za-z0-9!#$&^_.+-]+\/[A-Za-z0-9!#$&^_.+-]+(?:\s*;\s*[A-Za-z0-9!#$&^_.+-]+=(?:"[^"]+"|[A-Za-z0-9!#$&^_.+-]+))*$/,
    "Định dạng MIME không hợp lệ."
  );

const Sha1Base64Schema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9+/]{27}=$/, "Hash SHA-1 Base64 không hợp lệ.");

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
  attachmentContentType: MimeTypeSchema.optional(),
  attachmentSizeBytes: z.number().int().nonnegative().max(4_294_967_295).optional(),
  attachmentHashSha1Base64: Sha1Base64Schema.optional(),
  attachmentCreatedAt: z.string().datetime().optional(),
  authorPractitionerId: z.string().min(1)
}).strict();

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
