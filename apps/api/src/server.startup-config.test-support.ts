import { expect } from "vitest";
import { buildServer } from "./server.js";
import { applyDefaultAuthBoundaryEnv } from "./server.auth.test-support.js";

export const productionPublicApiBaseUrl = "https://api.wiiicare.example.vn/api/v1";
export const productionCorsOrigin = "https://wiiicare.example.vn";

export function applyStartupConfigBoundaryEnv(): void {
  applyDefaultAuthBoundaryEnv();
}

export function configureProductionStartupDefaults(): void {
  process.env.NODE_ENV = "production";
  process.env.BVS_REPOSITORY = "postgres";
  process.env.BVS_PUBLIC_API_BASE_URL = productionPublicApiBaseUrl;
  process.env.BVS_CORS_ORIGINS = productionCorsOrigin;
}

export async function expectStartupConfigError(message: string): Promise<void> {
  await expect(buildServer({ logger: false })).rejects.toThrow(message);
}
