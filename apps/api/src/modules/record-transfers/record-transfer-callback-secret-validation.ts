import {
  callbackSecretEnv,
  callbackSecretsJsonEnv,
  minSecretLength
} from "./record-transfer-callback-signature.constants.js";

type CallbackSecretValidationError = {
  readonly error: string;
  readonly errorCode: string;
  readonly statusCode: 503;
};

type ParsedCallbackSecrets =
  | { readonly secrets: Record<string, string> }
  | CallbackSecretValidationError;

export function assertCallbackSecretsByKeyId(rawSecretsByKeyId: string): void {
  const parsedSecrets = parseCallbackSecretsByKeyId(rawSecretsByKeyId);

  if ("error" in parsedSecrets) {
    throw new Error(parsedSecrets.error);
  }

  for (const [keyId, secret] of Object.entries(parsedSecrets.secrets)) {
    if (!keyId.trim()) {
      throw new Error(`${callbackSecretsJsonEnv} phải dùng key id gateway không rỗng.`);
    }

    const secretValidation = validateCallbackSecret(
      secret.trim(),
      callbackSecretsJsonEnv
    );

    if (secretValidation) {
      throw new Error(secretValidation.error);
    }
  }
}

export function parseCallbackSecretsByKeyId(
  rawSecretsByKeyId: string
): ParsedCallbackSecrets {
  try {
    const parsed = JSON.parse(rawSecretsByKeyId) as unknown;

    if (!isValidSecretsObject(parsed)) {
      return invalidCallbackSecretsJson();
    }

    return {
      secrets: parsed as Record<string, string>
    };
  } catch {
    return invalidCallbackSecretsJson();
  }
}

export function validateCallbackSecret(
  secret: string,
  sourceEnvName: string
): CallbackSecretValidationError | undefined {
  if (secret.length < minSecretLength) {
    return {
      error: `${sourceEnvName} phải chứa secret dài tối thiểu ${minSecretLength} ký tự.`,
      errorCode: "RECORD_TRANSFER_CALLBACK_SIGNATURE_NOT_CONFIGURED",
      statusCode: 503
    };
  }

  if (process.env.NODE_ENV === "production" && isPlaceholderSecret(secret)) {
    return {
      error: `${sourceEnvName} không được dùng giá trị mẫu trong production.`,
      errorCode: "RECORD_TRANSFER_CALLBACK_SIGNATURE_NOT_CONFIGURED",
      statusCode: 503
    };
  }

  return undefined;
}

export function missingProductionSecretMessage(): string {
  return `${callbackSecretEnv} hoặc ${callbackSecretsJsonEnv} phải được cấu hình tối thiểu ${minSecretLength} ký tự trong production.`;
}

function invalidCallbackSecretsJson(): CallbackSecretValidationError {
  return {
    error: `${callbackSecretsJsonEnv} phải là JSON object ánh xạ key id gateway sang secret.`,
    errorCode: "RECORD_TRANSFER_CALLBACK_SIGNATURE_NOT_CONFIGURED",
    statusCode: 503
  };
}

function isValidSecretsObject(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length > 0 &&
    Object.values(value).every((nestedValue) => typeof nestedValue === "string")
  );
}

function isPlaceholderSecret(secret: string): boolean {
  const normalizedSecret = secret.toLowerCase();

  return normalizedSecret.includes("change-me") || normalizedSecret.includes("dev-only");
}
