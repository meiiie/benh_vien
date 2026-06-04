import type { FastifyInstance } from "fastify";
import { expect } from "vitest";
import {
  jsonRequestHeaders,
  treatmentHeaders
} from "./server.auth.test-support.js";

export async function createTreatmentResource(
  app: FastifyInstance,
  token: string,
  url: string,
  payload: Record<string, unknown>
): Promise<string> {
  const response = await app.inject({
    method: "POST",
    url,
    headers: jsonRequestHeaders(treatmentHeaders(token)),
    payload
  });

  expect(response.statusCode).toBe(201);
  return response.json().id as string;
}
