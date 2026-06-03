import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const testBudgets = [
  {
    path: "apps/api/src/server.auth.login.test.ts",
    maxLines: 550,
    role: "API login and token boundary scenarios"
  },
  {
    path: "apps/api/src/server.runtime.test.ts",
    maxLines: 520,
    role: "API runtime, readiness and HTTP envelope scenarios"
  },
  {
    path: "apps/api/src/server.startup-config.test.ts",
    maxLines: 260,
    role: "API startup and production configuration scenarios"
  },
  {
    path: "apps/api/src/server.patient-registry.test.ts",
    maxLines: 360,
    role: "API patient registry, identifier conflict and merge scenarios"
  },
  {
    path: "apps/api/src/server.patient-access.test.ts",
    maxLines: 650,
    role: "API patient access ABAC scenarios across clinical resources"
  },
  {
    path: "apps/api/src/server.audit-boundary.test.ts",
    maxLines: 480,
    role: "API audit access, AuditEvent FHIR export and integrity scenarios"
  },
  {
    path: "apps/api/src/server.fhir-boundary.test.ts",
    maxLines: 660,
    role: "API FHIR export, document reference and OperationOutcome scenarios"
  },
  {
    path: "apps/api/src/server.clinical-resources.test.ts",
    maxLines: 850,
    role: "API provider directory and clinical resource scenarios"
  },
  {
    path: "apps/api/src/server.consent-boundary.test.ts",
    maxLines: 300,
    role: "API consent creation, FHIR export and revocation scenarios"
  },
  {
    path: "apps/api/src/server.record-transfer-boundary.test.ts",
    maxLines: 780,
    role: "API record-transfer lifecycle, callback and consent-guard scenarios"
  },
  {
    path: "apps/api/src/server.auth.test-support.ts",
    maxLines: 320,
    role: "Shared API auth boundary test support"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-pool.test.ts",
    maxLines: 90,
    role: "PostgreSQL pool lifecycle unit scenarios"
  },
  {
    path: "apps/api/src/modules/auth/auth-password.test.ts",
    maxLines: 40,
    role: "Auth password verification unit scenarios"
  },
  {
    path: "apps/api/src/modules/auth/auth-session.test.ts",
    maxLines: 280,
    role: "Auth session token unit scenarios"
  },
  {
    path: "apps/api/src/modules/auth/bearer-token.test.ts",
    maxLines: 40,
    role: "Auth bearer-token parsing unit scenarios"
  },
  {
    path: "apps/api/src/modules/auth/login-rate-limit.test.ts",
    maxLines: 180,
    role: "Auth login rate-limit unit scenarios"
  },
  {
    path: "apps/api/src/modules/network/local-only-hostname.test.ts",
    maxLines: 70,
    role: "Network local-only hostname unit scenarios"
  },
  {
    path: "apps/api/src/modules/procedures/procedure-reference-validation.test.ts",
    maxLines: 140,
    role: "Procedure reference validation unit scenarios"
  },
  {
    path: "apps/api/src/modules/record-transfer-delivery-attempts/record-transfer-delivery-worker.test.ts",
    maxLines: 360,
    role: "RecordTransfer delivery worker unit scenarios"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-audit-metadata.test.ts",
    maxLines: 100,
    role: "RecordTransfer acknowledgement audit metadata unit scenarios"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-callback-signature.test.ts",
    maxLines: 320,
    role: "RecordTransfer callback signature unit scenarios"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-endpoint-policy.test.ts",
    maxLines: 100,
    role: "RecordTransfer endpoint policy unit scenarios"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-retry-worker.test.ts",
    maxLines: 280,
    role: "RecordTransfer retry worker unit scenarios"
  }
];

const retiredTestPaths = [
  {
    path: "apps/api/src/server.auth.test.ts",
    role: "legacy mixed auth/RBAC God suite"
  }
];

