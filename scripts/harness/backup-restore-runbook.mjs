import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const runbookPath = resolve("docs/runbooks/BACKUP_RESTORE.md");
const packageJsonPath = resolve("package.json");
const ciWorkflowPath = resolve(".github/workflows/ci.yml");

const runbook = await readFile(runbookPath, "utf8");
const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
const ciWorkflow = await readFile(ciWorkflowPath, "utf8");

const requiredRunbookPatterns = [
  {
    label: "PostgreSQL custom-format backup",
    pattern: /pg_dump[\s\S]*--format=custom[\s\S]*postgres\.dump/
  },
  {
    label: "PostgreSQL restore path",
    pattern: /sha256sum -c[\s\S]*pg_restore[\s\S]*--clean[\s\S]*--if-exists[\s\S]*--single-transaction/
  },
  {
    label: "schema migration checksum verification",
    pattern: /schema_migrations[\s\S]*checksum_sha256[\s\S]*diff -u/
  },
  {
    label: "object storage mirroring",
    pattern: /mc mirror[\s\S]*wiiicare-documents/
  },
  {
    label: "RPO target",
    pattern: /\bRPO\b[\s\S]*24/
  },
  {
    label: "RTO target",
    pattern: /\bRTO\b[\s\S]*4/
  },
  {
    label: "retention guidance",
    pattern: /retention[\s\S]*daily 14[\s\S]*weekly 8[\s\S]*monthly 12/
  },
  {
    label: "offsite encrypted backup warning",
    pattern: /offsite[\s\S]*(Git|issue|chat|log)/
  },
  {
    label: "restore drill evidence",
    pattern: /\/health[\s\S]*\/ready[\s\S]*audit integrity/
  },
  {
    label: "production limitation disclosure",
    pattern: /job[\s\S]*backup[\s\S]*WORM\/append-only/
  }
];

const missingRunbookSections = requiredRunbookPatterns.filter(
  ({ pattern }) => !pattern.test(runbook)
);

if (missingRunbookSections.length > 0) {
  throw new Error(
    `Backup/restore runbook is missing required coverage: ${missingRunbookSections
      .map(({ label }) => label)
      .join(", ")}`
  );
}

const scripts = packageJson.scripts ?? {};

if (scripts["harness:backup-restore"] !== "node scripts/harness/backup-restore-runbook.mjs") {
  throw new Error(
    "package.json must expose harness:backup-restore for backup/restore runbook checks."
  );
}

if (!scripts.ci?.includes("pnpm run harness:backup-restore")) {
  throw new Error("package.json ci script must run harness:backup-restore.");
}

if (!ciWorkflow.includes("pnpm run ci")) {
  throw new Error("CI workflow must keep running the root CI script that includes backup/restore harness.");
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "Backup and restore runbook coverage",
      runbookPath,
      requiredCoverage: requiredRunbookPatterns.map(({ label }) => label)
    },
    null,
    2
  )
);
