import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const workerBudgets = [
  {
    path: "apps/api/src/modules/record-transfer-delivery-attempts/record-transfer-delivery-worker.ts",
    maxLines: 30,
    role: "RecordTransfer delivery worker public API barrel"
  },
  {
    path: "apps/api/src/modules/record-transfer-delivery-attempts/record-transfer-delivery-worker.types.ts",
    maxLines: 80,
    role: "RecordTransfer delivery worker dependency and I/O contracts"
  },
  {
    path: "apps/api/src/modules/record-transfer-delivery-attempts/record-transfer-delivery-worker.config.ts",
    maxLines: 40,
    role: "RecordTransfer delivery worker defaults and normalization"
  },
  {
    path: "apps/api/src/modules/record-transfer-delivery-attempts/record-transfer-delivery-format.ts",
    maxLines: 50,
    role: "RecordTransfer delivery worker preview truncation and error formatting"
  },
  {
    path: "apps/api/src/modules/record-transfer-delivery-attempts/record-transfer-fhir-bundle-sender.ts",
    maxLines: 80,
    role: "RecordTransfer delivery worker HTTP FHIR sender"
  },
  {
    path: "apps/api/src/modules/record-transfer-delivery-attempts/record-transfer-delivery-outcomes.ts",
    maxLines: 140,
    role: "RecordTransfer delivery worker delivery attempt, transfer and audit outcomes"
  },
  {
    path: "apps/api/src/modules/record-transfer-delivery-attempts/record-transfer-delivery-worker-processor.ts",
    maxLines: 170,
    role: "RecordTransfer delivery worker queue processor"
  },
  {
    path: "apps/api/src/modules/record-transfer-delivery-attempts/record-transfer-delivery-worker-scheduler.ts",
    maxLines: 80,
    role: "RecordTransfer delivery worker interval scheduler"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-retry-worker.ts",
    maxLines: 30,
    role: "RecordTransfer retry worker public API barrel"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-retry-worker.types.ts",
    maxLines: 60,
    role: "RecordTransfer retry worker dependency and I/O contracts"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-retry-worker.config.ts",
    maxLines: 40,
    role: "RecordTransfer retry worker defaults and normalization"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-retry-worker-outcomes.ts",
    maxLines: 130,
    role: "RecordTransfer retry worker lifecycle and audit outcomes"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-retry-worker-processor.ts",
    maxLines: 120,
    role: "RecordTransfer retry worker due transfer processor"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-retry-worker-scheduler.ts",
    maxLines: 80,
    role: "RecordTransfer retry worker interval scheduler"
  }
];

const deliveryWorkerRootPath = resolve(
  "apps/api/src/modules/record-transfer-delivery-attempts/record-transfer-delivery-worker.ts"
);
const deliveryWorkerProcessorPath = resolve(
  "apps/api/src/modules/record-transfer-delivery-attempts/record-transfer-delivery-worker-processor.ts"
);
const deliveryWorkerSenderPath = resolve(
  "apps/api/src/modules/record-transfer-delivery-attempts/record-transfer-fhir-bundle-sender.ts"
);
const deliveryWorkerOutcomesPath = resolve(
  "apps/api/src/modules/record-transfer-delivery-attempts/record-transfer-delivery-outcomes.ts"
);
const deliveryWorkerSchedulerPath = resolve(
  "apps/api/src/modules/record-transfer-delivery-attempts/record-transfer-delivery-worker-scheduler.ts"
);
const retryWorkerRootPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-retry-worker.ts"
);
const retryWorkerProcessorPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-retry-worker-processor.ts"
);
const retryWorkerOutcomesPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-retry-worker-outcomes.ts"
);
const retryWorkerSchedulerPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-retry-worker-scheduler.ts"
);

const workerReports = [];

for (const budget of workerBudgets) {
  const absolutePath = resolve(budget.path);

  try {
    await stat(absolutePath);
  } catch {
    throw new Error(`Worker composition file is missing: ${budget.path}`);
  }

  const source = await readFile(absolutePath, "utf8");
  const lineCount = source.split(/\r?\n/).length;

  if (lineCount > budget.maxLines) {
    throw new Error(
      `${budget.path} has ${lineCount} lines, over the ${budget.maxLines} line budget for ${budget.role}.`
    );
  }

  workerReports.push({
    path: budget.path,
    lineCount,
    maxLines: budget.maxLines,
    role: budget.role
  });
}

