import { z } from "zod";

export const ProviderDirectoryResourceTypeSchema = z.enum([
  "Organization",
  "Practitioner",
  "PractitionerRole",
  "Endpoint"
]);

export const ProviderDirectoryResourceParamsSchema = z.object({
  resourceType: ProviderDirectoryResourceTypeSchema,
  id: z.string().min(1)
});

export type ProviderDirectoryResourceType = z.infer<
  typeof ProviderDirectoryResourceTypeSchema
>;
export type ProviderDirectoryResourceParams = z.infer<
  typeof ProviderDirectoryResourceParamsSchema
>;
