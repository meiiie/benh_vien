import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const domainEntry = resolve("packages/domain/dist/index.js");
const apiAuthEntry = resolve("apps/api/dist/modules/auth/auth-session.js");

if (!existsSync(domainEntry)) {
  throw new Error("packages/domain/dist/index.js was not found. Run `pnpm build` first.");
}

if (!existsSync(apiAuthEntry)) {
  throw new Error("apps/api/dist/modules/auth/auth-session.js was not found. Run `pnpm build` first.");
}

const {
  AuditEvent,
  ClinicalDocument,
  Condition,
  Consent,
  Encounter,
  Observation,
  Patient,
  canAccess,
  mapClinicalDocumentToFhir,
  mapConditionToFhir,
  mapEncounterToFhir,
  mapObservationToFhir,
  mapPatientRecordToFhirBundle,
  mapPatientToFhir
} = await import(pathToFileURL(domainEntry).href);

const { createAccessToken, verifyAccessToken } = await import(pathToFileURL(apiAuthEntry).href);

const authSession = createAccessToken(
  {
    actorId: "practitioner-harness-001",
    displayName: "Harness Clinician",
    role: "clinician"
  },
  new Date("2026-05-27T00:00:00.000Z")
);

const verifiedSession = verifyAccessToken(
  authSession.accessToken,
  new Date("2026-05-27T00:01:00.000Z")
);

if (verifiedSession?.actor.actorId !== "practitioner-harness-001") {
  throw new Error("Expected auth token to verify clinician actor.");
}

const expiredSession = verifyAccessToken(
  authSession.accessToken,
  new Date("2026-05-28T00:01:00.000Z")
);

if (expiredSession) {
  throw new Error("Expected auth token to expire after the session TTL.");
}

const patient = Patient.register({
  id: "patient-harness-001",
  identifiers: [
    {
      system: "urn:benh-vien-so:mrn",
      value: "MRN-HARNESS-001",
      type: "hospital-mrn"
    }
  ],
  fullName: "Nguyen Van Harness",
  birthDate: "1990-01-01",
  gender: "male",
  managingOrganizationId: "hospital-hai-phong-demo"
});

const fhirPatient = mapPatientToFhir(patient);

if (fhirPatient.resourceType !== "Patient") {
  throw new Error(`Expected resourceType Patient, received ${fhirPatient.resourceType}`);
}

if (fhirPatient.id !== "patient-harness-001") {
  throw new Error(`Expected id patient-harness-001, received ${fhirPatient.id}`);
}

const encounter = Encounter.create({
  id: "encounter-harness-001",
  patientId: patient.id,
  class: "ambulatory",
  serviceType: "Outpatient follow-up",
  reasonText: "Validate encounter mapping",
  departmentId: "department-harness-001",
  attendingPractitionerId: "practitioner-harness-001",
  startedAt: "2026-05-27T00:00:00.000Z"
});

const fhirEncounter = mapEncounterToFhir(encounter);

if (fhirEncounter.resourceType !== "Encounter") {
  throw new Error(`Expected resourceType Encounter, received ${fhirEncounter.resourceType}`);
}

if (fhirEncounter.subject.reference !== "Patient/patient-harness-001") {
  throw new Error(
    `Expected encounter subject Patient/patient-harness-001, received ${fhirEncounter.subject.reference}`
  );
}

const condition = Condition.record({
  id: "condition-harness-001",
  patientId: patient.id,
  encounterId: encounter.id,
  category: "encounter-diagnosis",
  code: {
    system: "http://hl7.org/fhir/sid/icd-10",
    code: "R50.9",
    display: "Fever, unspecified"
  },
  severity: "mild",
  onsetAt: "2026-05-27T00:00:00.000Z",
  recorderPractitionerId: "practitioner-harness-001"
});

const fhirCondition = mapConditionToFhir(condition);

if (fhirCondition.resourceType !== "Condition") {
  throw new Error(`Expected resourceType Condition, received ${fhirCondition.resourceType}`);
}

if (fhirCondition.subject.reference !== "Patient/patient-harness-001") {
  throw new Error(
    `Expected condition subject Patient/patient-harness-001, received ${fhirCondition.subject.reference}`
  );
}

