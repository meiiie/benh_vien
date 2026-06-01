import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const testBudgets = [
  {
    path: "apps/api/src/server.auth.test.ts",
    maxLines: 1100,
    role: "API auth/RBAC integration scenarios outside login boundary"
  },
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
    maxLines: 780,
    role: "API patient access ABAC scenarios across clinical resources"
  },
  {
    path: "apps/api/src/server.audit-boundary.test.ts",
    maxLines: 480,
    role: "API audit access, AuditEvent FHIR export and integrity scenarios"
  },
  {
    path: "apps/api/src/server.fhir-boundary.test.ts",
    maxLines: 680,
    role: "API FHIR export, document reference and OperationOutcome scenarios"
  },
  {
    path: "apps/api/src/server.clinical-resources.test.ts",
    maxLines: 1030,
    role: "API provider directory and clinical resource scenarios"
  },
  {
    path: "apps/api/src/server.auth.test-support.ts",
    maxLines: 320,
    role: "Shared API auth boundary test support"
  }
];

const authBoundaryPath = resolve("apps/api/src/server.auth.test.ts");
const loginBoundaryPath = resolve("apps/api/src/server.auth.login.test.ts");
const runtimeBoundaryPath = resolve("apps/api/src/server.runtime.test.ts");
const startupConfigBoundaryPath = resolve("apps/api/src/server.startup-config.test.ts");
const patientRegistryBoundaryPath = resolve("apps/api/src/server.patient-registry.test.ts");
const patientAccessBoundaryPath = resolve("apps/api/src/server.patient-access.test.ts");
const auditBoundaryPath = resolve("apps/api/src/server.audit-boundary.test.ts");
const fhirBoundaryPath = resolve("apps/api/src/server.fhir-boundary.test.ts");
const clinicalResourcesBoundaryPath = resolve("apps/api/src/server.clinical-resources.test.ts");

const forbiddenAuthBoundaryPatterns = [
  {
    pattern: /\breadyAuthRouteServer\b/,
    message:
      "Auth route-only fixture belongs in server.auth.login.test.ts, not the broader server.auth.test.ts suite."
  },
  {
    pattern: /returns a signed demo session|rate limits repeated login attempts/,
    message:
      "Login and token boundary scenarios belong in server.auth.login.test.ts."
  },
  {
    pattern: /returns readiness checks|sets baseline HTTP security headers|returns redacted runtime metadata/,
    message:
      "Runtime, readiness and HTTP envelope scenarios belong in server.runtime.test.ts."
  },
  {
    pattern: /requires explicit CORS origins|rejects unsafe CORS origins|requires PostgreSQL repositories|rejects local-only public API base URLs/,
    message:
      "Startup and production configuration scenarios belong in server.startup-config.test.ts."
  },
  {
    pattern: /allows clinician treatment access to patient registry|blocks duplicate patient identifiers|merges a duplicate patient record/,
    message:
      "Patient registry, identifier conflict and merge scenarios belong in server.patient-registry.test.ts."
  },
  {
    pattern: /filters treatment patient access by the actor provider organization/,
    message:
      "Patient access ABAC scenarios across clinical resources belong in server.patient-access.test.ts."
  },
  {
    pattern: /allows auditor audit-purpose|exports patient audit trail|returns a verified audit integrity report/,
    message:
      "Audit access, AuditEvent FHIR export and integrity scenarios belong in server.audit-boundary.test.ts."
  },
  {
    pattern: /denies nurse FHIR export|returns a patient-record FHIR Bundle|FHIR OperationOutcome|rejects malformed DICOM UIDs/,
    message:
      "FHIR export, document reference and OperationOutcome scenarios belong in server.fhir-boundary.test.ts."
  },
  {
    pattern: /returns provider directory|lists workflow tasks|lists imaging studies|creates a medication administration/,
    message:
      "Provider directory and clinical resource scenarios belong in server.clinical-resources.test.ts."
  }
];

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
  /rejects local-only public API base URLs/
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

const testReports = [];

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

const authBoundarySource = await readFile(authBoundaryPath, "utf8");
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

for (const forbidden of forbiddenAuthBoundaryPatterns) {
  if (forbidden.pattern.test(authBoundarySource)) {
    throw new Error(forbidden.message);
  }
}

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
