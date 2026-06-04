import { randomUUID } from "node:crypto";

const requestIdHeaderName = "x-request-id";
const maxRequestIdLength = 128;
const requestIdPattern = /^[A-Za-z0-9._:-]+$/;

export function createRequestId(request: {
  readonly headers: Record<string, string | string[] | undefined>;
}): string {
  const requestId = request.headers[requestIdHeaderName];
  const candidate = Array.isArray(requestId) ? requestId[0] : requestId;

  return isSafeRequestId(candidate) ? candidate : randomUUID();
}

function isSafeRequestId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= maxRequestIdLength &&
    requestIdPattern.test(value)
  );
}
