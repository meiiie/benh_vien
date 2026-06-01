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
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-workflow-task.repository.ts",
    maxLines: 90,
    role: "WorkflowTask PostgreSQL repository orchestration"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-workflow-task.sql.ts",
    maxLines: 90,
    role: "WorkflowTask PostgreSQL SQL statements"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-workflow-task.mapper.ts",
    maxLines: 100,
    role: "WorkflowTask PostgreSQL row and parameter mapper"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-workflow-task.persistence.ts",
    maxLines: 30,
    role: "WorkflowTask PostgreSQL persistence command"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-workflow-task.types.ts",
    maxLines: 50,
    role: "WorkflowTask PostgreSQL row types"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-procedure.repository.ts",
    maxLines: 90,
    role: "Procedure PostgreSQL repository orchestration"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-procedure.sql.ts",
    maxLines: 80,
    role: "Procedure PostgreSQL SQL statements"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-procedure.mapper.ts",
    maxLines: 100,
    role: "Procedure PostgreSQL row and parameter mapper"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-procedure.persistence.ts",
    maxLines: 30,
    role: "Procedure PostgreSQL persistence command"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-procedure.types.ts",
    maxLines: 50,
    role: "Procedure PostgreSQL row types"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-audit-event.repository.ts",
    maxLines: 110,
    role: "AuditEvent PostgreSQL repository integrity orchestration"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-audit-event.sql.ts",
    maxLines: 90,
    role: "AuditEvent PostgreSQL SQL statements"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-audit-event.mapper.ts",
    maxLines: 80,
    role: "AuditEvent PostgreSQL row and parameter mapper"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-audit-event.persistence.ts",
    maxLines: 70,
    role: "AuditEvent PostgreSQL persistence commands"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-audit-event.types.ts",
    maxLines: 40,
    role: "AuditEvent PostgreSQL queryable and row types"
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
const workflowTaskRepositoryPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-workflow-task.repository.ts"
);
const workflowTaskSqlPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-workflow-task.sql.ts"
);
const workflowTaskMapperPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-workflow-task.mapper.ts"
);
const workflowTaskPersistencePath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-workflow-task.persistence.ts"
);
const workflowTaskTypesPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-workflow-task.types.ts"
);
const procedureRepositoryPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-procedure.repository.ts"
);
const procedureSqlPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-procedure.sql.ts"
);
const procedureMapperPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-procedure.mapper.ts"
);
const procedurePersistencePath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-procedure.persistence.ts"
);
const procedureTypesPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-procedure.types.ts"
);
const auditEventRepositoryPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-audit-event.repository.ts"
);
const auditEventSqlPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-audit-event.sql.ts"
);
const auditEventMapperPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-audit-event.mapper.ts"
);
const auditEventPersistencePath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-audit-event.persistence.ts"
);
const auditEventTypesPath = resolve(
  "apps/api/src/infrastructure/postgres/postgres-audit-event.types.ts"
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
const workflowTaskRepositorySource = await readFile(workflowTaskRepositoryPath, "utf8");
const workflowTaskSqlSource = await readFile(workflowTaskSqlPath, "utf8");
const workflowTaskMapperSource = await readFile(workflowTaskMapperPath, "utf8");
const workflowTaskPersistenceSource = await readFile(
  workflowTaskPersistencePath,
  "utf8"
);
const workflowTaskTypesSource = await readFile(workflowTaskTypesPath, "utf8");
const procedureRepositorySource = await readFile(procedureRepositoryPath, "utf8");
const procedureSqlSource = await readFile(procedureSqlPath, "utf8");
const procedureMapperSource = await readFile(procedureMapperPath, "utf8");
const procedurePersistenceSource = await readFile(procedurePersistencePath, "utf8");
const procedureTypesSource = await readFile(procedureTypesPath, "utf8");
const auditEventRepositorySource = await readFile(auditEventRepositoryPath, "utf8");
const auditEventSqlSource = await readFile(auditEventSqlPath, "utf8");
const auditEventMapperSource = await readFile(auditEventMapperPath, "utf8");
const auditEventPersistenceSource = await readFile(auditEventPersistencePath, "utf8");
const auditEventTypesSource = await readFile(auditEventTypesPath, "utf8");

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

const requiredWorkflowTaskRepositoryImports = [
  "rowToWorkflowTask",
  "upsertWorkflowTask",
  "selectWorkflowTaskSql",
  "WorkflowTaskRow"
];

for (const importedName of requiredWorkflowTaskRepositoryImports) {
  if (!workflowTaskRepositorySource.includes(importedName)) {
    throw new Error(`WorkflowTask PostgreSQL repository must compose ${importedName}.`);
  }
}

const requiredProcedureRepositoryImports = [
  "rowToProcedure",
  "upsertProcedure",
  "selectProcedureSql",
  "ProcedureRow"
];

for (const importedName of requiredProcedureRepositoryImports) {
  if (!procedureRepositorySource.includes(importedName)) {
    throw new Error(`Procedure PostgreSQL repository must compose ${importedName}.`);
  }
}

const requiredAuditEventRepositoryImports = [
  "rowToAuditEvent",
  "insertAuditEvent",
  "lockAuditIntegrityScope",
  "findLatestAuditIntegrityHash",
  "updateAuditEventIntegrity",
  "selectAuditEventSql",
  "AuditEventRow"
];

for (const importedName of requiredAuditEventRepositoryImports) {
  if (!auditEventRepositorySource.includes(importedName)) {
    throw new Error(`AuditEvent PostgreSQL repository must compose ${importedName}.`);
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

assertForbidden(workflowTaskRepositorySource, [
  {
    pattern: /\bINSERT INTO workflow_tasks\b|\bON CONFLICT \(id\)\b|\bWorkflowTask\.rehydrate\b|\bWorkflowTaskSnapshot\b|\bJSON\.parse\b|\bJSON\.stringify\b/,
    message:
      "WorkflowTask PostgreSQL repository must delegate upsert SQL and JSON row mapping to focused modules."
  }
]);

assertForbidden(workflowTaskSqlSource, [
  {
    pattern: /@benh-vien-so\/domain|\bWorkflowTask\b|\bpg\b/,
    message:
      "WorkflowTask PostgreSQL SQL module must stay a pure SQL statement module without domain or pg dependencies."
  }
]);

assertForbidden(workflowTaskMapperSource, [
  {
    pattern: /\bfrom "pg"\b|\bquery\s*\(|\bINSERT INTO workflow_tasks\b|\bON CONFLICT \(id\)\b/,
    message:
      "WorkflowTask PostgreSQL mapper must stay pure row/value mapping without pg I/O or SQL ownership."
  }
]);

assertForbidden(workflowTaskPersistenceSource, [
  {
    pattern: /\bWorkflowTask\.rehydrate\b|\bWorkflowTaskSnapshot\b|\bSELECT\b|\bJSON\.parse\b/,
    message:
      "WorkflowTask PostgreSQL persistence command must compose SQL and mapper without owning reads or domain hydration."
  }
]);

assertForbidden(workflowTaskTypesSource, [
  {
    pattern: /\bWorkflowTask\.rehydrate\b|\bquery\s*\(|\bINSERT INTO workflow_tasks\b/,
    message:
      "WorkflowTask PostgreSQL type module must only describe row contracts."
  }
]);

assertForbidden(procedureRepositorySource, [
  {
    pattern: /\bINSERT INTO procedures\b|\bON CONFLICT \(id\)\b|\bProcedure\.rehydrate\b|\bProcedureSnapshot\b|\bJSON\.parse\b|\bJSON\.stringify\b/,
    message:
      "Procedure PostgreSQL repository must delegate upsert SQL and JSON row mapping to focused modules."
  }
]);

assertForbidden(procedureSqlSource, [
  {
    pattern: /@benh-vien-so\/domain|\bProcedure\b|\bpg\b/,
    message:
      "Procedure PostgreSQL SQL module must stay a pure SQL statement module without domain or pg dependencies."
  }
]);

assertForbidden(procedureMapperSource, [
  {
    pattern: /\bfrom "pg"\b|\bquery\s*\(|\bINSERT INTO procedures\b|\bON CONFLICT \(id\)\b/,
    message:
      "Procedure PostgreSQL mapper must stay pure row/value mapping without pg I/O or SQL ownership."
  }
]);

assertForbidden(procedurePersistenceSource, [
  {
    pattern: /\bProcedure\.rehydrate\b|\bProcedureSnapshot\b|\bSELECT\b|\bJSON\.parse\b/,
    message:
      "Procedure PostgreSQL persistence command must compose SQL and mapper without owning reads or domain hydration."
  }
]);

assertForbidden(procedureTypesSource, [
  {
    pattern: /\bProcedure\.rehydrate\b|\bquery\s*\(|\bINSERT INTO procedures\b/,
    message: "Procedure PostgreSQL type module must only describe row contracts."
  }
]);

assertForbidden(auditEventRepositorySource, [
  {
    pattern: /\bINSERT INTO audit_events\b|\bUPDATE audit_events\b|\bpg_advisory_xact_lock\b|\bAuditEvent\.rehydrate\b|\bAuditEventSnapshot\b|\bJSON\.parse\b|\bJSON\.stringify\b/,
    message:
      "AuditEvent PostgreSQL repository must orchestrate integrity sealing without owning SQL or JSON mapping."
  }
]);

assertForbidden(auditEventSqlSource, [
  {
    pattern: /@benh-vien-so\/domain|\bpg\b/,
    message:
      "AuditEvent PostgreSQL SQL module must stay a pure SQL statement module without domain or pg dependencies."
  }
]);

assertForbidden(auditEventMapperSource, [
  {
    pattern: /\bfrom "pg"\b|\bquery\s*\(|\bINSERT INTO audit_events\b|\bUPDATE audit_events\b|\bSELECT\b/,
    message:
      "AuditEvent PostgreSQL mapper must stay pure row/value mapping without pg I/O or SQL ownership."
  }
]);

assertForbidden(auditEventPersistenceSource, [
  {
    pattern: /\bsealAuditEvent\b|\bbuildAuditIntegrityReport\b|\bAuditEvent\.rehydrate\b|\bJSON\.parse\b/,
    message:
      "AuditEvent PostgreSQL persistence commands must not own domain sealing, integrity reporting or row hydration internals."
  }
]);

assertForbidden(auditEventTypesSource, [
  {
    pattern: /\bAuditEvent\.rehydrate\b|\bquery\s*\(|\bINSERT INTO audit_events\b|\bUPDATE audit_events\b/,
    message:
      "AuditEvent PostgreSQL type module must only describe queryable and row contracts."
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
