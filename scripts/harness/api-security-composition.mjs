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
  },
  {
    path: "apps/api/src/modules/access-control/access-context.ts",
    maxLines: 30,
    role: "Access control public API barrel"
  },
  {
    path: "apps/api/src/modules/access-control/access-context-http.ts",
    maxLines: 40,
    role: "Access control HTTP header and media negotiation helpers"
  },
  {
    path: "apps/api/src/modules/access-control/access-context-authenticated-actor.ts",
    maxLines: 40,
    role: "Access control authenticated actor identity reader"
  },
  {
    path: "apps/api/src/modules/access-control/access-context-reader.ts",
    maxLines: 70,
    role: "Access control actor context reader"
  },
  {
    path: "apps/api/src/modules/access-control/access-permission.ts",
    maxLines: 60,
    role: "Access control permission gate"
  },
  {
    path: "apps/api/src/modules/access-control/access-permission-responses.ts",
    maxLines: 130,
    role: "Access control permission error responses"
  },
  {
    path: "apps/api/src/modules/access-control/patient-record-access.ts",
    maxLines: 100,
    role: "Patient record ABAC access gate"
  },
  {
    path: "apps/api/src/modules/access-control/patient-record-access-responses.ts",
    maxLines: 120,
    role: "Patient record ABAC error responses"
  },
  {
    path: "apps/api/src/modules/auth/auth-session.ts",
    maxLines: 30,
    role: "Auth session public API barrel"
  },
  {
    path: "apps/api/src/modules/auth/auth-session.types.ts",
    maxLines: 40,
    role: "Auth session actor and token payload type contracts"
  },
  {
    path: "apps/api/src/modules/auth/auth-session-config.ts",
    maxLines: 70,
    role: "Auth session secret and token TTL policy"
  },
  {
    path: "apps/api/src/modules/auth/auth-session-codec.ts",
    maxLines: 60,
    role: "Auth session HMAC and base64url codec"
  },
  {
    path: "apps/api/src/modules/auth/auth-session-claims.ts",
    maxLines: 90,
    role: "Auth session actor claim and token lifetime validation"
  },
  {
    path: "apps/api/src/modules/auth/auth-session-issuer.ts",
    maxLines: 60,
    role: "Auth session access-token issuer"
  },
  {
    path: "apps/api/src/modules/auth/auth-session-verifier.ts",
    maxLines: 80,
    role: "Auth session access-token verifier"
  },
  {
    path: "apps/api/src/modules/auth/login-rate-limit.ts",
    maxLines: 30,
    role: "Login rate limiter public API barrel"
  },
  {
    path: "apps/api/src/modules/auth/login-rate-limit.types.ts",
    maxLines: 70,
    role: "Login rate limiter type contracts"
  },
  {
    path: "apps/api/src/modules/auth/login-rate-limit-config.ts",
    maxLines: 90,
    role: "Login rate limiter environment configuration"
  },
  {
    path: "apps/api/src/modules/auth/login-rate-limit-key.ts",
    maxLines: 20,
    role: "Login rate limiter hashed key builder"
  },
  {
    path: "apps/api/src/modules/auth/login-rate-limit-memory.ts",
    maxLines: 80,
    role: "Login rate limiter in-memory store"
  },
  {
    path: "apps/api/src/modules/auth/login-rate-limit-valkey.ts",
    maxLines: 160,
    role: "Login rate limiter Valkey store"
  },
  {
    path: "apps/api/src/modules/auth/login-rate-limit-factory.ts",
    maxLines: 40,
    role: "Login rate limiter environment factory"
  },
  {
    path: "apps/api/src/modules/audit-events/denied-access-audit.ts",
    maxLines: 70,
    role: "Denied access audit orchestration"
  },
  {
    path: "apps/api/src/modules/audit-events/denied-access-audit.types.ts",
    maxLines: 40,
    role: "Denied access audit payload type contract"
  },
  {
    path: "apps/api/src/modules/audit-events/denied-access-audit-policy.ts",
    maxLines: 80,
    role: "Denied access audit resource policy"
  },
  {
    path: "apps/api/src/modules/audit-events/denied-access-invalid-purpose-audit.ts",
    maxLines: 70,
    role: "Denied access invalid purpose-of-use audit writer"
  },
  {
    path: "apps/api/src/modules/audit-events/denied-access-payload-reader.ts",
    maxLines: 50,
    role: "Denied access response payload reader"
  },
  {
    path: "apps/api/src/modules/audit-events/denied-access-payload-parser.ts",
    maxLines: 110,
    role: "Denied access JSON and FHIR OperationOutcome parser"
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
const accessContextRootPath = resolve("apps/api/src/modules/access-control/access-context.ts");
const accessContextReaderPath = resolve(
  "apps/api/src/modules/access-control/access-context-reader.ts"
);
const accessPermissionPath = resolve("apps/api/src/modules/access-control/access-permission.ts");
const patientRecordAccessPath = resolve(
  "apps/api/src/modules/access-control/patient-record-access.ts"
);
const loginRateLimitRootPath = resolve("apps/api/src/modules/auth/login-rate-limit.ts");
const loginRateLimitConfigPath = resolve(
  "apps/api/src/modules/auth/login-rate-limit-config.ts"
);
const loginRateLimitKeyPath = resolve("apps/api/src/modules/auth/login-rate-limit-key.ts");
const loginRateLimitMemoryPath = resolve("apps/api/src/modules/auth/login-rate-limit-memory.ts");
const loginRateLimitValkeyPath = resolve("apps/api/src/modules/auth/login-rate-limit-valkey.ts");
const loginRateLimitFactoryPath = resolve(
  "apps/api/src/modules/auth/login-rate-limit-factory.ts"
);
const deniedAccessAuditRootPath = resolve(
  "apps/api/src/modules/audit-events/denied-access-audit.ts"
);
const deniedAccessAuditPolicyPath = resolve(
  "apps/api/src/modules/audit-events/denied-access-audit-policy.ts"
);
const deniedAccessInvalidPurposeAuditPath = resolve(
  "apps/api/src/modules/audit-events/denied-access-invalid-purpose-audit.ts"
);
const deniedAccessPayloadReaderPath = resolve(
  "apps/api/src/modules/audit-events/denied-access-payload-reader.ts"
);
const deniedAccessPayloadParserPath = resolve(
  "apps/api/src/modules/audit-events/denied-access-payload-parser.ts"
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
const accessContextRootSource = await readFile(accessContextRootPath, "utf8");
const accessContextReaderSource = await readFile(accessContextReaderPath, "utf8");
const accessPermissionSource = await readFile(accessPermissionPath, "utf8");
const patientRecordAccessSource = await readFile(patientRecordAccessPath, "utf8");
const loginRateLimitRootSource = await readFile(loginRateLimitRootPath, "utf8");
const loginRateLimitConfigSource = await readFile(loginRateLimitConfigPath, "utf8");
const loginRateLimitKeySource = await readFile(loginRateLimitKeyPath, "utf8");
const loginRateLimitMemorySource = await readFile(loginRateLimitMemoryPath, "utf8");
const loginRateLimitValkeySource = await readFile(loginRateLimitValkeyPath, "utf8");
const loginRateLimitFactorySource = await readFile(loginRateLimitFactoryPath, "utf8");
const deniedAccessAuditRootSource = await readFile(deniedAccessAuditRootPath, "utf8");
const deniedAccessAuditPolicySource = await readFile(deniedAccessAuditPolicyPath, "utf8");
const deniedAccessInvalidPurposeAuditSource = await readFile(
  deniedAccessInvalidPurposeAuditPath,
  "utf8"
);
const deniedAccessPayloadReaderSource = await readFile(
  deniedAccessPayloadReaderPath,
  "utf8"
);
const deniedAccessPayloadParserSource = await readFile(
  deniedAccessPayloadParserPath,
  "utf8"
);

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

const requiredAccessContextExports = [
  "readAuthenticatedActorIdentity",
  "readActorContext",
  "requirePermission",
  "requirePatientRecordAccess",
  "requirePatientRecordAccessByPatientId",
  "filterPatientsByAccess"
];

for (const exportedName of requiredAccessContextExports) {
  if (!accessContextRootSource.includes(exportedName)) {
    throw new Error(`Access control public API must re-export ${exportedName}.`);
  }
}

const requiredLoginRateLimitExports = [
  "createLoginRateLimiterFromEnv",
  "createLoginRateLimitKey",
  "createMemoryLoginRateLimiter",
  "createValkeyLoginRateLimiter",
  "LoginRateLimiter",
  "ValkeyLoginRateLimitClient"
];

for (const exportedName of requiredLoginRateLimitExports) {
  if (!loginRateLimitRootSource.includes(exportedName)) {
    throw new Error(`Login rate limiter public API must re-export ${exportedName}.`);
  }
}

const requiredDeniedAccessAuditExports = [
  "DeniedAccessPayload",
  "rememberDeniedAccessForAudit",
  "recordDeniedAccessAuditEvent"
];

for (const exportedName of requiredDeniedAccessAuditExports) {
  if (!deniedAccessAuditRootSource.includes(exportedName)) {
    throw new Error(`Denied access audit public API must re-export ${exportedName}.`);
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

assertForbidden(accessContextRootSource, [
  {
    pattern:
      /\bFastifyRequest\b|\bFastifyReply\b|\bcanAccess\b|\bcanAccessPatientRecord\b|\breadBearerToken\b|\bverifyAccessToken\b|\bsendFhirOperationOutcome\b/,
    message:
      "access-context.ts must stay a public API barrel, not access-control policy or HTTP response logic."
  }
]);

assertForbidden(accessContextReaderSource, [
  {
    pattern: /\bFastifyReply\b|\bcanAccess\b|\bcanAccessPatientRecord\b|\bsendFhirOperationOutcome\b/,
    message:
      "Access context reader must only derive actor context from trusted server-side inputs."
  }
]);

assertForbidden(accessPermissionSource, [
  {
    pattern:
      /\bPatientRepository\b|\bProviderDirectoryRepository\b|\bcanAccessPatientRecord\b|\bsendFhirOperationOutcome\b/,
    message:
      "Permission gate must not mix patient-record ABAC lookup or HTTP/FHIR response formatting."
  }
]);

assertForbidden(patientRecordAccessSource, [
  {
    pattern:
      /\breadBearerToken\b|\bverifyAccessToken\b|\breadActorContextResult\b|\bsendFhirOperationOutcome\b/,
    message:
      "Patient record ABAC gate must not parse sessions or format HTTP/FHIR responses directly."
  }
]);

assertForbidden(loginRateLimitRootSource, [
  {
    pattern: /\bprocess\.env\b|\bcreateClient\b|\bcreateHash\b|\beval\b|\bredis\.call\b/,
    message:
      "login-rate-limit.ts must stay a public API barrel, not env, hash or Valkey logic."
  }
]);

assertForbidden(loginRateLimitConfigSource, [
  {
    pattern: /\bcreateClient\b|\bcreateHash\b|\beval\b|\bredis\.call\b/,
    message:
      "Login rate-limit config must only resolve environment policy, not perform hashing or store I/O."
  }
]);

assertForbidden(loginRateLimitKeySource, [
  {
    pattern: /\bprocess\.env\b|\bcreateClient\b|\beval\b|\bredis\.call\b/,
    message:
      "Login rate-limit key builder must only hash stable request identity material."
  }
]);

assertForbidden(loginRateLimitMemorySource, [
  {
    pattern: /\bprocess\.env\b|\bcreateClient\b|\bcreateHash\b|\beval\b|\bredis\.call\b/,
    message:
      "Memory login rate limiter must stay local-state only, without env, hashing or Valkey logic."
  }
]);

assertForbidden(loginRateLimitValkeySource, [
  {
    pattern: /\bprocess\.env\b|\bcreateHash\b|\breadLoginRateLimitStore\b|\breadValkeyUrl\b/,
    message:
      "Valkey login rate limiter must not read environment or hash raw identity material directly."
  }
]);

assertForbidden(loginRateLimitFactorySource, [
  {
    pattern: /\bcreateClient\b|\bcreateHash\b|\beval\b|\bredis\.call\b/,
    message:
      "Login rate-limit factory must compose config and stores without owning store internals."
  }
]);

assertForbidden(deniedAccessAuditRootSource, [
  {
    pattern: /\bJSON\.parse\b|\breadPayloadText\b|\bparseOperationOutcome\b|\bAuditEvent\.record\b|\breadAuthenticatedActorIdentity\b/,
    message:
      "Denied access audit root must orchestrate audit writes without owning parsing or invalid-purpose audit internals."
  }
]);

assertForbidden(deniedAccessAuditPolicySource, [
  {
    pattern: /\bFastifyRequest\b|\bJSON\.parse\b|\bAuditEvent\.record\b|\bAuditEventRepository\b|\brecordAuditEvent\b/,
    message:
      "Denied access audit policy must only classify denied payloads and resource identity."
  }
]);

assertForbidden(deniedAccessInvalidPurposeAuditSource, [
  {
    pattern: /\bJSON\.parse\b|\bparseDeniedAccess\b|\binferDeniedAuditResourceType\b|\brecordAuditEvent\b/,
    message:
      "Invalid purpose-of-use audit writer must not parse payloads or infer generic denied resources."
  }
]);

assertForbidden(deniedAccessPayloadReaderSource, [
  {
    pattern: /\bAuditEvent\b|\bAuditEventRepository\b|\brecordAuditEvent\b|\breadAuthenticatedActorIdentity\b/,
    message:
      "Denied access payload reader must only remember parsed response payloads for later audit."
  }
]);

assertForbidden(deniedAccessPayloadParserSource, [
  {
    pattern: /\bFastifyRequest\b|\bAuditEvent\b|\bAuditEventRepository\b|\brecordAuditEvent\b|\breadAuthenticatedActorIdentity\b/,
    message:
      "Denied access payload parser must stay pure JSON/FHIR parsing without request or audit persistence."
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
