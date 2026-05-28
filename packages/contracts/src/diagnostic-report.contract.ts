import { z } from "zod";

export const DiagnosticReportStatusSchema = z.enum([
  "registered",
  "partial",
  "preliminary",
  "final",
  "amended",
  "corrected",
  "appended",
  "cancelled",
  "entered-in-error",
  "unknown"
]);

export const DiagnosticReportCategorySchema = z.enum([
  "laboratory",
  "imaging",
  "pathology",
  "other"
]);

export const DiagnosticReportCodeSchema = z.object({
  system: z.string().min(1),
  code: z.string().min(1),
  display: z.string().min(1)
});

export const PatientDiagnosticReportsParamsSchema = z.object({
  patientId: z.string().min(1)
});

export const DiagnosticReportIdParamsSchema = z.object({
  id: z.string().min(1)
});

export const CreateDiagnosticReportRequestSchema = z
  .object({
    encounterId: z.string().min(1).optional(),
    basedOnServiceRequestId: z.string().min(1).optional(),
    status: DiagnosticReportStatusSchema.optional(),
    category: DiagnosticReportCategorySchema,
    code: DiagnosticReportCodeSchema,
    effectiveAt: z.string().datetime(),
    issuedAt: z.string().datetime().optional(),
    performerOrganizationId: z.string().min(1).optional(),
    resultsInterpreterPractitionerId: z.string().min(1).optional(),
    resultObservationIds: z.array(z.string().min(1)).default([]),
    conclusion: z.string().min(1).optional(),
    presentedFormUrl: z.string().min(1).optional(),
    presentedFormTitle: z.string().min(1).optional()
  })
  .strict()
  .refine(
    (value) =>
      value.resultObservationIds.length > 0 ||
      Boolean(value.conclusion) ||
      Boolean(value.presentedFormUrl),
    {
      message: "DiagnosticReport phải có Observation kết quả, kết luận hoặc tệp báo cáo.",
      path: ["result"]
    }
  )
  .refine((value) => !value.presentedFormTitle || Boolean(value.presentedFormUrl), {
    message: "Tiêu đề tệp báo cáo chỉ hợp lệ khi có đường dẫn tệp.",
    path: ["presentedFormTitle"]
  });

export type DiagnosticReportStatus = z.infer<typeof DiagnosticReportStatusSchema>;
export type DiagnosticReportCategory = z.infer<typeof DiagnosticReportCategorySchema>;
export type PatientDiagnosticReportsParams = z.infer<typeof PatientDiagnosticReportsParamsSchema>;
export type DiagnosticReportIdParams = z.infer<typeof DiagnosticReportIdParamsSchema>;
export type CreateDiagnosticReportRequest = z.infer<typeof CreateDiagnosticReportRequestSchema>;
