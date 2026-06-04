import type { FastifyInstance } from "fastify";
import {
  registerApiRuntimeRoutes,
  type ApiSystemRoutesOptions
} from "./system-api-runtime-routes.js";
import { registerHealthRoutes } from "./system-health-routes.js";
import {
  registerReadinessRoutes,
  type SystemRoutesOptions
} from "./system-readiness-routes.js";

export type { ApiSystemRoutesOptions } from "./system-api-runtime-routes.js";
export type { SystemRoutesOptions } from "./system-readiness-routes.js";

export function registerSystemRoutes(
  app: FastifyInstance,
  options: SystemRoutesOptions
): void {
  registerHealthRoutes(app);
  registerReadinessRoutes(app, options);
}

export function registerApiSystemRoutes(
  api: FastifyInstance,
  options: ApiSystemRoutesOptions
): void {
  registerApiRuntimeRoutes(api, options);
}
