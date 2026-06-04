import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const codeownersPath = resolve(".github/CODEOWNERS");
const pullRequestTemplatePath = resolve(".github/pull_request_template.md");
const bugReportTemplatePath = resolve(".github/ISSUE_TEMPLATE/bug_report.md");
const featureRequestTemplatePath = resolve(".github/ISSUE_TEMPLATE/feature_request.md");

const codeowners = await readFile(codeownersPath, "utf8");
const pullRequestTemplate = await readFile(pullRequestTemplatePath, "utf8");
const bugReportTemplate = await readFile(bugReportTemplatePath, "utf8");
const featureRequestTemplate = await readFile(featureRequestTemplatePath, "utf8");
const normalizedPullRequestTemplate = stripVietnameseMarks(pullRequestTemplate).toLowerCase();
const normalizedBugReportTemplate = stripVietnameseMarks(bugReportTemplate).toLowerCase();
const normalizedFeatureRequestTemplate =
  stripVietnameseMarks(featureRequestTemplate).toLowerCase();

const requiredCodeownerPatterns = [
  "*",
  "/packages/domain/",
  "/packages/contracts/",
  "/apps/api/",
  "/apps/web/",
  "/migrations/",
  "/.github/",
  "/scripts/harness/",
  "/docker-compose.yml",
  "/docker-compose.dev.yml",
  "/docker-compose.prod.yml",
  "/infra/",
  "/docs/STANDARDS.md",
  "/docs/SECURITY.md",
  "/docs/runbooks/"
];

const codeownerEntries = codeowners
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.length > 0 && !line.startsWith("#"));

const missingCodeownerPatterns = requiredCodeownerPatterns.filter(
  (pattern) => !codeownerEntries.some((line) => line.startsWith(`${pattern} `))
);

if (missingCodeownerPatterns.length > 0) {
  throw new Error(
    `CODEOWNERS is missing required review boundaries: ${missingCodeownerPatterns.join(", ")}`
  );
}

const requiredPullRequestTemplatePhrases = [
  { label: "full CI checklist", phrase: "pnpm run ci", mode: "raw" },
  { label: "API contract impact", phrase: "API/contract", mode: "raw" },
  { label: "Domain DDD impact", phrase: "Domain/DDD", mode: "raw" },
  { label: "Docker DevOps impact", phrase: "Docker/DevOps", mode: "raw" },
  {
    label: "sensitive data impact",
    phrase: "bao mat/du lieu nhay cam",
    mode: "normalized"
  },
  {
    label: "healthcare compliance note",
    phrase: "ghi chu y te/tuan thu",
    mode: "normalized"
  },
  { label: "FHIR prompt", phrase: "FHIR", mode: "raw" },
  { label: "DICOM prompt", phrase: "DICOM", mode: "raw" },
  { label: "audit prompt", phrase: "audit", mode: "raw" },
  { label: "authorization prompt", phrase: "phan quyen", mode: "normalized" },
  { label: "residual risk prompt", phrase: "rui ro con lai", mode: "normalized" }
];

const missingPullRequestTemplatePhrases = requiredPullRequestTemplatePhrases.filter(
  ({ phrase, mode }) =>
    mode === "normalized"
      ? !normalizedPullRequestTemplate.includes(phrase)
      : !pullRequestTemplate.includes(phrase)
);

if (missingPullRequestTemplatePhrases.length > 0) {
  throw new Error(
    `Pull request template is missing required healthcare review prompts: ${missingPullRequestTemplatePhrases
      .map(({ label }) => label)
      .join(", ")}`
  );
}

const requiredIssueTemplatePhrases = [
  {
    label: "no real patient data warning",
    phrase: "khong dua du lieu benh nhan that"
  },
  {
    label: "de-identification reminder",
    phrase: "an danh"
  },
  {
    label: "secret warning",
    phrase: "secret"
  }
];

for (const { name, content } of [
  { name: "bug report", content: normalizedBugReportTemplate },
  { name: "feature request", content: normalizedFeatureRequestTemplate }
]) {
  const missingIssueTemplatePhrases = requiredIssueTemplatePhrases.filter(
    ({ phrase }) => !content.includes(phrase)
  );

  if (missingIssueTemplatePhrases.length > 0) {
    throw new Error(
      `${name} issue template is missing healthcare data hygiene prompts: ${missingIssueTemplatePhrases
        .map(({ label }) => label)
        .join(", ")}`
    );
  }
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "Repository governance coverage",
      codeownersPath,
      pullRequestTemplatePath,
      issueTemplatePaths: [bugReportTemplatePath, featureRequestTemplatePath],
      requiredCodeownerPatterns,
      requiredPullRequestTemplatePhrases: requiredPullRequestTemplatePhrases.map(
        ({ label }) => label
      ),
      requiredIssueTemplatePhrases: requiredIssueTemplatePhrases.map(({ label }) => label)
    },
    null,
    2
  )
);

function stripVietnameseMarks(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D");
}
