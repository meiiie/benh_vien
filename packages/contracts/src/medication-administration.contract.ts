import { z } from "zod";

export const MedicationAdministrationStatusSchema = z.enum([
  "in-progress",
  "not-done",
  "on-hold",
  "completed",
  "entered-in-error",
  "stopped",
  "unknown"
]);

export const MedicationAdministrationCategorySchema = z.enum([
  "inpatient",
  "outpatient",
  "community",
  "patient-specified"
]);

export const MedicationAdministrationCodeSchema = z.object({
  system: z.string().min(1),
  code: z.string().min(1),
  display: z.string().min(1)
});

export const MedicationAdministrationQuantitySchema = z.object({
  value: z.number().positive(),
  unit: z.string().min(1),
  system: z.string().min(1).optional(),
  code: z.string().min(1).optional()
});

export const MedicationAdministrationPerformerActorTypeSchema = z.enum([
  "Practitioner",
  "PractitionerRole",
  "Patient",
  "RelatedPerson",
  "Device"
]);

export const MedicationAdministrationPerformerSchema = z.object({
  actorType: MedicationAdministrationPerformerActorTypeSchema,
  actorId: z.string().min(1),
  function: MedicationAdministrationCodeSchema.optional()
});

export const MedicationAdministrationEffectivePeriodSchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional()
});

export const MedicationAdministrationDosageSchema = z.object({
  text: z.string().min(1).optional(),
  route: MedicationAdministrationCodeSchema.optional(),
  doseQuantity: MedicationAdministrationQuantitySchema.optional()
});

export const PatientMedicationAdministrationsParamsSchema = z.object({
  patientId: z.string().min(1)
});

export const MedicationAdministrationIdParamsSchema = z.object({
  id: z.string().min(1)
});

export const CreateMedicationAdministrationRequestSchema = z.object({
  encounterId: z.string().min(1).optional(),
  medicationRequestId: z.string().min(1).optional(),
  reasonConditionId: z.string().min(1).optional(),
  status: MedicationAdministrationStatusSchema,
  statusReason: MedicationAdministrationCodeSchema.optional(),
  category: MedicationAdministrationCategorySchema,
  medicationCode: MedicationAdministrationCodeSchema,
  effectivePeriod: MedicationAdministrationEffectivePeriodSchema,
  performers: z.array(MedicationAdministrationPerformerSchema).optional(),
  dosage: MedicationAdministrationDosageSchema.optional(),
  note: z.string().min(1).optional()
}).strict();

export type MedicationAdministrationStatus = z.infer<
  typeof MedicationAdministrationStatusSchema
>;
export type MedicationAdministrationCategory = z.infer<
  typeof MedicationAdministrationCategorySchema
>;
export type MedicationAdministrationPerformerActorType = z.infer<
  typeof MedicationAdministrationPerformerActorTypeSchema
>;
export type PatientMedicationAdministrationsParams = z.infer<
  typeof PatientMedicationAdministrationsParamsSchema
>;
export type MedicationAdministrationIdParams = z.infer<
  typeof MedicationAdministrationIdParamsSchema
>;
export type CreateMedicationAdministrationRequest = z.infer<
  typeof CreateMedicationAdministrationRequestSchema
>;
