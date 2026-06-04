import type { FastifyInstance } from "fastify";
import { registerApiDomainRoutes } from "./api-domain-routes.js";
import type { ApiRoutesDependencies } from "./api-route-dependencies.js";
import {
  registerApiSystemRoutes,
  type ApiSystemRoutesOptions
} from "./system-routes.js";

export type { ApiRoutesDependencies } from "./api-route-dependencies.js";

export async function registerApiRoutes(
  app: FastifyInstance,
  dependencies: ApiRoutesDependencies,
  runtime: ApiSystemRoutesOptions
): Promise<void> {
  await app.register(
    async (api) => {
      registerApiSystemRoutes(api, runtime);
      await registerApiDomainRoutes(api, dependencies);
    },
    {
      prefix: "/api/v1"
    }
  );
}
