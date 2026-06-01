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
  },
  {
    path: "packages/domain/src/audit-event/audit-event.ts",
    maxLines: 420,
    role: "AuditEvent aggregate, sealing and integrity verification behavior"
  },
  {
    path: "packages/domain/src/audit-event/audit-event.types.ts",
    maxLines: 300,
    role: "AuditEvent action, resource, snapshot and integrity report types"
  },
  {
    path: "packages/domain/src/access-control/access-control.ts",
    maxLines: 240,
    role: "AccessControl authorization decisions and patient organization scoping"
  },
  {
    path: "packages/domain/src/access-control/access-control.policy.ts",
    maxLines: 340,
    role: "AccessControl role, purpose and permission catalog"
  },
  {
    path: "packages/domain/src/patient/patient.ts",
    maxLines: 470,
    role: "Patient aggregate registration, demographic update and merge behavior"
  },
  {
    path: "packages/domain/src/patient/patient.types.ts",
    maxLines: 90,
    role: "Patient identifier, snapshot and registration input types"
  },
  {
    path: "packages/domain/src/workflow-task/workflow-task.ts",
    maxLines: 340,
    role: "WorkflowTask aggregate lifecycle and reference normalization behavior"
  },
  {
    path: "packages/domain/src/workflow-task/workflow-task.types.ts",
    maxLines: 160,
    role: "WorkflowTask status, intent, priority, reference and snapshot types"
  },
  {
    path: "packages/domain/src/procedure/procedure.ts",
    maxLines: 330,
    role: "Procedure aggregate lifecycle, performer and report reference behavior"
  },
  {
    path: "packages/domain/src/procedure/procedure.types.ts",
    maxLines: 130,
    role: "Procedure status, category, performer, report reference and snapshot types"
  },
  {
    path: "packages/domain/src/record-transfer-delivery-attempt/record-transfer-delivery-attempt.ts",
    maxLines: 390,
    role: "RecordTransferDeliveryAttempt queue, terminal update and delivery validation behavior"
  },
  {
    path: "packages/domain/src/record-transfer-delivery-attempt/record-transfer-delivery-attempt.types.ts",
    maxLines: 90,
    role: "RecordTransferDeliveryAttempt status, bundle, snapshot and command input types"
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
const auditEventAggregatePath = resolve("packages/domain/src/audit-event/audit-event.ts");
const auditEventTypesPath = resolve("packages/domain/src/audit-event/audit-event.types.ts");
const accessControlBehaviorPath = resolve(
  "packages/domain/src/access-control/access-control.ts"
);
const accessControlPolicyPath = resolve(
  "packages/domain/src/access-control/access-control.policy.ts"
);
const patientAggregatePath = resolve("packages/domain/src/patient/patient.ts");
const patientTypesPath = resolve("packages/domain/src/patient/patient.types.ts");
const workflowTaskAggregatePath = resolve(
  "packages/domain/src/workflow-task/workflow-task.ts"
);
const workflowTaskTypesPath = resolve(
  "packages/domain/src/workflow-task/workflow-task.types.ts"
);
const procedureAggregatePath = resolve("packages/domain/src/procedure/procedure.ts");
const procedureTypesPath = resolve("packages/domain/src/procedure/procedure.types.ts");
const deliveryAttemptAggregatePath = resolve(
  "packages/domain/src/record-transfer-delivery-attempt/record-transfer-delivery-attempt.ts"
);
const deliveryAttemptTypesPath = resolve(
  "packages/domain/src/record-transfer-delivery-attempt/record-transfer-delivery-attempt.types.ts"
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
const auditEventAggregateSource = await readFile(auditEventAggregatePath, "utf8");
const auditEventTypesSource = await readFile(auditEventTypesPath, "utf8");
const accessControlBehaviorSource = await readFile(accessControlBehaviorPath, "utf8");
const accessControlPolicySource = await readFile(accessControlPolicyPath, "utf8");
const patientAggregateSource = await readFile(patientAggregatePath, "utf8");
const patientTypesSource = await readFile(patientTypesPath, "utf8");
const workflowTaskAggregateSource = await readFile(workflowTaskAggregatePath, "utf8");
const workflowTaskTypesSource = await readFile(workflowTaskTypesPath, "utf8");
const procedureAggregateSource = await readFile(procedureAggregatePath, "utf8");
const procedureTypesSource = await readFile(procedureTypesPath, "utf8");
const deliveryAttemptAggregateSource = await readFile(deliveryAttemptAggregatePath, "utf8");
const deliveryAttemptTypesSource = await readFile(deliveryAttemptTypesPath, "utf8");

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

for (const forbidden of [
  /export type AuditAction/,
  /export type AuditEventSnapshot/,
  /const auditActions/
]) {
  if (forbidden.test(auditEventAggregateSource)) {
    throw new Error(
      "AuditEvent action, resource and snapshot types belong in audit-event.types.ts, not the aggregate file."
    );
  }
}

for (const required of [
  /export type AuditAction/,
  /export type AuditResourceType/,
  /export type AuditEventSnapshot/,
  /export type AuditIntegrityReport/,
  /export const auditActions/
]) {
  if (!required.test(auditEventTypesSource)) {
    throw new Error(
      "audit-event.types.ts must keep AuditEvent actions, resources, snapshots, integrity reports and action-set definitions."
    );
  }
}

if (!/from "\.\/audit-event\.types\.js"/.test(auditEventAggregateSource)) {
  throw new Error("AuditEvent aggregate must depend on audit-event.types.ts for shared types.");
}

for (const forbidden of [
  /export type ActorRole/,
  /export type Permission/,
  /const rolePermissions/,
  /clinician: \[/
]) {
  if (forbidden.test(accessControlBehaviorSource)) {
    throw new Error(
      "AccessControl role, purpose and permission catalog belongs in access-control.policy.ts, not the behavior file."
    );
  }
}

for (const required of [
  /export type ActorRole/,
  /export type PurposeOfUse/,
  /export type Permission/,
  /export const actorRoles/,
  /export const purposesOfUse/,
  /export const rolePermissions/
]) {
  if (!required.test(accessControlPolicySource)) {
    throw new Error(
      "access-control.policy.ts must keep AccessControl roles, purposes, permissions and role-permission catalog definitions."
    );
  }
}

if (!/from "\.\/access-control\.policy\.js"/.test(accessControlBehaviorSource)) {
  throw new Error(
    "AccessControl behavior must depend on access-control.policy.ts for shared policy catalog types."
  );
}

for (const forbidden of [
  /export type AdministrativeGender/,
  /export type PatientSnapshot/,
  /const administrativeGenders/
]) {
  if (forbidden.test(patientAggregateSource)) {
    throw new Error(
      "Patient type declarations and code sets belong in patient.types.ts, not the aggregate file."
    );
  }
}

for (const required of [
  /export type AdministrativeGender/,
  /export type PatientIdentifier/,
  /export type PatientSnapshot/,
  /export type RegisterPatientInput/,
  /export const administrativeGenders/
]) {
  if (!required.test(patientTypesSource)) {
    throw new Error(
      "patient.types.ts must keep Patient gender, identifier, snapshot, registration input and code-set definitions."
    );
  }
}

if (!/from "\.\/patient\.types\.js"/.test(patientAggregateSource)) {
  throw new Error("Patient aggregate must depend on patient.types.ts for shared types.");
}

for (const forbidden of [
  /export type WorkflowTaskStatus/,
  /export type WorkflowTaskSnapshot/,
  /const workflowTaskStatuses/
]) {
  if (forbidden.test(workflowTaskAggregateSource)) {
    throw new Error(
      "WorkflowTask type declarations and code sets belong in workflow-task.types.ts, not the aggregate file."
    );
  }
}

for (const required of [
  /export type WorkflowTaskStatus/,
  /export type WorkflowTaskReferenceResourceType/,
  /export type WorkflowTaskSnapshot/,
  /export type CreateWorkflowTaskInput/,
  /export const workflowTaskStatuses/
]) {
  if (!required.test(workflowTaskTypesSource)) {
    throw new Error(
      "workflow-task.types.ts must keep WorkflowTask status, reference, snapshot, command input and code-set definitions."
    );
  }
}

if (!/from "\.\/workflow-task\.types\.js"/.test(workflowTaskAggregateSource)) {
  throw new Error("WorkflowTask aggregate must depend on workflow-task.types.ts for shared types.");
}

for (const forbidden of [
  /export type ProcedureStatus/,
  /export type ProcedureSnapshot/,
  /const procedureStatuses/
]) {
  if (forbidden.test(procedureAggregateSource)) {
    throw new Error(
      "Procedure type declarations and code sets belong in procedure.types.ts, not the aggregate file."
    );
  }
}

for (const required of [
  /export type ProcedureStatus/,
  /export type ProcedureCategory/,
  /export type ProcedureSnapshot/,
  /export type CreateProcedureInput/,
  /export const procedureStatuses/
]) {
  if (!required.test(procedureTypesSource)) {
    throw new Error(
      "procedure.types.ts must keep Procedure status, category, snapshot, command input and code-set definitions."
    );
  }
}

if (!/from "\.\/procedure\.types\.js"/.test(procedureAggregateSource)) {
  throw new Error("Procedure aggregate must depend on procedure.types.ts for shared types.");
}

for (const forbidden of [
  /export type RecordTransferDeliveryAttemptStatus/,
  /export type RecordTransferDeliveryAttemptSnapshot/,
  /const deliveryAttemptStatuses/
]) {
  if (forbidden.test(deliveryAttemptAggregateSource)) {
    throw new Error(
      "RecordTransferDeliveryAttempt type declarations and code sets belong in record-transfer-delivery-attempt.types.ts, not the aggregate file."
    );
  }
}

for (const required of [
  /export type RecordTransferDeliveryAttemptStatus/,
  /export type RecordTransferDeliveryAttemptBundleType/,
  /export type RecordTransferDeliveryAttemptSnapshot/,
  /export type QueueRecordTransferDeliveryAttemptInput/,
  /export const deliveryAttemptStatuses/
]) {
  if (!required.test(deliveryAttemptTypesSource)) {
    throw new Error(
      "record-transfer-delivery-attempt.types.ts must keep delivery status, bundle, snapshot, command input and code-set definitions."
    );
  }
}

if (!/from "\.\/record-transfer-delivery-attempt\.types\.js"/.test(
  deliveryAttemptAggregateSource
)) {
  throw new Error(
    "RecordTransferDeliveryAttempt aggregate must depend on record-transfer-delivery-attempt.types.ts for shared types."
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