const loginBoundaryPath = resolve("apps/api/src/server.auth.login.test.ts");
const runtimeBoundaryPath = resolve("apps/api/src/server.runtime.test.ts");
const startupConfigBoundaryPath = resolve("apps/api/src/server.startup-config.test.ts");
const patientRegistryBoundaryPath = resolve("apps/api/src/server.patient-registry.test.ts");
const patientAccessBoundaryPath = resolve("apps/api/src/server.patient-access.test.ts");
const auditBoundaryPath = resolve("apps/api/src/server.audit-boundary.test.ts");
const fhirBoundaryPath = resolve("apps/api/src/server.fhir-boundary.test.ts");
const clinicalResourcesBoundaryPath = resolve("apps/api/src/server.clinical-resources.test.ts");
const consentBoundaryPath = resolve("apps/api/src/server.consent-boundary.test.ts");
const recordTransferBoundaryPath = resolve("apps/api/src/server.record-transfer-boundary.test.ts");

const requiredLoginBoundaryPatterns = [
  /returns a signed demo session/,
  /uses the configured auth token TTL/,
  /rate limits repeated login attempts/,
  /rejects invalid purpose-of-use headers/
];
const requiredRuntimeBoundaryPatterns = [
  /returns readiness checks/,
  /returns redacted runtime metadata/,
  /sets baseline HTTP security headers/,
  /returns a safe validation error envelope/
];
const requiredStartupConfigBoundaryPatterns = [
  /requires explicit CORS origins/,
  /rejects unsafe CORS origins/,
  /requires PostgreSQL repositories/,
  /rejects local-only public API base URLs/,
  /requires callback signature secrets at startup in production/
];
const requiredPatientRegistryBoundaryPatterns = [
  /allows clinician treatment access to patient registry/,
  /blocks duplicate patient identifiers/,
  /merges a duplicate patient record/
];
const requiredPatientAccessBoundaryPatterns = [
  /filters treatment patient access by the actor provider organization/,
  /patient-abac-denied-001/,
  /record-transfer-list-abac-denied-001/,
  /imaging-study-export-abac-denied-001/
];
const requiredAuditBoundaryPatterns = [
  /allows auditor audit-purpose patient registry context/,
  /allows auditor audit-purpose access to patient audit events/,
  /exports patient audit trail as a FHIR AuditEvent Bundle/,
  /returns a verified audit integrity report/
];
const requiredFhirBoundaryPatterns = [
  /serves FHIR CapabilityStatement metadata without a demo session/,
  /denies nurse FHIR export even with treatment purpose/,
  /returns a patient-record FHIR Bundle for treatment export/,
  /exports clinical document attachment metadata as FHIR DocumentReference/,
  /negotiates validation errors as FHIR OperationOutcome/,
  /rejects malformed DICOM UIDs/
];
const requiredClinicalResourcesBoundaryPatterns = [
  /returns provider directory and FHIR Endpoint resources/,
  /lists workflow tasks and exports them as FHIR Task/,
  /lists medication administrations and exports them as FHIR MedicationAdministration/,
  /lists imaging studies and exports them as FHIR ImagingStudy/
];
const requiredConsentBoundaryPatterns = [
  /lists active patient consents for treatment users/,
  /creates a patient consent and uses it for Bundle export/,
  /exports patient consent as FHIR Consent/,
  /revokes a patient consent and blocks later record sharing/
];
const requiredRecordTransferBoundaryPatterns = [
  /lists record transfer packages for a patient/,
  /moves a record transfer through sent and received milestones/,
  /accepts an operations acknowledgement callback for a sent record transfer/,
  /requires a valid HMAC signature for acknowledgement callbacks/,
  /records failed record transfer delivery and prepares a retry/,
  /denies Bundle export when consent does not match the recipient/
];

const testReports = [];

for (const retired of retiredTestPaths) {
  try {
    await stat(resolve(retired.path));
  } catch (error) {
    if (error && error.code === "ENOENT") {
      continue;
    }

    throw error;
  }

  throw new Error(`${retired.path} has been retired; keep ${retired.role} split by boundary.`);
}

