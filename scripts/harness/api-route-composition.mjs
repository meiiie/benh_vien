import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const routeBudgets = [
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-routes.ts",
    maxLines: 80,
    role: "RecordTransfer route composition root"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-creation-routes.ts",
    maxLines: 160,
    role: "RecordTransfer creation policy and command adapter"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-command-routes.ts",
    maxLines: 340,
    role: "RecordTransfer send, receive, fail and retry commands"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-routes.ts",
    maxLines: 220,
    role: "RecordTransfer acknowledgement callback adapter"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-query-routes.ts",
    maxLines: 180,
    role: "RecordTransfer query and read-model routes"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-fhir-routes.ts",
    maxLines: 120,
    role: "RecordTransfer FHIR Task export route"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-route-access.ts",
    maxLines: 80,
    role: "RecordTransfer patient access helper"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-route-helpers.ts",
    maxLines: 180,
    role: "RecordTransfer route helper functions"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-delivery-attempt-route-helpers.ts",
    maxLines: 140,
    role: "RecordTransfer delivery attempt route helper functions"
  }
];

const recordTransferRoutesPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-routes.ts"
);
const forbiddenRecordTransferRoutePatterns = [
  {
    pattern: /\bCreateRecordTransferRequestSchema\b/,
    message:
      "RecordTransfer creation policy belongs in record-transfer-creation-routes.ts."
  },
  {
    pattern:
      /\bMarkRecordTransfer(?:Sent|Received|Failed)RequestSchema\b|\bRetryRecordTransferRequestSchema\b/,
    message:
      "RecordTransfer lifecycle commands belong in record-transfer-command-routes.ts."
  },
  {
    pattern: /\bRecordTransferAcknowledgementCallbackRequestSchema\b/,
    message:
      "RecordTransfer acknowledgement callbacks belong in record-transfer-acknowledgement-routes.ts."
  },
  {
    pattern: /\bvalidateRecordTransferEndpointForDelivery\b/,
    message:
      "Endpoint delivery policy should stay with creation/send command route modules."
  },
  {
    pattern: /\bqueueRecordTransferDeliveryAttempt\b/,
    message:
      "Delivery attempt queueing should stay with record-transfer-command-routes.ts."
  }
];
const requiredRecordTransferRegistrations = [
  "registerRecordTransferQueryRoutes",
  "registerRecordTransferCreationRoutes",
  "registerRecordTransferCommandRoutes",
  "registerRecordTransferAcknowledgementRoutes",
  "registerRecordTransferFhirRoutes"
];

const routeReports = [];

for (const budget of routeBudgets) {
  const absolutePath = resolve(budget.path);
  await stat(absolutePath);
  const source = await readFile(absolutePath, "utf8");
  const lineCount = source.split(/\r?\n/).length;

  if (lineCount > budget.maxLines) {
    throw new Error(
      `${budget.path} has ${lineCount} lines; keep it at or below ${budget.maxLines} so ${budget.role} does not become a God route.`
    );
  }

  routeReports.push({
    path: budget.path,
    lineCount,
    maxLines: budget.maxLines,
    role: budget.role
  });
}

const recordTransferRoutesSource = await readFile(recordTransferRoutesPath, "utf8");

for (const forbidden of forbiddenRecordTransferRoutePatterns) {
  if (forbidden.pattern.test(recordTransferRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredRecordTransferRegistrations) {
  if (!recordTransferRoutesSource.includes(registration)) {
    throw new Error(
      `RecordTransfer root routes must register ${registration} so lifecycle-specific route modules remain wired.`
    );
  }
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "API route composition budget",
      routeReports
    },
    null,
    2
  )
);
