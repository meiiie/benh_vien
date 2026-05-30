import { stat, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const appPath = resolve("apps/web/src/App.tsx");
const requiredModules = [
  "apps/web/src/api/clinicalApi.ts",
  "apps/web/src/auth/demoLogin.ts",
  "apps/web/src/components/AppShell.tsx",
  "apps/web/src/config/demoClinicalDefaults.ts",
  "apps/web/src/lib/auditFormatters.ts",
  "apps/web/src/lib/clinicalFormatters.ts",
  "apps/web/src/pages/LandingPage.tsx",
  "apps/web/src/pages/LoginPage.tsx",
  "apps/web/src/types/clinical.ts"
];
const maxAppLines = 9_000;

const appSource = await readFile(appPath, "utf8");
const appLineCount = appSource.split(/\r?\n/).length;
const forbiddenAppPatterns = [
  {
    pattern: /\bfetch\s*\(/,
    message:
      "apps/web/src/App.tsx must not call fetch directly; use apps/web/src/api/clinicalApi.ts for HTTP boundaries."
  }
];

if (appLineCount > maxAppLines) {
  throw new Error(
    `apps/web/src/App.tsx has ${appLineCount} lines; keep it at or below ${maxAppLines} by extracting pages, shell components, types, config, and pure helpers.`
  );
}

for (const forbidden of forbiddenAppPatterns) {
  if (forbidden.pattern.test(appSource)) {
    throw new Error(forbidden.message);
  }
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
