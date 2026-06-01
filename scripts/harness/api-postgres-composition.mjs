import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const postgresBudgets = [
  {
    path: "apps/api/src/infrastructure/postgres/postgres-record-transfer.repository.ts",
    maxLines: 150,
    role: "RecordTransfer PostgreSQL repository orchestration"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-record-transfer.sql.ts",
    maxLines: 90,
    role: "RecordTransfer PostgreSQL SQL statements"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-record-transfer.mapper.ts",
    maxLines: 90,
    role: "RecordTransfer PostgreSQL row and parameter mapper"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-record-transfer.persistence.ts",
    maxLines: 30,
    role: "RecordTransfer PostgreSQL persistence command"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-record-transfer.types.ts",
    maxLines: 50,
    role: "RecordTransfer PostgreSQL queryable and row types"
  }
];

const repositoryPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-record-transfer.repository.ts"
);
const sqlPath = resolve("apps/api/src/infrastructure/postgres/postgres-record-transfer.sql.ts");
const mapperPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-record-transfer.mapper.ts"
);
const persistencePath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-record-transfer.persistence.ts"
);
const typesPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-record-transfer.types.ts"
);

const postgresReports = [];

for (const budget of postgresBudgets) {
  const absolutePath = resolve(budget.path);

  try {
    await stat(absolutePath);
  } catch {
    throw new Error(`PostgreSQL composition file is missing: ${budget.path}`);
  }

  const source = await readFile(absolutePath, "utf8");
  const lineCount = source.split(/\r?\n/).length;

  if (lineCount > budget.maxLines) {
    throw new Error(
      `${budget.path} has ${lineCount} lines, over the ${budget.maxLines} line budget for ${budget.role}.`
    );
  }

  postgresReports.push({
    path: budget.path,
    lineCount,
    maxLines: budget.maxLines,
    role: budget.role
  });
}

const repositorySource = await readFile(repositoryPath, "utf8");
const sqlSource = await readFile(sqlPath, "utf8");
const mapperSource = await readFile(mapperPath, "utf8");
const persistenceSource = await readFile(persistencePath, "utf8");
const typesSource = await readFile(typesPath, "utf8");

const requiredRepositoryImports = [
  "rowToRecordTransfer",
  "upsertRecordTransfer",
  "selectRecordTransferSql",
  "RecordTransferRow"
];

for (const importedName of requiredRepositoryImports) {
  if (!repositorySource.includes(importedName)) {
    throw new Error(`RecordTransfer PostgreSQL repository must compose ${importedName}.`);
  }
}

assertForbidden(repositorySource, [
  {
    pattern: /\bINSERT INTO record_transfers\b|\bON CONFLICT \(id\)\b|\bRecordTransfer\.rehydrate\b|\bRecordTransferSnapshot\b/,
    message:
      "RecordTransfer PostgreSQL repository must delegate upsert SQL and row mapping to focused modules."
  }
]);

assertForbidden(sqlSource, [
  {
    pattern: /@benh-vien-so\/domain|\bRecordTransfer\b|\bpg\b/,
    message:
      "RecordTransfer PostgreSQL SQL module must stay a pure SQL statement module without domain or pg dependencies."
  }
]);

assertForbidden(mapperSource, [
  {
    pattern: /\bfrom "pg"\b|\bquery\s*\(|\bINSERT INTO record_transfers\b|\bON CONFLICT \(id\)\b/,
    message:
      "RecordTransfer PostgreSQL mapper must stay pure row/value mapping without pg I/O or SQL ownership."
  }
]);

assertForbidden(persistenceSource, [
  {
    pattern: /\bRecordTransfer\.rehydrate\b|\bRecordTransferSnapshot\b|\bINSERT INTO record_transfers\b/,
    message:
      "RecordTransfer PostgreSQL persistence command must compose SQL and mapper without owning domain hydration."
  }
]);

assertForbidden(typesSource, [
  {
    pattern: /\bRecordTransfer\.rehydrate\b|\bquery\s*\(|\bINSERT INTO record_transfers\b/,
    message:
      "RecordTransfer PostgreSQL type module must only describe queryable and row contracts."
  }
]);

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "API PostgreSQL composition budget",
      postgresReports
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
