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
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-patient.repository.ts",
    maxLines: 110,
    role: "Patient PostgreSQL repository orchestration"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-patient.sql.ts",
    maxLines: 90,
    role: "Patient PostgreSQL SQL statements"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-patient.mapper.ts",
    maxLines: 80,
    role: "Patient PostgreSQL row and parameter mapper"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-patient.persistence.ts",
    maxLines: 40,
    role: "Patient PostgreSQL persistence command"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-patient-conflict.ts",
    maxLines: 70,
    role: "Patient PostgreSQL unique-identifier conflict policy"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-patient.types.ts",
    maxLines: 40,
    role: "Patient PostgreSQL queryable and row types"
  }
];

const recordTransferRepositoryPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-record-transfer.repository.ts"
);
const recordTransferSqlPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-record-transfer.sql.ts"
);
const recordTransferMapperPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-record-transfer.mapper.ts"
);
const recordTransferPersistencePath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-record-transfer.persistence.ts"
);
const recordTransferTypesPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-record-transfer.types.ts"
);
const patientRepositoryPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-patient.repository.ts"
);
const patientSqlPath = resolve("apps/api/src/infrastructure/postgres/postgres-patient.sql.ts");
const patientMapperPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-patient.mapper.ts"
);
const patientPersistencePath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-patient.persistence.ts"
);
const patientConflictPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-patient-conflict.ts"
);
const patientTypesPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-patient.types.ts"
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

const recordTransferRepositorySource = await readFile(recordTransferRepositoryPath, "utf8");
const recordTransferSqlSource = await readFile(recordTransferSqlPath, "utf8");
const recordTransferMapperSource = await readFile(recordTransferMapperPath, "utf8");
const recordTransferPersistenceSource = await readFile(
  recordTransferPersistencePath,
  "utf8"
);
const recordTransferTypesSource = await readFile(recordTransferTypesPath, "utf8");
const patientRepositorySource = await readFile(patientRepositoryPath, "utf8");
const patientSqlSource = await readFile(patientSqlPath, "utf8");
const patientMapperSource = await readFile(patientMapperPath, "utf8");
const patientPersistenceSource = await readFile(patientPersistencePath, "utf8");
const patientConflictSource = await readFile(patientConflictPath, "utf8");
const patientTypesSource = await readFile(patientTypesPath, "utf8");

const requiredRepositoryImports = [
  "rowToRecordTransfer",
  "upsertRecordTransfer",
  "selectRecordTransferSql",
  "RecordTransferRow"
];

for (const importedName of requiredRepositoryImports) {
  if (!recordTransferRepositorySource.includes(importedName)) {
    throw new Error(`RecordTransfer PostgreSQL repository must compose ${importedName}.`);
  }
}

const requiredPatientRepositoryImports = [
  "rowToPatient",
  "upsertPatientSnapshot",
  "selectPatientSql",
  "selectPatientByIdentifierSql",
  "PatientRow",
  "throwPatientIdentifierConflictIfNeeded"
];

for (const importedName of requiredPatientRepositoryImports) {
  if (!patientRepositorySource.includes(importedName)) {
    throw new Error(`Patient PostgreSQL repository must compose ${importedName}.`);
  }
}

assertForbidden(recordTransferRepositorySource, [
  {
    pattern: /\bINSERT INTO record_transfers\b|\bON CONFLICT \(id\)\b|\bRecordTransfer\.rehydrate\b|\bRecordTransferSnapshot\b/,
    message:
      "RecordTransfer PostgreSQL repository must delegate upsert SQL and row mapping to focused modules."
  }
]);

assertForbidden(recordTransferSqlSource, [
  {
    pattern: /@benh-vien-so\/domain|\bRecordTransfer\b|\bpg\b/,
    message:
      "RecordTransfer PostgreSQL SQL module must stay a pure SQL statement module without domain or pg dependencies."
  }
]);

assertForbidden(recordTransferMapperSource, [
  {
    pattern: /\bfrom "pg"\b|\bquery\s*\(|\bINSERT INTO record_transfers\b|\bON CONFLICT \(id\)\b/,
    message:
      "RecordTransfer PostgreSQL mapper must stay pure row/value mapping without pg I/O or SQL ownership."
  }
]);

assertForbidden(recordTransferPersistenceSource, [
  {
    pattern: /\bRecordTransfer\.rehydrate\b|\bRecordTransferSnapshot\b|\bINSERT INTO record_transfers\b/,
    message:
      "RecordTransfer PostgreSQL persistence command must compose SQL and mapper without owning domain hydration."
  }
]);

assertForbidden(recordTransferTypesSource, [
  {
    pattern: /\bRecordTransfer\.rehydrate\b|\bquery\s*\(|\bINSERT INTO record_transfers\b/,
    message:
      "RecordTransfer PostgreSQL type module must only describe queryable and row contracts."
  }
]);

assertForbidden(patientRepositorySource, [
  {
    pattern: /\bINSERT INTO patients\b|\bpatient_identifier_index\b|\bPatient\.rehydrate\b|\bPatientSnapshot\b|\bJSON\.parse\b/,
    message:
      "Patient PostgreSQL repository must delegate patient SQL, identifier-index writes, row mapping and conflict policy to focused modules."
  }
]);

assertForbidden(patientSqlSource, [
  {
    pattern: /@benh-vien-so\/domain|\bPatient\b|\bpg\b/,
    message:
      "Patient PostgreSQL SQL module must stay a pure SQL statement module without domain or pg dependencies."
  }
]);

assertForbidden(patientMapperSource, [
  {
    pattern: /\bfrom "pg"\b|\bquery\s*\(|\bINSERT INTO patients\b|\bpatient_identifier_index\b/,
    message:
      "Patient PostgreSQL mapper must stay pure row/value mapping without pg I/O or SQL ownership."
  }
]);

assertForbidden(patientPersistenceSource, [
  {
    pattern: /\bPatient\.rehydrate\b|\bJSON\.parse\b|\bSELECT\b/,
    message:
      "Patient PostgreSQL persistence command must compose SQL and mapper without owning domain hydration or reads."
  }
]);

assertForbidden(patientConflictSource, [
  {
    pattern: /\bfrom "pg"\b|\bINSERT INTO patients\b|\bpatient_identifier_index\b|\bPatient\.rehydrate\b/,
    message:
      "Patient identifier conflict policy must not own pg I/O, SQL or domain hydration."
  }
]);

assertForbidden(patientTypesSource, [
  {
    pattern: /\bPatient\.rehydrate\b|\bquery\s*\(|\bINSERT INTO patients\b/,
    message: "Patient PostgreSQL type module must only describe queryable and row contracts."
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
