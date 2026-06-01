import type { FastifyRequest } from "fastify";

export function readHeader(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function acceptsFhirJson(request: FastifyRequest): boolean {
  return (
    readHeader(request.headers.accept)
      ?.split(",")
      .map((value) => value.trim().toLowerCase().split(";")[0])
      .includes("application/fhir+json") ?? false
  );
}

export function isPatientRecordWriteRequest(request: FastifyRequest): boolean {
  return !["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase());
}
