export const callbackSecret =
  "wiiicare-record-transfer-callback-secret-for-unit-tests";
export const callbackKeyId = "gateway-hai-phong-referral";
export const recordTransferId = "record-transfer-demo-001";
export const callbackBody = {
  recipientOrganizationId: "hospital-hai-phong-referral",
  acknowledgementReference: "ack-record-transfer-callback-001"
};

const callbackSignatureEnvNames = [
  "NODE_ENV",
  "BVS_RECORD_TRANSFER_CALLBACK_SECRET",
  "BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON"
] as const;

type CallbackSignatureEnvName = (typeof callbackSignatureEnvNames)[number];

export type CallbackSignatureEnvSnapshot = Readonly<
  Record<CallbackSignatureEnvName, string | undefined>
>;

export function captureCallbackSignatureEnv(): CallbackSignatureEnvSnapshot {
  const snapshot = {} as Record<CallbackSignatureEnvName, string | undefined>;

  for (const name of callbackSignatureEnvNames) {
    snapshot[name] = process.env[name];
  }

  return snapshot;
}

export function restoreCallbackSignatureEnv(
  snapshot: CallbackSignatureEnvSnapshot
): void {
  for (const name of callbackSignatureEnvNames) {
    restoreEnv(name, snapshot[name]);
  }
}

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
