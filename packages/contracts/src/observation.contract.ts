import { z } from "zod";

export const ObservationCodeSchema = z.object({
  system: z.string().min(1),
  code: z.string().min(1),
  display: z.string().min(1)
});

export const ObservationQuantitySchema = z.object({
  value: z.number(),
  unit: z.string().min(1),
  system: z.string().min(1).optional(),
  code: z.string().min(1).optional()
});

export const PatientObservationsParamsSchema = z.object({
  patientId: z.string().min(1)
});

export const ObservationIdParamsSchema = z.object({
  id: z.string().min(1)
});

export const CreateObservationRequestSchema = z
  .object({
    encounterId: z.string().min(1).optional(),
    status: z
      .enum(["registered", "preliminary", "final", "amended", "cancelled", "entered-in-error"])
      .optional(),
    category: z.enum(["vital-signs", "laboratory"]),
    code: ObservationCodeSchema,
    effectiveAt: z.string().datetime(),
    valueQuantity: ObservationQuantitySchema.optional(),
    valueText: z.string().min(1).optional(),
    performerPractitionerId: z.string().min(1).optional()
  })
  .refine((value) => Boolean(value.valueQuantity) !== Boolean(value.valueText), {
    message: "Observation phải có đúng một kiểu giá trị.",
    path: ["value"]
  });

export type PatientObservationsParams = z.infer<typeof PatientObservationsParamsSchema>;
export type ObservationIdParams = z.infer<typeof ObservationIdParamsSchema>;
export type CreateObservationRequest = z.infer<typeof CreateObservationRequestSchema>;
