import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const allowedTrackedEnvFiles = new Set([
  ".env.example",
  ".env.dev.example",
  ".env.prod.example"
]);

const requiredGitignoreRules = [
  ".env",
  ".env.*",
  "!.env.example",
  "!.env.dev.example",
  "!.env.prod.example"
];

const secretPatterns = [
  {
    label: "private key block",
    pattern: /-----BEGIN (?:[A-Z0-9]+ )?PRIVATE KEY-----/
  },
  {
    label: "GitHub token",
    pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b/
  },
  {
    label: "GitHub fine-grained token",
    pattern: /\bgithub_pat_[A-Za-z0-9_]{50,}\b/
  },
  {
    label: "AWS access key",
    pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/
  },
  {
    label: "Google API key",
    pattern: /\bAIza[0-9A-Za-z_-]{35}\b/
  },
  {
    label: "Slack token",
    pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/
  },
  {
    label: "Stripe live secret key",
    pattern: /\bsk_live_[A-Za-z0-9]{24,}\b/
  }
];

const gitignorePath = ".gitignore";
const trackedFiles = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean);
const gitignore = await readFile(gitignorePath, "utf8");

const missingGitignoreRules = requiredGitignoreRules.filter(
  (rule) => !gitignore.split(/\r?\n/).includes(rule)
);

if (missingGitignoreRules.length > 0) {
  throw new Error(
    `.gitignore must keep local env files out of Git: ${missingGitignoreRules.join(", ")}`
  );
}

const disallowedEnvFiles = trackedFiles.filter(
  (file) => isEnvFile(file) && !allowedTrackedEnvFiles.has(file)
);

if (disallowedEnvFiles.length > 0) {
  throw new Error(
    `Only env example files may be tracked. Remove tracked env files: ${disallowedEnvFiles.join(", ")}`
  );
}

const findings = [];

for (const file of trackedFiles) {
  const buffer = await readFile(file);

  if (isBinary(buffer)) {
    continue;
  }

  const content = buffer.toString("utf8");
  const lines = content.split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
    for (const { label, pattern } of secretPatterns) {
      if (pattern.test(line)) {
        findings.push({
          file,
          line: index + 1,
          label
        });
      }
    }
  }
}

if (findings.length > 0) {
  throw new Error(
    `Potential committed secrets detected: ${findings
      .map(({ file, line, label }) => `${file}:${line} (${label})`)
      .join(", ")}`
  );
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "Tracked secret hygiene",
      trackedFileCount: trackedFiles.length,
      allowedTrackedEnvFiles: [...allowedTrackedEnvFiles],
      blockedSecretPatterns: secretPatterns.map(({ label }) => label)
    },
    null,
    2
  )
);

function isEnvFile(file) {
  return file === ".env" || file.startsWith(".env.");
}

function isBinary(buffer) {
  return buffer.includes(0);
}
