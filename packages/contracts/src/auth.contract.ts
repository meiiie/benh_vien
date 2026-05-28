import { z } from "zod";

export const LoginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  role: z.enum(["clinician", "nurse", "auditor", "admin", "integration"]).optional()
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
