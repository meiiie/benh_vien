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
  Encounter,
  Patient,
  canAccess,
  mapClinicalDocumentToFhir,
  mapEncounterToFhir,
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
      auditAction: auditEvent.toSnapshot().action,
      auth: {
        actorId: verifiedSession.actor.actorId,
        role: verifiedSession.actor.role,
        expiresAt: authSession.expiresAt
      },
      rbac: {
        clinicianCanCreateEncounter,
        clinicianCanCreateDocument,
        clinicianCanReadAudit,
        auditorCanReadAudit
      }
    },
    null,
    2
  )
);
