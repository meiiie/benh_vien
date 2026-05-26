import { z } from "zod";

export const EncounterClassSchema = z.enum([
  "ambulatory",
  "inpatient",
  "emergency",
  "virtual"
]);

export const EncounterStatusSchema = z.enum([
  "planned",
  "in-progress",
  "finished",
  "cancelled",
  "entered-in-error"
]);

export const CreateEncounterRequestSchema = z.object({
  status: EncounterStatusSchema.optional(),
  class: EncounterClassSchema,
  serviceType: z.string().min(1),
  reasonText: z.string().min(1),
  departmentId: z.string().min(1).optional(),
  attendingPractitionerId: z.string().min(1),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional()
});

export const PatientEncountersParamsSchema = z.object({
  patientId: z.string().min(1)
});

export const EncounterIdParamsSchema = z.object({
  id: z.string().min(1)
});

export type EncounterClass = z.infer<typeof EncounterClassSchema>;
export type EncounterStatus = z.infer<typeof EncounterStatusSchema>;
export type CreateEncounterRequest = z.infer<typeof CreateEncounterRequestSchema>;
export type PatientEncountersParams = z.infer<typeof PatientEncountersParamsSchema>;
export type EncounterIdParams = z.infer<typeof EncounterIdParamsSchema>;
