import type { Permission } from "./access-control.policy.js";

type PermissionScope = Permission extends `${infer Scope}:${string}` ? Scope : never;
type PermissionAction = Permission extends `${string}:${infer Action}` ? Action : never;

const clinicalResourceScopes = [
  "allergy-intolerance",
  "condition",
  "medication-request",
  "medication-dispense",
  "medication-administration",
  "observation",
  "service-request",
  "workflow-task",
  "procedure",
  "diagnostic-report",
  "imaging-study"
] as const satisfies readonly PermissionScope[];

const clinicalWorkflowActions = [
  "list",
  "create",
  "read"
] as const satisfies readonly PermissionAction[];

const clinicalFhirExportActions = [
  ...clinicalWorkflowActions,
  "fhir-export"
] as const satisfies readonly PermissionAction[];

const nurseEncounterWorkflowActions = [
  "list",
  "read"
] as const satisfies readonly PermissionAction[];

const encounterFhirExportActions = [
  ...clinicalWorkflowActions,
  "finish",
  "fhir-export"
] as const satisfies readonly PermissionAction[];

function buildScopePermissions<
  TScope extends PermissionScope,
  TAction extends PermissionAction
>(
  scope: TScope,
  actions: readonly TAction[]
): Extract<Permission, `${TScope}:${TAction}`>[] {
  return actions.map(
    (action) => `${scope}:${action}` as Extract<Permission, `${TScope}:${TAction}`>
  );
}

function buildClinicalResourcePermissions<TAction extends PermissionAction>(
  actions: readonly TAction[]
): Extract<Permission, `${(typeof clinicalResourceScopes)[number]}:${TAction}`>[] {
  return clinicalResourceScopes.flatMap((scope) => buildScopePermissions(scope, actions));
}

export const clinicalFhirExportPermissions = [
  ...buildScopePermissions("encounter", encounterFhirExportActions),
  ...buildClinicalResourcePermissions(clinicalFhirExportActions)
] satisfies readonly Permission[];

export const clinicalDocumentExportPermissions = [
  "clinical-document:list",
  "clinical-document:create",
  "clinical-document:sign",
  "clinical-document:fhir-export"
] as const satisfies readonly Permission[];

export const nurseClinicalWorkflowPermissions = [
  ...buildScopePermissions("encounter", nurseEncounterWorkflowActions),
  ...buildClinicalResourcePermissions(clinicalWorkflowActions)
] satisfies readonly Permission[];
