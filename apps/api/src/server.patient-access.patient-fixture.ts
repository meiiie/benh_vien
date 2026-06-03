import type { FastifyInstance } from "fastify";
import { expect } from "vitest";
import {
  jsonRequestHeaders,
  treatmentHeaders
} from "./server.auth.test-support.js";

export async function createOutsidePatient(
  app: FastifyInstance,
  adminToken: string
): Promise<string> {
  const createResponse = await app.inject({
    method: "POST",
    url: "/api/v1/patients",
    headers: jsonRequestHeaders(treatmentHeaders(adminToken)),
    payload: {
      identifiers: [
        {
          system: "urn:benh-vien-so:mrn",
          value: "MRN-OUTSIDE-TEST",
          type: "hospital-mrn"
        }
      ],
      fullName: "Outside Hospital Patient",
      gender: "unknown",
      managingOrganizationId: "hospital-outside-demo"
    }
  });

  expect(createResponse.statusCode).toBe(201);
  return createResponse.json().id as string;
}
