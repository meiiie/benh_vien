import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const domainEntry = resolve("packages/domain/dist/index.js");

if (!existsSync(domainEntry)) {
  throw new Error("packages/domain/dist/index.js was not found. Run `pnpm build` first.");
}

const { AuditEvent, ClinicalDocument, Patient, mapClinicalDocumentToFhir, mapPatientToFhir } =
  await import(pathToFileURL(domainEntry).href);

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

const document = ClinicalDocument.create({
  id: "clinical-document-harness-001",
  patientId: patient.id,
  encounterId: "encounter-harness-001",
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

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "FHIR Patient, DocumentReference and AuditEvent smoke test",
      patientId: fhirPatient.id,
      patientResourceType: fhirPatient.resourceType,
      documentId: fhirDocumentReference.id,
      documentResourceType: fhirDocumentReference.resourceType,
      auditAction: auditEvent.toSnapshot().action
    },
    null,
    2
  )
);
