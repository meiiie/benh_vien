import { z } from "zod";

export const MedicationDispenseStatusSchema = z.enum([
  "preparation",
  "in-progress",
  "cancelled",
  "on-hold",
  "completed",
  "entered-in-error",
  "stopped",
  "declined",
  "unknown"
]);

export const MedicationDispenseCategorySchema = z.enum([
  "inpatient",
  "outpatient",
  "community",
  "discharge"
]);

export const MedicationDispenseCodeSchema = z.object({
  system: z.string().min(1),
  code: z.string().min(1),
  display: z.string().min(1)
});

export const MedicationDispenseQuantitySchema = z.object({
  value: z.number().positive(),
  unit: z.string().min(1),
  system: z.string().min(1).optional(),
  code: z.string().min(1).optional()
});

export const MedicationDispenseDosageInstructionSchema = z.object({
  text: z.string().min(1),
  route: z.string().min(1).optional(),
  doseQuantity: MedicationDispenseQuantitySchema.optional(),
  frequency: z.number().int().positive().optional(),
  period: z.number().positive().optional(),
  periodUnit: z.enum(["h", "d", "wk"]).optional()
});

export const PatientMedicationDispensesParamsSchema = z.object({
  patientId: z.string().min(1)
});

export const MedicationDispenseIdParamsSchema = z.object({
  id: z.string().min(1)
});

export const CreateMedicationDispenseRequestSchema = z.object({
  encounterId: z.string().min(1).optional(),
  medicationRequestId: z.string().min(1).optional(),
  status: MedicationDispenseStatusSchema,
  statusReason: MedicationDispenseCodeSchema.optional(),
  category: MedicationDispenseCategorySchema,
  medicationCode: MedicationDispenseCodeSchema,
  quantity: MedicationDispenseQuantitySchema.optional(),
  daysSupply: MedicationDispenseQuantitySchema.optional(),
  whenPrepared: z.string().datetime().optional(),
  whenHandedOver: z.string().datetime().optional(),
  dispenserPractitionerId: z.string().min(1).optional(),
  destinationLocationId: z.string().min(1).optional(),
  receiverPractitionerId: z.string().min(1).optional(),
  dosageInstruction: MedicationDispenseDosageInstructionSchema.optional(),
  note: z.string().min(1).optional()
}).strict();

export type MedicationDispenseStatus = z.infer<typeof MedicationDispenseStatusSchema>;
export type MedicationDispenseCategory = z.infer<typeof MedicationDispenseCategorySchema>;
export type PatientMedicationDispensesParams = z.infer<
  typeof PatientMedicationDispensesParamsSchema
>;
export type MedicationDispenseIdParams = z.infer<typeof MedicationDispenseIdParamsSchema>;
export type CreateMedicationDispenseRequest = z.infer<
  typeof CreateMedicationDispenseRequestSchema
>;
