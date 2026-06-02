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