for (const budget of testBudgets) {
  const absolutePath = resolve(budget.path);
  await stat(absolutePath);
  const source = await readFile(absolutePath, "utf8");
  const lineCount = source.split(/\r?\n/).length;

  if (lineCount > budget.maxLines) {
    throw new Error(
      `${budget.path} has ${lineCount} lines; keep it at or below ${budget.maxLines} so ${budget.role} does not become a maintenance bottleneck.`
    );
  }

  testReports.push({
    path: budget.path,
    lineCount,
    maxLines: budget.maxLines,
    role: budget.role
  });
}

const loginBoundarySource = await readFile(loginBoundaryPath, "utf8");
const runtimeBoundarySource = await readFile(runtimeBoundaryPath, "utf8");
const startupConfigBoundarySource = await readFile(startupConfigBoundaryPath, "utf8");
const patientRegistryBoundarySource = await readFile(patientRegistryBoundaryPath, "utf8");
const patientAccessBoundarySource = await readFile(patientAccessBoundaryPath, "utf8");
const auditBoundarySource = await readFile(auditBoundaryPath, "utf8");
const fhirBoundarySource = await readFile(fhirBoundaryPath, "utf8");
const clinicalResourcesBoundarySource = await readFile(
  clinicalResourcesBoundaryPath,
  "utf8"
);
const consentBoundarySource = await readFile(consentBoundaryPath, "utf8");
const recordTransferBoundarySource = await readFile(recordTransferBoundaryPath, "utf8");

for (const required of requiredLoginBoundaryPatterns) {
  if (!required.test(loginBoundarySource)) {
    throw new Error(
      "server.auth.login.test.ts must keep core login, token, rate-limit and purpose-of-use boundary scenarios."
    );
  }
}

for (const required of requiredRuntimeBoundaryPatterns) {
  if (!required.test(runtimeBoundarySource)) {
    throw new Error(
      "server.runtime.test.ts must keep core readiness, runtime metadata, security header and safe error envelope scenarios."
    );
  }
}

for (const required of requiredStartupConfigBoundaryPatterns) {
  if (!required.test(startupConfigBoundarySource)) {
    throw new Error(
      "server.startup-config.test.ts must keep core CORS, repository, public API URL and production startup validation scenarios."
    );
  }
}

for (const required of requiredPatientRegistryBoundaryPatterns) {
  if (!required.test(patientRegistryBoundarySource)) {
    throw new Error(
      "server.patient-registry.test.ts must keep core patient registry access, identifier conflict and merge scenarios."
    );
  }
}

for (const required of requiredPatientAccessBoundaryPatterns) {
  if (!required.test(patientAccessBoundarySource)) {
    throw new Error(
      "server.patient-access.test.ts must keep patient-scope ABAC denials across list, read and FHIR export scenarios."
    );
  }
}

for (const required of requiredAuditBoundaryPatterns) {
  if (!required.test(auditBoundarySource)) {
    throw new Error(
      "server.audit-boundary.test.ts must keep audit-purpose access, AuditEvent FHIR export and audit integrity scenarios."
    );
  }
}

for (const required of requiredFhirBoundaryPatterns) {
  if (!required.test(fhirBoundarySource)) {
    throw new Error(
      "server.fhir-boundary.test.ts must keep FHIR Bundle, DocumentReference, OperationOutcome and FHIR validation scenarios."
    );
  }
}

for (const required of requiredClinicalResourcesBoundaryPatterns) {
  if (!required.test(clinicalResourcesBoundarySource)) {
    throw new Error(
      "server.clinical-resources.test.ts must keep provider directory, workflow, medication and imaging resource scenarios."
    );
  }
}

for (const required of requiredConsentBoundaryPatterns) {
  if (!required.test(consentBoundarySource)) {
    throw new Error(
      "server.consent-boundary.test.ts must keep consent listing, creation, FHIR export and revocation scenarios."
    );
  }
}

for (const required of requiredRecordTransferBoundaryPatterns) {
  if (!required.test(recordTransferBoundarySource)) {
    throw new Error(
      "server.record-transfer-boundary.test.ts must keep record-transfer lifecycle, callback, retry and consent-guard scenarios."
    );
  }
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "API test composition budget",
      testReports
    },
    null,
    2
  )
);
