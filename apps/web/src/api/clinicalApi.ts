import type { AuthSession, PurposeOfUse } from "../types/appRuntime.js";

type ApiRequestOptions = {
  readonly purposeOfUse?: PurposeOfUse;
  readonly method?: string;
  readonly headers?: Record<string, string>;
  readonly body?: BodyInit | null;
  readonly json?: unknown;
};

type ClinicalApiClientConfig = {
  readonly baseUrl: string;
  readonly getSession: () => AuthSession | undefined;
};

export class ApiHttpError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(status: number, payload: unknown) {
    super(toHttpErrorMessage(status, payload));
    this.name = "ApiHttpError";
    this.status = status;
    this.payload = payload;
  }
}

export function createClinicalApiClient(config: ClinicalApiClientConfig) {
  async function request(path: string, options: ApiRequestOptions = {}): Promise<Response> {
    const headers = buildHeaders(options.purposeOfUse, options.headers);
    const hasJsonBody = options.json !== undefined;

    if (hasJsonBody) {
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
    }

    return fetch(`${config.baseUrl}${path}`, {
      method: options.method,
      headers,
      body: hasJsonBody ? JSON.stringify(options.json) : options.body
    });
  }

  async function requestJson<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const response = await request(path, options);

    if (!response.ok) {
      throw new ApiHttpError(response.status, await readResponsePayload(response));
    }

    return (await response.json()) as T;
  }

  function buildHeaders(
    purposeOfUse?: PurposeOfUse,
    headers: Record<string, string> = {}
  ): Record<string, string> {
    const nextHeaders = { ...headers };

    if (!purposeOfUse) {
      return nextHeaders;
    }

    const session = config.getSession();

    if (!session) {
      throw new Error("Chưa có phiên đăng nhập hợp lệ.");
    }

    nextHeaders.Authorization = `Bearer ${session.accessToken}`;
    nextHeaders["x-purpose-of-use"] = purposeOfUse;

    return nextHeaders;
  }

  return {
    buildHeaders,
    request,
    requestJson
  };
}

export type ClinicalApiClient = ReturnType<typeof createClinicalApiClient>;

export function isApiHttpError(error: unknown): error is ApiHttpError {
  return error instanceof ApiHttpError;
}

async function readResponsePayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("json")) {
    return response.json().catch(() => undefined);
  }

  return response.text().catch(() => undefined);
}

function toHttpErrorMessage(status: number, payload: unknown): string {
  const payloadMessage = extractPayloadMessage(payload);

  if (payloadMessage) {
    return payloadMessage;
  }

  return `API trả về HTTP ${status}`;
}

function extractPayloadMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") {
    return typeof payload === "string" && payload.trim().length > 0 ? payload : undefined;
  }

  const message = (payload as { readonly message?: unknown }).message;
  const error = (payload as { readonly error?: unknown }).error;
  const operationOutcomeMessage = extractOperationOutcomeMessage(payload);

  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }

  if (operationOutcomeMessage) {
    return operationOutcomeMessage;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  return undefined;
}

function extractOperationOutcomeMessage(payload: unknown): string | undefined {
  const outcome = asRecord(payload);

  if (outcome?.resourceType !== "OperationOutcome") {
    return undefined;
  }

  const firstIssue = Array.isArray(outcome.issue)
    ? asRecord(outcome.issue[0])
    : undefined;
  const details = asRecord(firstIssue?.details);

  return (
    getString(details?.text) ??
    getString(firstIssue?.diagnostics) ??
    extractFirstCodingCode(details?.coding)
  );
}

function extractFirstCodingCode(value: unknown): string | undefined {
  const firstCoding = Array.isArray(value) ? asRecord(value[0]) : undefined;

  return getString(firstCoding?.code);
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}
