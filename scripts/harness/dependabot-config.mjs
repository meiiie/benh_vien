import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const dependabotConfigPath = resolve(".github/dependabot.yml");
const packageJsonPath = resolve("package.json");
const dependabotConfig = await readFile(dependabotConfigPath, "utf8");
const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));

const requiredPatterns = [
  {
    label: "Dependabot config version",
    pattern: /^version:\s*2\s*$/m
  },
  {
    label: "root npm workspace updates",
    pattern: /package-ecosystem:\s*"npm"[\s\S]*directory:\s*"\/"/
  },
  {
    label: "GitHub Actions workflow updates",
    pattern: /package-ecosystem:\s*"github-actions"[\s\S]*directory:\s*"\/"/
  },
  {
    label: "API Dockerfile base image updates",
    pattern: /package-ecosystem:\s*"docker"[\s\S]*directory:\s*"\/apps\/api"/
  },
  {
    label: "web Dockerfile base image updates",
    pattern: /package-ecosystem:\s*"docker"[\s\S]*directory:\s*"\/apps\/web"/
  },
  {
    label: "Vietnam operations timezone",
    pattern: /timezone:\s*"Asia\/Ho_Chi_Minh"/
  }
];

for (const { label, pattern } of requiredPatterns) {
  if (!pattern.test(dependabotConfig)) {
    throw new Error(`Dependabot config is missing required guard: ${label}.`);
  }
}

const scripts = packageJson.scripts ?? {};

if (scripts["security:audit"] !== "pnpm audit --audit-level high") {
  throw new Error(
    "package.json must keep security:audit as `pnpm audit --audit-level high`."
  );
}

if (!scripts.ci?.includes("pnpm run security:audit")) {
  throw new Error("package.json ci script must run security:audit before harness gates.");
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "Dependabot and dependency audit coverage",
      dependabotConfigPath,
      packageJsonPath,
      requiredCoverage: [
        ...requiredPatterns.map(({ label }) => label),
        "high-severity dependency audit script",
        "CI dependency audit gate"
      ]
    },
    null,
    2
  )
);
