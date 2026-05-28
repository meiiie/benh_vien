import { execFileSync } from "node:child_process";

const composeFiles = ["docker-compose.yml", "docker-compose.prod.yml"];
const labComposeFiles = ["infra/docker-compose.yml"];
const composeProfiles = ["interop", "imaging"];
const requiredApiEnvironmentKeys = [
  "BVS_API_DOCS_ENABLED",
  "BVS_HTTP_BODY_LIMIT_BYTES",
  "BVS_RECORD_TRANSFER_RETRY_WORKER_ENABLED",
  "BVS_RECORD_TRANSFER_RETRY_WORKER_INTERVAL_SECONDS",
  "BVS_RECORD_TRANSFER_RETRY_WORKER_LIMIT",
  "BVS_RECORD_TRANSFER_RETRY_WORKER_MAX_RETRY_COUNT",
  "BVS_RECORD_TRANSFER_RETRY_WORKER_RUN_IMMEDIATELY",
  "BVS_RECORD_TRANSFER_DELIVERY_WORKER_ENABLED",
  "BVS_RECORD_TRANSFER_DELIVERY_WORKER_INTERVAL_SECONDS",
  "BVS_RECORD_TRANSFER_DELIVERY_WORKER_LIMIT",
  "BVS_RECORD_TRANSFER_DELIVERY_WORKER_TIMEOUT_SECONDS",
  "BVS_RECORD_TRANSFER_DELIVERY_WORKER_RETRY_DELAY_SECONDS",
  "BVS_RECORD_TRANSFER_DELIVERY_WORKER_RUN_IMMEDIATELY"
];

const composeArgs = [
  ...composeProfiles.flatMap((profile) => ["--profile", profile]),
  ...composeFiles.flatMap((file) => ["-f", file])
];
const composeConfig = readComposeConfig(composeArgs);
const labComposeConfig = readComposeConfig([
  ...composeProfiles.flatMap((profile) => ["--profile", profile]),
  ...labComposeFiles.flatMap((file) => ["-f", file])
]);
const apiEnvironment = composeConfig.services?.api?.environment;
const apiPorts = composeConfig.services?.api?.ports ?? [];
const webPorts = composeConfig.services?.web?.ports ?? [];
const runtimeImages = collectRuntimeImages(composeConfig);
const labRuntimeImages = collectRuntimeImages(labComposeConfig);

if (!apiEnvironment || typeof apiEnvironment !== "object") {
  throw new Error("Expected docker compose service api to expose an environment map.");
}

if (apiPorts.length > 0) {
  throw new Error("Production compose must not publish the API service directly; expose it through the web edge only.");
}

if (webPorts.length === 0) {
  throw new Error("Production compose must publish the web edge service.");
}

const missingKeys = requiredApiEnvironmentKeys.filter(
  (key) => !Object.hasOwn(apiEnvironment, key)
);

if (missingKeys.length > 0) {
  throw new Error(
    `API service is missing runtime environment passthrough: ${missingKeys.join(", ")}`
  );
}

const mutableImages = [
  ...findMutableImages(runtimeImages, composeFiles),
  ...findMutableImages(labRuntimeImages, labComposeFiles)
];

if (mutableImages.length > 0) {
  throw new Error(
    `Docker compose runtime images must be pinned; found mutable image references: ${mutableImages
      .map(({ serviceName, image, reason }) => `${serviceName}=${image} (${reason})`)
      .join(", ")}`
  );
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "Docker compose API runtime environment, production exposure and image pinning",
      composeFiles,
      labComposeFiles,
      composeProfiles,
      requiredApiEnvironmentKeys,
      apiPublishedPorts: apiPorts.length,
      webPublishedPorts: webPorts.length,
      pinnedRuntimeImages: runtimeImages,
      pinnedLabRuntimeImages: labRuntimeImages
    },
    null,
    2
  )
);

function readComposeConfig(args) {
  const rawConfig = execFileSync("docker", ["compose", ...args, "config", "--format", "json"], {
    encoding: "utf8"
  });

  return JSON.parse(rawConfig);
}

function collectRuntimeImages(composeConfig) {
  return Object.entries(composeConfig.services ?? {})
    .flatMap(([serviceName, service]) =>
      typeof service?.image === "string"
        ? [{ serviceName, image: service.image }]
        : []
    )
    .sort((left, right) => left.serviceName.localeCompare(right.serviceName));
}

function findMutableImages(images, sourceFiles) {
  return images.flatMap(({ serviceName, image }) => {
    const reason = getMutableImageReason(image);
    return reason ? [{ serviceName, image, reason, sourceFiles }] : [];
  });
}

function getMutableImageReason(image) {
  const digestIndex = image.indexOf("@");
  const imageWithoutDigest = digestIndex >= 0 ? image.slice(0, digestIndex) : image;
  const hasDigest = digestIndex >= 0;
  const lastSlashIndex = imageWithoutDigest.lastIndexOf("/");
  const lastColonIndex = imageWithoutDigest.lastIndexOf(":");
  const hasTag = lastColonIndex > lastSlashIndex;

  if (!hasTag && !hasDigest) {
    return "missing explicit tag or digest";
  }

  if (!hasTag) {
    return undefined;
  }

  const tag = imageWithoutDigest.slice(lastColonIndex + 1);
  if (tag === "latest" || tag.startsWith("latest-")) {
    return `mutable tag '${tag}'`;
  }

  return undefined;
}
