import type { FastifyRequest } from "fastify";

export function acceptsFhirJson(request: FastifyRequest): boolean {
  const accept = request.headers.accept;
  const values: readonly string[] = Array.isArray(accept) ? accept : accept ? [accept] : [];

  return values.some((value) =>
    value
      .split(",")
      .map((part: string) => part.trim().split(";")[0]?.toLowerCase())
      .includes("application/fhir+json")
  );
}

export function hasFhirContentType(reply: {
  getHeader(name: string): number | string | string[] | undefined;
}): boolean {
  const contentType = reply.getHeader("content-type");

  if (Array.isArray(contentType)) {
    return contentType.some((value) => value.includes("application/fhir+json"));
  }

  return typeof contentType === "string" && contentType.includes("application/fhir+json");
}
