import { readdir, stat, readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";

const appPath = resolve("apps/web/src/App.tsx");
const webSrcPath = resolve("apps/web/src");
const allowedFetchModulePath = resolve("apps/web/src/api/clinicalApi.ts");
const requiredModules = [
  "apps/web/src/api/clinicalApi.ts",
  "apps/web/src/auth/authApi.ts",
  "apps/web/src/auth/demoLogin.ts",
  "apps/web/src/components/AppShell.tsx",
  "apps/web/src/config/demoClinicalDefaults.ts",
  "apps/web/src/features/audit/auditApi.ts",
  "apps/web/src/features/clinical-documents/clinicalDocumentApi.ts",
  "apps/web/src/features/clinical-records/clinicalRecordApi.ts",
  "apps/web/src/features/consents/consentApi.ts",
  "apps/web/src/features/patient-registry/patientRegistryApi.ts",
  "apps/web/src/features/platform/platformApi.ts",
  "apps/web/src/features/provider-directory/providerDirectoryApi.ts",
  "apps/web/src/features/record-transfers/recordTransferApi.ts",
  "apps/web/src/lib/auditFormatters.ts",
  "apps/web/src/lib/clinicalFormatters.ts",
  "apps/web/src/pages/LandingPage.tsx",
  "apps/web/src/pages/LoginPage.tsx",
  "apps/web/src/types/clinical.ts"
];
const maxAppLines = 8_000;

const appSource = await readFile(appPath, "utf8");
const appLineCount = appSource.split(/\r?\n/).length;
const directFetchPattern = /\bfetch\s*\(/;
const directClinicalApiRequestPattern = /\bclinicalApi\.requestJson\s*\(/;
const forbiddenAppApiPathPatterns = [
  {
    pattern: /[`'"]\/patients[`'"]/,
    message:
      "apps/web/src/App.tsx must use apps/web/src/features/patient-registry/patientRegistryApi.ts for patient registry HTTP routes."
  },
  {
    pattern: /[`'"]\/patients\/[^`'"]+\/(?:merge|fhir(?:-bundle|-document-bundle)?\b)/,
    message:
      "apps/web/src/App.tsx must use apps/web/src/features/patient-registry/patientRegistryApi.ts for patient merge and Patient FHIR HTTP routes."
  },
  {
    pattern:
      /[`'"]\/(?:patients\/[^`'"]+\/(?:encounters|allergy-intolerances|conditions|observations|medication-requests|medication-dispenses|medication-administrations|service-requests|workflow-tasks|procedures|diagnostic-reports|imaging-studies)\b|(?:encounters\/[^`'"]+\/(?:finish|fhir)|allergy-intolerances\/[^`'"]+\/fhir|conditions\/[^`'"]+\/fhir|observations\/[^`'"]+\/fhir|medication-requests\/[^`'"]+\/fhir|medication-dispenses\/[^`'"]+\/fhir|medication-administrations\/[^`'"]+\/fhir|service-requests\/[^`'"]+\/fhir|workflow-tasks\/[^`'"]+\/fhir|procedures\/[^`'"]+\/fhir|diagnostic-reports\/[^`'"]+\/fhir|imaging-studies\/[^`'"]+\/fhir))/,
    message:
      "apps/web/src/App.tsx must use apps/web/src/features/clinical-records/clinicalRecordApi.ts for clinical-record HTTP routes."
  },
  {
    pattern: /[`'"]\/(?:audit-events\b|patients\/[^`'"]+\/audit-(?:events|integrity)\b)/,
    message:
      "apps/web/src/App.tsx must use apps/web/src/features/audit/auditApi.ts for audit HTTP routes."
  },
  {
    pattern: /[`'"]\/(?:consents\b|patients\/[^`'"]+\/consents\b)/,
    message:
      "apps/web/src/App.tsx must use apps/web/src/features/consents/consentApi.ts for consent HTTP routes."
  },
  {
    pattern: /[`'"]\/(?:clinical-documents\b|patients\/[^`'"]+\/documents\b)/,
    message:
      "apps/web/src/App.tsx must use apps/web/src/features/clinical-documents/clinicalDocumentApi.ts for clinical-document HTTP routes."
  },
  {
    pattern: /[`'"]\/(?:record-transfers\b|patients\/[^`'"]+\/record-transfers\b)/,
    message:
      "apps/web/src/App.tsx must use apps/web/src/features/record-transfers/recordTransferApi.ts for record-transfer HTTP routes."
  }
];

if (appLineCount > maxAppLines) {
  throw new Error(
    `apps/web/src/App.tsx has ${appLineCount} lines; keep it at or below ${maxAppLines} by extracting pages, shell components, types, config, and pure helpers.`
  );
}

if (directClinicalApiRequestPattern.test(appSource)) {
  throw new Error(
    "apps/web/src/App.tsx must call feature/platform/auth API modules instead of clinicalApi.requestJson directly."
  );
}

for (const forbidden of forbiddenAppApiPathPatterns) {
  if (forbidden.pattern.test(appSource)) {
    throw new Error(forbidden.message);
  }
}

const webSourceFiles = await collectSourceFiles(webSrcPath);
const forbiddenFetchFiles = [];

for (const filePath of webSourceFiles) {
  if (filePath === allowedFetchModulePath) {
    continue;
  }

  const source = filePath === appPath ? appSource : await readFile(filePath, "utf8");

  if (directFetchPattern.test(source)) {
    forbiddenFetchFiles.push(relative(process.cwd(), filePath));
  }
}

if (forbiddenFetchFiles.length > 0) {
  throw new Error(
    `Frontend code must route HTTP through apps/web/src/api/clinicalApi.ts; direct fetch found in: ${forbiddenFetchFiles.join(", ")}`
  );
}

const missingModules = [];

for (const modulePath of requiredModules) {
  try {
    await stat(resolve(modulePath));
  } catch {
    missingModules.push(modulePath);
  }
}

if (missingModules.length > 0) {
  throw new Error(
    `Expected web composition modules to exist: ${missingModules.join(", ")}`
  );
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "Web app composition budget",
      appPath,
      appLineCount,
      maxAppLines,
      moduleCount: requiredModules.length
    },
    null,
    2
  )
);

async function collectSourceFiles(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = resolve(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(entryPath)));
      continue;
    }

    if (/\.(?:ts|tsx|js|jsx|mjs)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}