const observation = Observation.record({
  id: "observation-harness-001",
  patientId: patient.id,
  encounterId: encounter.id,
  category: "laboratory",
  code: {
    system: "http://loinc.org",
    code: "718-7",
    display: "Hemoglobin"
  },
  effectiveAt: "2026-05-27T00:00:00.000Z",
  valueQuantity: {
    value: 13.6,
    unit: "g/dL",
    system: "http://unitsofmeasure.org",
    code: "g/dL"
  },
  performerPractitionerId: "practitioner-harness-001"
});

const fhirObservation = mapObservationToFhir(observation);

if (fhirObservation.resourceType !== "Observation") {
  throw new Error(`Expected resourceType Observation, received ${fhirObservation.resourceType}`);
}

if (fhirObservation.subject.reference !== "Patient/patient-harness-001") {
  throw new Error(
    `Expected observation subject Patient/patient-harness-001, received ${fhirObservation.subject.reference}`
  );
}

const document = ClinicalDocument.create({
  id: "clinical-document-harness-001",
  patientId: patient.id,
  encounterId: encounter.id,
  type: "referral-letter",
  title: "Referral letter harness",
  storageUri: "s3://wiiicare-harness/patients/patient-harness-001/referral-letter.pdf",
  authorPractitionerId: "practitioner-harness-001"
});

document.sign(new Date("2026-05-27T00:00:00.000Z"));

const fhirDocumentReference = mapClinicalDocumentToFhir(document);

if (fhirDocumentReference.resourceType !== "DocumentReference") {
  throw new Error(
    `Expected resourceType DocumentReference, received ${fhirDocumentReference.resourceType}`
  );
}

if (fhirDocumentReference.subject.reference !== "Patient/patient-harness-001") {
  throw new Error(
    `Expected subject Patient/patient-harness-001, received ${fhirDocumentReference.subject.reference}`
  );
}

if (fhirDocumentReference.docStatus !== "final") {
  throw new Error(`Expected docStatus final, received ${fhirDocumentReference.docStatus}`);
}

const fhirBundle = mapPatientRecordToFhirBundle({
  patient,
  encounters: [encounter],
  conditions: [condition],
  observations: [observation],
  documents: [document],
  generatedAt: new Date("2026-05-27T00:00:00.000Z")
});

if (fhirBundle.resourceType !== "Bundle") {
  throw new Error(`Expected resourceType Bundle, received ${fhirBundle.resourceType}`);
}

if (fhirBundle.type !== "collection") {
  throw new Error(`Expected bundle type collection, received ${fhirBundle.type}`);
}

if (fhirBundle.entry.length !== 5) {
  throw new Error(`Expected bundle to contain 5 entries, received ${fhirBundle.entry.length}`);
}

const consent = Consent.grant({
  id: "consent-harness-001",
  patientId: patient.id,
  category: "record-sharing",
  granteeOrganizationId: "hospital-harness-recipient",
  grantorActorId: "practitioner-harness-001",
  validFrom: "2026-05-27T00:00:00.000Z",
  validUntil: "2026-05-28T00:00:00.000Z"
});

if (
  !consent.allowsRecordSharing({
    patientId: patient.id,
    granteeOrganizationId: "hospital-harness-recipient",
    at: new Date("2026-05-27T12:00:00.000Z")
  })
) {
  throw new Error("Expected consent to allow record sharing for covered recipient.");
}

if (
  consent.allowsRecordSharing({
    patientId: patient.id,
    granteeOrganizationId: "hospital-not-covered",
    at: new Date("2026-05-27T12:00:00.000Z")
  })
) {
  throw new Error("Expected consent to deny record sharing for uncovered recipient.");
}

const auditEvent = AuditEvent.record({
  actorId: "practitioner-harness-001",
  action: "clinical-document.fhir-export",
  resourceType: "ClinicalDocument",
  resourceId: document.id,
  patientId: patient.id,
  purposeOfUse: "TREATMENT",
  metadata: {
    resourceType: "DocumentReference"
  }
});

