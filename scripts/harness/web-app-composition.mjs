import { readdir, stat, readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";

const appPath = resolve("apps/web/src/App.tsx");
const webSrcPath = resolve("apps/web/src");
const allowedFetchModulePath = resolve("apps/web/src/api/clinicalApi.ts");
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
const directFetchPattern = /\bfetch\s*\(/;

if (appLineCount > maxAppLines) {
  throw new Error(
    `apps/web/src/App.tsx has ${appLineCount} lines; keep it at or below ${maxAppLines} by extracting pages, shell components, types, config, and pure helpers.`
  );
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
