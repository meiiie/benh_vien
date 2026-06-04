import { z } from "zod";

export const MedicationRequestStatusSchema = z.enum([
  "active",
  "on-hold",
  "cancelled",
  "completed",
  "entered-in-error",
  "stopped",
  "draft",
  "unknown"
]);

export const MedicationRequestIntentSchema = z.enum([
  "proposal",
  "plan",
  "order",
  "original-order",
  "reflex-order",
  "filler-order",
  "instance-order",
  "option"
]);

export const MedicationRequestCategorySchema = z.enum([
  "inpatient",
  "outpatient",
  "community",
  "discharge"
]);

export const MedicationRequestPrioritySchema = z.enum(["routine", "urgent", "asap", "stat"]);

export const MedicationCodeSchema = z.object({
  system: z.string().min(1),
  code: z.string().min(1),
  display: z.string().min(1)
});

export const MedicationQuantitySchema = z.object({
  value: z.number().positive(),
  unit: z.string().min(1),
  system: z.string().min(1).optional(),
  code: z.string().min(1).optional()
});

export const DosageInstructionSchema = z
  .object({
    text: z.string().min(1),
    route: z.string().min(1).optional(),
    doseQuantity: MedicationQuantitySchema.optional(),
    frequency: z.number().int().positive().optional(),
    period: z.number().positive().optional(),
    periodUnit: z.enum(["h", "d", "wk"]).optional()
  })
  .refine(
    (value) =>
      [value.frequency, value.period, value.periodUnit].every(Boolean) ||
      [value.frequency, value.period, value.periodUnit].every((item) => item === undefined),
    {
      message: "Nhịp dùng thuốc phải có đủ tần suất, chu kỳ và đơn vị chu kỳ.",
      path: ["timing"]
    }
  );

export const PatientMedicationRequestsParamsSchema = z.object({
  patientId: z.string().min(1)
});

export const MedicationRequestIdParamsSchema = z.object({
  id: z.string().min(1)
});

export const CreateMedicationRequestRequestSchema = z.object({
  encounterId: z.string().min(1).optional(),
  reasonConditionId: z.string().min(1).optional(),
  status: MedicationRequestStatusSchema.optional(),
  intent: MedicationRequestIntentSchema.optional(),
  category: MedicationRequestCategorySchema,
  priority: MedicationRequestPrioritySchema.optional(),
  medicationCode: MedicationCodeSchema,
  dosageInstruction: DosageInstructionSchema,
  authoredOn: z.string().datetime().optional(),
  requesterPractitionerId: z.string().min(1),
  expectedSupplyDurationDays: z.number().int().positive().optional(),
  note: z.string().min(1).optional()
}).strict();

export type MedicationRequestStatus = z.infer<typeof MedicationRequestStatusSchema>;
export type MedicationRequestIntent = z.infer<typeof MedicationRequestIntentSchema>;
export type MedicationRequestCategory = z.infer<typeof MedicationRequestCategorySchema>;
export type MedicationRequestPriority = z.infer<typeof MedicationRequestPrioritySchema>;
export type PatientMedicationRequestsParams = z.infer<
  typeof PatientMedicationRequestsParamsSchema
>;
export type MedicationRequestIdParams = z.infer<typeof MedicationRequestIdParamsSchema>;
export type CreateMedicationRequestRequest = z.infer<
  typeof CreateMedicationRequestRequestSchema
>;
