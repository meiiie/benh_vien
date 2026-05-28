import { execFileSync } from "node:child_process";

const composeFiles = ["docker-compose.yml", "docker-compose.prod.yml"];
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

const composeArgs = composeFiles.flatMap((file) => ["-f", file]);
const rawConfig = execFileSync(
  "docker",
  ["compose", ...composeArgs, "config", "--format", "json"],
  {
    encoding: "utf8"
  }
);
const composeConfig = JSON.parse(rawConfig);
const apiEnvironment = composeConfig.services?.api?.environment;
const apiPorts = composeConfig.services?.api?.ports ?? [];
const webPorts = composeConfig.services?.web?.ports ?? [];

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

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "Docker compose API runtime environment and production exposure",
      composeFiles,
      requiredApiEnvironmentKeys,
      apiPublishedPorts: apiPorts.length,
      webPublishedPorts: webPorts.length
    },
    null,
    2
  )
);
