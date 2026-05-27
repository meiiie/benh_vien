import { z } from "zod";

export const ImagingStudyStatusSchema = z.enum([
  "registered",
  "available",
  "cancelled",
  "entered-in-error",
  "unknown"
]);

export const ImagingStudyCodingSchema = z.object({
  system: z.string().min(1),
  code: z.string().min(1),
  display: z.string().min(1)
});

export const ImagingStudySeriesSchema = z.object({
  uid: z.string().min(1),
  number: z.number().int().nonnegative().optional(),
  modality: ImagingStudyCodingSchema,
  description: z.string().min(1).optional(),
  numberOfInstances: z.number().int().nonnegative().optional(),
  bodySite: ImagingStudyCodingSchema.optional(),
  startedAt: z.string().datetime().optional()
});

export const PatientImagingStudiesParamsSchema = z.object({
  patientId: z.string().min(1)
});

export const ImagingStudyIdParamsSchema = z.object({
  id: z.string().min(1)
});

export const CreateImagingStudyRequestSchema = z
  .object({
    encounterId: z.string().min(1).optional(),
    basedOnServiceRequestId: z.string().min(1).optional(),
    diagnosticReportId: z.string().min(1).optional(),
    status: ImagingStudyStatusSchema.optional(),
    studyInstanceUid: z.string().min(1),
    accessionNumber: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    startedAt: z.string().datetime().optional(),
    referrerPractitionerId: z.string().min(1).optional(),
    interpreterPractitionerId: z.string().min(1).optional(),
    endpointId: z.string().min(1).optional(),
    numberOfSeries: z.number().int().nonnegative().optional(),
    numberOfInstances: z.number().int().nonnegative().optional(),
    series: z.array(ImagingStudySeriesSchema).min(1)
  })
  .refine((value) => value.numberOfSeries === undefined || value.numberOfSeries >= value.series.length, {
    message: "Số chuỗi ảnh không được nhỏ hơn số series đã khai báo.",
    path: ["numberOfSeries"]
  })
  .refine(
    (value) =>
      value.numberOfInstances === undefined ||
      value.numberOfInstances >=
        value.series.reduce((total, series) => total + (series.numberOfInstances ?? 0), 0),
    {
      message: "Số ảnh không được nhỏ hơn tổng số ảnh trong các series đã khai báo.",
      path: ["numberOfInstances"]
    }
  );

export type ImagingStudyStatus = z.infer<typeof ImagingStudyStatusSchema>;
export type ImagingStudyCoding = z.infer<typeof ImagingStudyCodingSchema>;
export type PatientImagingStudiesParams = z.infer<typeof PatientImagingStudiesParamsSchema>;
export type ImagingStudyIdParams = z.infer<typeof ImagingStudyIdParamsSchema>;
export type CreateImagingStudyRequest = z.infer<typeof CreateImagingStudyRequestSchema>;
