import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const domainBudgets = [
  {
    path: "packages/domain/src/record-transfer/record-transfer.ts",
    maxLines: 650,
    role: "RecordTransfer aggregate behavior"
  },
  {
    path: "packages/domain/src/record-transfer/record-transfer.types.ts",
    maxLines: 160,
    role: "RecordTransfer status, snapshot and command input types"
  },
  {
    path: "packages/domain/src/provider-directory/provider-directory.ts",
    maxLines: 540,
    role: "ProviderDirectory aggregate behavior"
  },
  {
    path: "packages/domain/src/provider-directory/provider-directory.types.ts",
    maxLines: 190,
    role: "ProviderDirectory snapshot, coding, telecom and endpoint type definitions"
  }
];

const recordTransferAggregatePath = resolve(
  "packages/domain/src/record-transfer/record-transfer.ts"
);
const recordTransferTypesPath = resolve(
  "packages/domain/src/record-transfer/record-transfer.types.ts"
);
const providerDirectoryAggregatePath = resolve(
  "packages/domain/src/provider-directory/provider-directory.ts"
);
const providerDirectoryTypesPath = resolve(
  "packages/domain/src/provider-directory/provider-directory.types.ts"
);

const domainReports = [];

for (const budget of domainBudgets) {
  const absolutePath = resolve(budget.path);
  await stat(absolutePath);
  const source = await readFile(absolutePath, "utf8");
  const lineCount = source.split(/\r?\n/).length;

  if (lineCount > budget.maxLines) {
    throw new Error(
      `${budget.path} has ${lineCount} lines; keep it at or below ${budget.maxLines} so ${budget.role} stays maintainable.`
    );
  }

  domainReports.push({
    path: budget.path,
    lineCount,
    maxLines: budget.maxLines,
    role: budget.role
  });
}

const aggregateSource = await readFile(recordTransferAggregatePath, "utf8");
const typesSource = await readFile(recordTransferTypesPath, "utf8");
const providerDirectoryAggregateSource = await readFile(
  providerDirectoryAggregatePath,
  "utf8"
);
const providerDirectoryTypesSource = await readFile(providerDirectoryTypesPath, "utf8");

for (const forbidden of [
  /export type RecordTransferStatus/,
  /export type RecordTransferSnapshot/,
  /const recordTransferStatuses/
]) {
  if (forbidden.test(aggregateSource)) {
    throw new Error(
      "RecordTransfer type declarations and status sets belong in record-transfer.types.ts, not the aggregate file."
    );
  }
}

for (const required of [
  /export type RecordTransferStatus/,
  /export type RecordTransferSnapshot/,
  /export type CreateRecordTransferInput/,
  /export const recordTransferStatuses/
]) {
  if (!required.test(typesSource)) {
    throw new Error(
      "record-transfer.types.ts must keep RecordTransfer status, snapshot, command input and status-set definitions."
    );
  }
}

if (!/from "\.\/record-transfer\.types\.js"/.test(aggregateSource)) {
  throw new Error("RecordTransfer aggregate must depend on record-transfer.types.ts for shared types.");
}

for (const forbidden of [
  /export type ProviderDirectorySnapshot/,
  /export type ProviderOrganizationType/,
  /const providerOrganizationTypes/
]) {
  if (forbidden.test(providerDirectoryAggregateSource)) {
    throw new Error(
      "ProviderDirectory type declarations and provider code sets belong in provider-directory.types.ts, not the aggregate file."
    );
  }
}

for (const required of [
  /export type ProviderDirectorySnapshot/,
  /export type ProviderDirectoryInput/,
  /export type ProviderEndpointConnectionType/,
  /export const providerOrganizationTypes/
]) {
  if (!required.test(providerDirectoryTypesSource)) {
    throw new Error(
      "provider-directory.types.ts must keep ProviderDirectory snapshot, input, endpoint connection and provider code-set definitions."
    );
  }
}

if (!/from "\.\/provider-directory\.types\.js"/.test(providerDirectoryAggregateSource)) {
  throw new Error(
    "ProviderDirectory aggregate must depend on provider-directory.types.ts for shared types."
  );
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "Domain composition budget",
      domainReports
    },
    null,
    2
  )
);