if (auditEvent.toSnapshot().patientId !== "patient-harness-001") {
  throw new Error(`Expected audit patientId patient-harness-001.`);
}

if (auditEvent.toSnapshot().action !== "clinical-document.fhir-export") {
  throw new Error(`Expected audit action clinical-document.fhir-export.`);
}

const clinicianCanCreateDocument = canAccess(
  {
    actorId: "practitioner-harness-001",
    role: "clinician",
    purposeOfUse: "TREATMENT"
  },
  "clinical-document:create"
);

const clinicianCanCreateEncounter = canAccess(
  {
    actorId: "practitioner-harness-001",
    role: "clinician",
    purposeOfUse: "TREATMENT"
  },
  "encounter:create"
);

const clinicianCanExportObservation = canAccess(
  {
    actorId: "practitioner-harness-001",
    role: "clinician",
    purposeOfUse: "TREATMENT"
  },
  "observation:fhir-export"
);

const clinicianCanExportCondition = canAccess(
  {
    actorId: "practitioner-harness-001",
    role: "clinician",
    purposeOfUse: "TREATMENT"
  },
  "condition:fhir-export"
);

const nurseCanExportObservation = canAccess(
  {
    actorId: "nurse-harness-001",
    role: "nurse",
    purposeOfUse: "TREATMENT"
  },
  "observation:fhir-export"
);

const nurseCanExportCondition = canAccess(
  {
    actorId: "nurse-harness-001",
    role: "nurse",
    purposeOfUse: "TREATMENT"
  },
  "condition:fhir-export"
);

const clinicianCanReadAudit = canAccess(
  {
    actorId: "practitioner-harness-001",
    role: "clinician",
    purposeOfUse: "TREATMENT"
  },
  "audit-event:list"
);

const auditorCanReadAudit = canAccess(
  {
    actorId: "auditor-harness-001",
    role: "auditor",
    purposeOfUse: "AUDIT"
  },
  "audit-event:list"
);

if (!clinicianCanCreateDocument) {
  throw new Error("Expected clinician/TREATMENT to create clinical documents.");
}

if (!clinicianCanCreateEncounter) {
  throw new Error("Expected clinician/TREATMENT to create encounters.");
}

if (!clinicianCanExportObservation) {
  throw new Error("Expected clinician/TREATMENT to export observations.");
}

if (!clinicianCanExportCondition) {
  throw new Error("Expected clinician/TREATMENT to export conditions.");
}

if (nurseCanExportObservation) {
  throw new Error("Expected nurse/TREATMENT to be denied observation:fhir-export.");
}

if (nurseCanExportCondition) {
  throw new Error("Expected nurse/TREATMENT to be denied condition:fhir-export.");
}

if (clinicianCanReadAudit) {
  throw new Error("Expected clinician/TREATMENT to be denied audit-event:list.");
}

if (!auditorCanReadAudit) {
  throw new Error("Expected auditor/AUDIT to read audit events.");
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "FHIR, AuditEvent and RBAC smoke test",
      patientId: fhirPatient.id,
      patientResourceType: fhirPatient.resourceType,
      documentId: fhirDocumentReference.id,
      documentResourceType: fhirDocumentReference.resourceType,
      encounterId: fhirEncounter.id,
      encounterResourceType: fhirEncounter.resourceType,
      conditionId: fhirCondition.id,
      conditionResourceType: fhirCondition.resourceType,
      observationId: fhirObservation.id,
      observationResourceType: fhirObservation.resourceType,
      bundleId: fhirBundle.id,
      bundleResourceType: fhirBundle.resourceType,
      bundleEntryCount: fhirBundle.entry.length,
      consentId: consent.id,
      auditAction: auditEvent.toSnapshot().action,
      auth: {
        actorId: verifiedSession.actor.actorId,
        role: verifiedSession.actor.role,
        expiresAt: authSession.expiresAt
      },
      rbac: {
        clinicianCanCreateEncounter,
        clinicianCanCreateDocument,
        clinicianCanExportCondition,
        clinicianCanExportObservation,
        nurseCanExportCondition,
        nurseCanExportObservation,
        clinicianCanReadAudit,
        auditorCanReadAudit
      }
    },
    null,
    2
  )
);
