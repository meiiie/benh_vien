import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const securityBudgets = [
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-callback-signature.ts",
    maxLines: 40,
    role: "RecordTransfer callback signature public API barrel"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-callback-signature.constants.ts",
    maxLines: 30,
    role: "RecordTransfer callback signature constants"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-callback-signature.types.ts",
    maxLines: 60,
    role: "RecordTransfer callback signature result and secret lookup types"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-callback-headers.ts",
    maxLines: 20,
    role: "RecordTransfer callback single-header normalization"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-callback-json.ts",
    maxLines: 40,
    role: "RecordTransfer callback canonical JSON serialization"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-callback-signature-builder.ts",
    maxLines: 50,
    role: "RecordTransfer callback HMAC signature builder"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-callback-secret.ts",
    maxLines: 140,
    role: "RecordTransfer callback secret and key-id lookup policy"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-callback-secret-validation.ts",
    maxLines: 140,
    role: "RecordTransfer callback secret JSON parsing and validation policy"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-callback-signature-verifier.ts",
    maxLines: 190,
    role: "RecordTransfer callback signature verification policy"
  }
];

const signatureRootPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-callback-signature.ts"
);
const signatureBuilderPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-callback-signature-builder.ts"
);
const signatureSecretPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-callback-secret.ts"
);
const signatureVerifierPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-callback-signature-verifier.ts"
);

const securityReports = [];

for (const budget of securityBudgets) {
  const absolutePath = resolve(budget.path);

  try {
    await stat(absolutePath);
  } catch {
    throw new Error(`Security composition file is missing: ${budget.path}`);
  }

  const source = await readFile(absolutePath, "utf8");
  const lineCount = source.split(/\r?\n/).length;

  if (lineCount > budget.maxLines) {
    throw new Error(
      `${budget.path} has ${lineCount} lines, over the ${budget.maxLines} line budget for ${budget.role}.`
    );
  }

  securityReports.push({
    path: budget.path,
    lineCount,
    maxLines: budget.maxLines,
    role: budget.role
  });
}

const signatureRootSource = await readFile(signatureRootPath, "utf8");
const signatureBuilderSource = await readFile(signatureBuilderPath, "utf8");
const signatureSecretSource = await readFile(signatureSecretPath, "utf8");
const signatureVerifierSource = await readFile(signatureVerifierPath, "utf8");

const requiredSignatureRootExports = [
  "recordTransferCallbackTimestampHeader",
  "recordTransferCallbackSignatureHeader",
  "recordTransferCallbackKeyIdHeader",
  "buildRecordTransferCallbackSignature",
  "assertRecordTransferCallbackSignatureConfiguration",
  "verifyRecordTransferCallbackSignature"
];

for (const exportedName of requiredSignatureRootExports) {
  if (!signatureRootSource.includes(exportedName)) {
    throw new Error(
      `RecordTransfer callback signature public API must re-export ${exportedName}.`
    );
  }
}

assertForbidden(signatureRootSource, [
  {
    pattern: /\bcreateHmac\b|\btimingSafeEqual\b|\bprocess\.env\b|\bJSON\.parse\b|\bDate\.parse\b/,
    message:
      "record-transfer-callback-signature.ts must stay a public API barrel, not signature logic."
  }
]);

assertForbidden(signatureBuilderSource, [
  {
    pattern:
      /\bprocess\.env\b|\bIncomingHttpHeaders\b|\btimingSafeEqual\b|\bDate\.parse\b|\breadCallbackSecret\b/,
    message:
      "Callback signature builder must only canonicalize payload and build an HMAC."
  }
]);

assertForbidden(signatureSecretSource, [
  {
    pattern:
      /\bcreateHmac\b|\btimingSafeEqual\b|\bDate\.parse\b|\brecordTransferCallbackSignatureHeader\b/,
    message:
      "Callback secret policy must not perform HMAC, timestamp or received-signature verification."
  }
]);

assertForbidden(signatureVerifierSource, [
  {
    pattern:
      /\bprocess\.env\.BVS_RECORD_TRANSFER\b|\bJSON\.parse\b|\bvalidateCallbackSecret\b|\bcreateHmac\b/,
    message:
      "Callback verifier must delegate secret lookup/config parsing and HMAC creation to focused modules."
  }
]);

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "API security composition budget",
      securityReports
    },
    null,
    2
  )
);

function assertForbidden(source, rules) {
  for (const rule of rules) {
    if (rule.pattern.test(source)) {
      throw new Error(rule.message);
    }
  }
}
