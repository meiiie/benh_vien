import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const releaseWorkflowPath = resolve(".github/workflows/release.yml");
const releaseWorkflow = await readFile(releaseWorkflowPath, "utf8");

const requiredPatterns = [
  {
    pattern: /tags:\s*\n\s*-\s*"v\*\.\*\.\*"/,
    message: "Release workflow must only run from semantic version tags."
  },
  {
    pattern: /permissions:\s*\n\s*contents:\s*read\s*\n\s*packages:\s*write/,
    message: "Release workflow must keep minimal permissions for reading source and writing GHCR packages."
  },
  {
    pattern: /persist-credentials:\s*false/,
    message: "Release workflow checkout must not persist git credentials."
  },
  {
    pattern: /Validate semantic version tag[\s\S]*\^v\[0-9\]\+\\\.\[0-9\]\+\\\.\[0-9\]\+\$/,
    message: "Release workflow must validate tags against vMAJOR.MINOR.PATCH before publishing images."
  },
  {
    pattern: /uses:\s*pnpm\/action-setup@v6[\s\S]*version:\s*10\.14\.0/,
    message: "Release workflow must set up the pinned pnpm version before running the release CI gate."
  },
  {
    pattern: /uses:\s*actions\/setup-node@v6[\s\S]*node-version:\s*"22"[\s\S]*cache:\s*pnpm/,
    message: "Release workflow must set up Node 22 with pnpm cache before running the release CI gate."
  },
  {
    pattern: /run:\s*pnpm install --frozen-lockfile/,
    message: "Release workflow must install dependencies with the frozen lockfile before publishing images."
  },
  {
    pattern: /run:\s*pnpm run ci/,
    message: "Release workflow must run the full CI gate before publishing images."
  },
  {
    pattern:
      /ghcr\.io\/\$\{\{\s*github\.repository\s*\}\}\/api:\$\{\{\s*steps\.version\.outputs\.value\s*\}\}/,
    message: "Release workflow must publish the API image with the exact semantic version tag."
  },
  {
    pattern:
      /ghcr\.io\/\$\{\{\s*github\.repository\s*\}\}\/web:\$\{\{\s*steps\.version\.outputs\.value\s*\}\}/,
    message: "Release workflow must publish the web image with the exact semantic version tag."
  }
];

for (const { pattern, message } of requiredPatterns) {
  if (!pattern.test(releaseWorkflow)) {
    throw new Error(message);
  }
}

const ciGateIndex = findRequiredIndex("run: pnpm run ci", "Release workflow must run pnpm run ci.");
const ghcrLoginIndex = findRequiredIndex("uses: docker/login-action@v4", "Release workflow must log in to GHCR.");
const apiImageBuildIndex = findRequiredIndex(
  "- name: Build and push API image",
  "Release workflow must build and push the API image."
);
const webImageBuildIndex = findRequiredIndex(
  "- name: Build and push Web image",
  "Release workflow must build and push the web image."
);

if (
  ciGateIndex > ghcrLoginIndex ||
  ciGateIndex > apiImageBuildIndex ||
  ciGateIndex > webImageBuildIndex
) {
  throw new Error(
    "Release workflow must run the full CI gate before GHCR login and image publish steps."
  );
}

const provenanceAttestationCount = countMatches(releaseWorkflow, /provenance:\s*mode=max/g);
const sbomAttestationCount = countMatches(releaseWorkflow, /sbom:\s*true/g);
const requiredOciLabelCounts = [
  {
    label: "org.opencontainers.image.source",
    pattern:
      /org\.opencontainers\.image\.source=https:\/\/github\.com\/\$\{\{\s*github\.repository\s*\}\}/g
  },
  {
    label: "org.opencontainers.image.revision",
    pattern: /org\.opencontainers\.image\.revision=\$\{\{\s*github\.sha\s*\}\}/g
  },
  {
    label: "org.opencontainers.image.version",
    pattern:
      /org\.opencontainers\.image\.version=\$\{\{\s*steps\.version\.outputs\.value\s*\}\}/g
  }
];

if (provenanceAttestationCount !== 2 || sbomAttestationCount !== 2) {
  throw new Error(
    "Release workflow must publish both API and web images with provenance: mode=max and sbom: true."
  );
}

for (const { label, pattern } of requiredOciLabelCounts) {
  const count = countMatches(releaseWorkflow, pattern);

  if (count !== 2) {
    throw new Error(
      `Release workflow must set ${label} on both API and web images; found ${count}.`
    );
  }
}

if (/:\s*latest\b|:latest\b/.test(releaseWorkflow)) {
  throw new Error(
    "Release workflow must not publish mutable :latest image tags; deploy by explicit semantic version."
  );
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "Release workflow immutable image tagging",
      releaseWorkflowPath,
      releaseCiGateBeforePublish: true,
      provenanceAttestationCount,
      sbomAttestationCount,
      requiredOciLabels: requiredOciLabelCounts.map(({ label }) => label),
      mutableLatestTagsAllowed: false
    },
    null,
    2
  )
);

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function findRequiredIndex(search, message) {
  const index = releaseWorkflow.indexOf(search);

  if (index === -1) {
    throw new Error(message);
  }

  return index;
}
