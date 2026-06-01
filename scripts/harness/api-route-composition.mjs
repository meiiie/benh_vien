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
    path: "apps/api/src/modules/record-transfers/record-transfer-command-route-helpers.ts",
    maxLines: 120,
    role: "RecordTransfer command error response and audit metadata helpers"
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
  },
  {
    path: "apps/api/src/modules/patients/patient-routes.ts",
    maxLines: 90,
    role: "Patient route composition root"
  },
  {
    path: "apps/api/src/modules/patients/patient-registry-routes.ts",
    maxLines: 170,
    role: "Patient registry list and create adapter"
  },
  {
    path: "apps/api/src/modules/patients/patient-merge-routes.ts",
    maxLines: 130,
    role: "Patient merge command adapter"
  },
  {
    path: "apps/api/src/modules/patients/patient-query-routes.ts",
    maxLines: 90,
    role: "Patient read route adapter"
  },
  {
    path: "apps/api/src/modules/patients/patient-fhir-routes.ts",
    maxLines: 90,
    role: "Patient FHIR route composition root"
  },
  {
    path: "apps/api/src/modules/patients/patient-fhir-resource-routes.ts",
    maxLines: 90,
    role: "Patient FHIR Patient resource export route"
  },
  {
    path: "apps/api/src/modules/patients/patient-record-bundle-routes.ts",
    maxLines: 300,
    role: "Patient FHIR Bundle and document Bundle export routes"
  },
  {
    path: "apps/api/src/modules/patients/patient-route-helpers.ts",
    maxLines: 260,
    role: "Patient route helper functions"
  },
  {
    path: "apps/api/src/modules/clinical-documents/clinical-document-routes.ts",
    maxLines: 80,
    role: "ClinicalDocument route composition root"
  },
  {
    path: "apps/api/src/modules/clinical-documents/clinical-document-query-routes.ts",
    maxLines: 90,
    role: "ClinicalDocument list route adapter"
  },
  {
    path: "apps/api/src/modules/clinical-documents/clinical-document-creation-routes.ts",
    maxLines: 130,
    role: "ClinicalDocument creation command route adapter"
  },
  {
    path: "apps/api/src/modules/clinical-documents/clinical-document-command-routes.ts",
    maxLines: 120,
    role: "ClinicalDocument sign command route adapter"
  },
  {
    path: "apps/api/src/modules/clinical-documents/clinical-document-fhir-routes.ts",
    maxLines: 160,
    role: "ClinicalDocument FHIR DocumentReference and Provenance route adapter"
  },
  {
    path: "apps/api/src/modules/clinical-documents/clinical-document-route-helpers.ts",
    maxLines: 80,
    role: "ClinicalDocument response and reference validation helpers"
  },
  {
    path: "apps/api/src/modules/procedures/procedure-routes.ts",
    maxLines: 80,
    role: "Procedure route composition root"
  },
  {
    path: "apps/api/src/modules/procedures/procedure-query-routes.ts",
    maxLines: 120,
    role: "Procedure query and read route adapter"
  },
  {
    path: "apps/api/src/modules/procedures/procedure-creation-routes.ts",
    maxLines: 140,
    role: "Procedure creation command route adapter"
  },
  {
    path: "apps/api/src/modules/procedures/procedure-fhir-routes.ts",
    maxLines: 90,
    role: "Procedure FHIR export route adapter"
  },
  {
    path: "apps/api/src/modules/procedures/procedure-route-helpers.ts",
    maxLines: 150,
    role: "Procedure response and reference validation helpers"
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

const patientRoutesPath = resolve("apps/api/src/modules/patients/patient-routes.ts");
const forbiddenPatientRoutePatterns = [
  {
    pattern: /\bCreatePatientRequestSchema\b|\bfindPatientIdentifierConflict\b/,
    message:
      "Patient registry list/create policy belongs in patient-registry-routes.ts."
  },
  {
    pattern: /\bMergePatientRequestSchema\b|\bmarkMerged\b/,
    message: "Patient merge commands belong in patient-merge-routes.ts."
  },
  {
    pattern: /\bPatientIdParamsSchema\b|\bsendFhirOperationOutcome\b/,
    message: "Patient read and FHIR endpoint details belong outside patient-routes.ts."
  },
  {
    pattern:
      /\bmapPatientToFhir\b|\bmapPatientRecordToFhirBundle\b|\bmapPatientRecordToFhirDocumentBundle\b/,
    message: "Patient FHIR mapping belongs in patient-fhir-routes.ts."
  }
];
const requiredPatientRegistrations = [
  "registerPatientRegistryRoutes",
  "registerPatientMergeRoutes",
  "registerPatientQueryRoutes",
  "registerPatientFhirRoutes"
];

const patientFhirRoutesPath = resolve("apps/api/src/modules/patients/patient-fhir-routes.ts");
const forbiddenPatientFhirRoutePatterns = [
  {
    pattern:
      /\bmapPatientToFhir\b|\bmapPatientRecordToFhirBundle\b|\bmapPatientRecordToFhirDocumentBundle\b/,
    message:
      "Patient FHIR mapping route handlers belong in patient-fhir-resource-routes.ts or patient-record-bundle-routes.ts."
  },
  {
    pattern: /\bPatientIdParamsSchema\b|\breadBundleTransferContext\b/,
    message:
      "Patient FHIR route request handling belongs outside the patient-fhir-routes.ts composition root."
  }
];
const requiredPatientFhirRegistrations = [
  "registerPatientFhirResourceRoutes",
  "registerPatientRecordBundleRoutes"
];

const clinicalDocumentRoutesPath = resolve(
  "apps/api/src/modules/clinical-documents/clinical-document-routes.ts"
);
const forbiddenClinicalDocumentRoutePatterns = [
  {
    pattern:
      /\bCreateClinicalDocumentRequestSchema\b|\bPatientDocumentsParamsSchema\b|\bClinicalDocumentIdParamsSchema\b/,
    message:
      "ClinicalDocument request handling belongs in clinical-document-query-routes.ts, clinical-document-creation-routes.ts, clinical-document-command-routes.ts or clinical-document-fhir-routes.ts."
  },
  {
    pattern:
      /\bClinicalDocument\.create\b|\bDomainError\b|\bvalidateClinicalDocumentReferences\b/,
    message:
      "ClinicalDocument creation, signing and validation policy belongs outside the root route."
  },
  {
    pattern:
      /\bmapClinicalDocumentToFhir\b|\bmapClinicalDocumentToFhirProvenance\b|\bsendFhirOperationOutcome\b/,
    message:
      "ClinicalDocument FHIR export details belong in clinical-document-fhir-routes.ts."
  }
];
const requiredClinicalDocumentRegistrations = [
  "registerClinicalDocumentQueryRoutes",
  "registerClinicalDocumentCreationRoutes",
  "registerClinicalDocumentCommandRoutes",
  "registerClinicalDocumentFhirRoutes"
];

const procedureRoutesPath = resolve("apps/api/src/modules/procedures/procedure-routes.ts");
const forbiddenProcedureRoutePatterns = [
  {
    pattern:
      /\bCreateProcedureRequestSchema\b|\bPatientProceduresParamsSchema\b|\bProcedureIdParamsSchema\b/,
    message:
      "Procedure request handling belongs in procedure-query-routes.ts, procedure-creation-routes.ts or procedure-fhir-routes.ts."
  },
  {
    pattern: /\bProcedure\.record\b|\bDomainError\b|\bvalidateProcedureReferences\b/,
    message:
      "Procedure creation and validation policy belongs in procedure-creation-routes.ts and procedure-route-helpers.ts."
  },
  {
    pattern: /\bmapProcedureToFhir\b/,
    message: "Procedure FHIR export belongs in procedure-fhir-routes.ts."
  }
];
const requiredProcedureRegistrations = [
  "registerProcedureQueryRoutes",
  "registerProcedureCreationRoutes",
  "registerProcedureFhirRoutes"
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
const patientRoutesSource = await readFile(patientRoutesPath, "utf8");
const patientFhirRoutesSource = await readFile(patientFhirRoutesPath, "utf8");
const clinicalDocumentRoutesSource = await readFile(
  clinicalDocumentRoutesPath,
  "utf8"
);
const procedureRoutesSource = await readFile(procedureRoutesPath, "utf8");

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

for (const forbidden of forbiddenPatientRoutePatterns) {
  if (forbidden.pattern.test(patientRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredPatientRegistrations) {
  if (!patientRoutesSource.includes(registration)) {
    throw new Error(
      `Patient root routes must register ${registration} so registry, merge, query and FHIR route modules remain wired.`
    );
  }
}

for (const forbidden of forbiddenPatientFhirRoutePatterns) {
  if (forbidden.pattern.test(patientFhirRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredPatientFhirRegistrations) {
  if (!patientFhirRoutesSource.includes(registration)) {
    throw new Error(
      `Patient FHIR root routes must register ${registration} so resource and Bundle export modules remain wired.`
    );
  }
}

for (const forbidden of forbiddenClinicalDocumentRoutePatterns) {
  if (forbidden.pattern.test(clinicalDocumentRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredClinicalDocumentRegistrations) {
  if (!clinicalDocumentRoutesSource.includes(registration)) {
    throw new Error(
      `ClinicalDocument root routes must register ${registration} so query, command and FHIR modules remain wired.`
    );
  }
}

for (const forbidden of forbiddenProcedureRoutePatterns) {
  if (forbidden.pattern.test(procedureRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredProcedureRegistrations) {
  if (!procedureRoutesSource.includes(registration)) {
    throw new Error(
      `Procedure root routes must register ${registration} so query, command and FHIR modules remain wired.`
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
