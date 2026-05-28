export const recordTransferEndpointNotAllowedError =
  "RECORD_TRANSFER_ENDPOINT_NOT_ALLOWED";

export type RecordTransferEndpointPolicyResult =
  | {
      readonly allowed: true;
    }
  | {
      readonly allowed: false;
      readonly error: typeof recordTransferEndpointNotAllowedError;
      readonly message: string;
    };

export function validateRecordTransferEndpointForDelivery(input: {
  readonly endpointAddress: string;
  readonly nodeEnv?: string;
}): RecordTransferEndpointPolicyResult {
  const endpointAddress = input.endpointAddress.trim();
  let endpointUrl: URL;

  try {
    endpointUrl = new URL(endpointAddress);
  } catch {
    return rejectEndpoint("Endpoint FHIR đích phải là URL tuyệt đối hợp lệ.");
  }

  if (endpointUrl.protocol !== "http:" && endpointUrl.protocol !== "https:") {
    return rejectEndpoint("Endpoint FHIR đích phải dùng HTTP hoặc HTTPS.");
  }

  if ((input.nodeEnv ?? process.env.NODE_ENV) !== "production") {
    return {
      allowed: true
    };
  }

  if (endpointUrl.protocol !== "https:") {
    return rejectEndpoint(
      "Trong production, endpoint FHIR nhận hồ sơ bệnh án phải dùng HTTPS."
    );
  }

  if (isLoopbackOrLocalOnlyHostname(endpointUrl.hostname)) {
    return rejectEndpoint(
      "Trong production, endpoint FHIR nhận hồ sơ bệnh án không được dùng localhost, loopback hoặc địa chỉ chỉ dùng nội bộ máy."
    );
  }

  return {
    allowed: true
  };
}

function rejectEndpoint(message: string): RecordTransferEndpointPolicyResult {
  return {
    allowed: false,
    error: recordTransferEndpointNotAllowedError,
    message
  };
}

function isLoopbackOrLocalOnlyHostname(hostname: string): boolean {
  const normalizedHostname = hostname.toLowerCase();

  return (
    normalizedHostname === "localhost" ||
    normalizedHostname.endsWith(".localhost") ||
    normalizedHostname === "0.0.0.0" ||
    normalizedHostname === "::" ||
    normalizedHostname === "[::]" ||
    normalizedHostname === "::1" ||
    normalizedHostname === "[::1]" ||
    normalizedHostname.startsWith("127.")
  );
}