const deliveryWorkerRootSource = await readFile(deliveryWorkerRootPath, "utf8");
const deliveryWorkerProcessorSource = await readFile(
  deliveryWorkerProcessorPath,
  "utf8"
);
const deliveryWorkerSenderSource = await readFile(deliveryWorkerSenderPath, "utf8");
const deliveryWorkerOutcomesSource = await readFile(deliveryWorkerOutcomesPath, "utf8");
const deliveryWorkerSchedulerSource = await readFile(
  deliveryWorkerSchedulerPath,
  "utf8"
);
const retryWorkerRootSource = await readFile(retryWorkerRootPath, "utf8");
const retryWorkerProcessorSource = await readFile(retryWorkerProcessorPath, "utf8");
const retryWorkerOutcomesSource = await readFile(retryWorkerOutcomesPath, "utf8");
const retryWorkerSchedulerSource = await readFile(retryWorkerSchedulerPath, "utf8");

const requiredDeliveryWorkerRootExports = [
  "processQueuedRecordTransferDeliveries",
  "startRecordTransferDeliveryWorker",
  "defaultRecordTransferFhirBundleSender",
  "RecordTransferDeliveryWorkerDependencies"
];

for (const exportedName of requiredDeliveryWorkerRootExports) {
  if (!deliveryWorkerRootSource.includes(exportedName)) {
    throw new Error(
      `RecordTransfer delivery worker public API must re-export ${exportedName}.`
    );
  }
}

const requiredRetryWorkerRootExports = [
  "processDueRecordTransferRetries",
  "startRecordTransferRetryWorker",
  "RecordTransferRetryWorkerDependencies"
];

for (const exportedName of requiredRetryWorkerRootExports) {
  if (!retryWorkerRootSource.includes(exportedName)) {
    throw new Error(
      `RecordTransfer retry worker public API must re-export ${exportedName}.`
    );
  }
}

assertForbidden(deliveryWorkerRootSource, [
  {
    pattern: /\bfetch\b|\bsetInterval\b|\bAuditEvent\b|\bfindQueued\b|\bmarkFailed\b/,
    message:
      "record-transfer-delivery-worker.ts must stay a public API barrel, not runtime logic."
  }
]);

assertForbidden(deliveryWorkerProcessorSource, [
  {
    pattern: /\bfetch\b|\bsetInterval\b|\bAuditEvent\.record\b/,
    message:
      "Delivery queue processor must delegate HTTP sending, scheduling and audit creation to focused modules."
  }
]);

assertForbidden(deliveryWorkerSenderSource, [
  {
    pattern: /\bAuditEvent\b|\bbuildRecordTransferFhirBundle\b|\bmarkSucceeded\b|\bmarkFailed\b|\bfindQueued\b/,
    message:
      "FHIR sender must only post Bundle payloads and return transport results."
  }
]);

assertForbidden(deliveryWorkerOutcomesSource, [
  {
    pattern: /\bfetch\b|\bbuildRecordTransferFhirBundle\b|\bfindQueued\b|\bvalidateRecordTransferEndpointForDelivery\b/,
    message:
      "Delivery outcome module must only persist attempt, transfer and audit outcomes."
  }
]);

assertForbidden(deliveryWorkerSchedulerSource, [
  {
    pattern: /\bfetch\b|\bAuditEvent\b|\bbuildRecordTransferFhirBundle\b|\bmarkFailed\b/,
    message:
      "Delivery scheduler must only control interval execution and logging."
  }
]);

assertForbidden(retryWorkerRootSource, [
  {
    pattern:
      /\bsetInterval\b|\bAuditEvent\b|\bfindDueRetries\b|\bfindDueDeadLetters\b|\bmarkDeadLettered\b/,
    message:
      "record-transfer-retry-worker.ts must stay a public API barrel, not runtime logic."
  }
]);

assertForbidden(retryWorkerProcessorSource, [
  {
    pattern: /\bsetInterval\b|\bAuditEvent\.record\b|\bmarkDeadLettered\b|\b\.retry\(/,
    message:
      "Retry processor must delegate scheduling and lifecycle/audit outcomes to focused modules."
  }
]);

assertForbidden(retryWorkerOutcomesSource, [
  {
    pattern: /\bsetInterval\b|\bfindDueRetries\b|\bfindDueDeadLetters\b/,
    message:
      "Retry outcome module must only persist retry/dead-letter lifecycle changes and audit events."
  }
]);

assertForbidden(retryWorkerSchedulerSource, [
  {
    pattern:
      /\bAuditEvent\b|\bfindDueRetries\b|\bfindDueDeadLetters\b|\bmarkDeadLettered\b|\b\.retry\(/,
    message:
      "Retry scheduler must only control interval execution and logging."
  }
]);

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "API worker composition budget",
      workerReports
    },
    null,
    2
  )
);

function assertForbidden(source, rules) {
  for (const rule of rules) {
    if (rule.pattern.test(source)) {
      throw new Error(rule.message);
    }
  }
}
