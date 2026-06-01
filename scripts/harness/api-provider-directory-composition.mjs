import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const providerDirectoryBudgets = [
  {
    path: "apps/api/src/modules/provider-directory/in-memory-provider-directory.repository.ts",
    maxLines: 40,
    role: "ProviderDirectory in-memory repository adapter"
  },
  {
    path: "apps/api/src/modules/provider-directory/provider-directory-seed.ts",
    maxLines: 320,
    role: "ProviderDirectory demo seed fixture"
  },
  {
    path: "apps/api/src/modules/provider-directory/create-provider-directory.repository.ts",
    maxLines: 40,
    role: "ProviderDirectory repository factory"
  }
];

const inMemoryRepositoryPath = resolve(
  "apps/api/src/modules/provider-directory/in-memory-provider-directory.repository.ts"
);
const seedPath = resolve("apps/api/src/modules/provider-directory/provider-directory-seed.ts");
const factoryPath = resolve(
  "apps/api/src/modules/provider-directory/create-provider-directory.repository.ts"
);

const reports = [];

for (const budget of providerDirectoryBudgets) {
  const absolutePath = resolve(budget.path);
  await stat(absolutePath);
  const source = await readFile(absolutePath, "utf8");
  const lineCount = source.split(/\r?\n/).length;

  if (lineCount > budget.maxLines) {
    throw new Error(
      `${budget.path} has ${lineCount} lines; keep it at or below ${budget.maxLines} so ${budget.role} stays focused.`
    );
  }

  reports.push({
    path: budget.path,
    lineCount,
    maxLines: budget.maxLines,
    role: budget.role
  });
}

const inMemoryRepositorySource = await readFile(inMemoryRepositoryPath, "utf8");
const seedSource = await readFile(seedPath, "utf8");
const factorySource = await readFile(factoryPath, "utf8");

assertIncludes(
  inMemoryRepositorySource,
  'from "./provider-directory-seed.js"',
  "In-memory ProviderDirectory repository must import the demo seed from provider-directory-seed.ts."
);
assertIncludes(
  factorySource,
  'from "./provider-directory-seed.js"',
  "ProviderDirectory repository factory must seed PostgreSQL and in-memory stores from the same seed module."
);
assertIncludes(
  factorySource,
  'from "./in-memory-provider-directory.repository.js"',
  "ProviderDirectory repository factory must keep the in-memory adapter import explicit."
);

assertForbidden(inMemoryRepositorySource, [
  {
    pattern:
      /\bProviderDirectory\.assemble\b|\borganizations:\s*\[|\bpractitioners:\s*\[|\bendpoints:\s*\[|\bpractitionerRoles:\s*\[/,
    message:
      "ProviderDirectory in-memory repository must not own seed fixture assembly or provider catalog arrays."
  },
  {
    pattern:
      /hospital-hai-phong-demo|hospital-hai-phong-referral|endpoint-fhir-hai-phong-demo|endpoint-fhir-hai-phong-referral|endpoint-pacs-hai-phong-demo|endpoint-lis-hai-phong-demo/,
    message:
      "ProviderDirectory in-memory repository must not embed demo hospital, FHIR, PACS or LIS identifiers."
  }
]);

assertForbidden(seedSource, [
  {
    pattern: /\bimplements ProviderDirectoryRepository\b|\bclass InMemoryProviderDirectoryRepository\b/,
    message:
      "ProviderDirectory seed module must not contain repository adapter behavior."
  }
]);

for (const requiredSeedFragment of [
  "export function createSeedProviderDirectory",
  "ProviderDirectory.assemble",
  "hospital-hai-phong-demo",
  "hospital-hai-phong-referral",
  "endpoint-fhir-hai-phong-demo",
  "endpoint-fhir-hai-phong-referral",
  "endpoint-pacs-hai-phong-demo",
  "endpoint-lis-hai-phong-demo",
  "system-hai-phong-referral-gateway"
]) {
  assertIncludes(
    seedSource,
    requiredSeedFragment,
    `ProviderDirectory seed module must keep ${requiredSeedFragment} so local demos cover hospital, FHIR, PACS and LIS interoperability.`
  );
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "API ProviderDirectory composition budget",
      reports
    },
    null,
    2
  )
);

function assertIncludes(source, expected, message) {
  if (!source.includes(expected)) {
    throw new Error(message);
  }
}

function assertForbidden(source, rules) {
  for (const rule of rules) {
    if (rule.pattern.test(source)) {
      throw new Error(rule.message);
    }
  }
}
