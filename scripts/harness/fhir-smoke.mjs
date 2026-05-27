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
  AllergyIntolerance,
  ClinicalDocument,
  Condition,
  Consent,
  DiagnosticReport,
  Encounter,
  ImagingStudy,
  MedicationRequest,
  Observation,
  Patient,
  Procedure,
  ProviderDirectory,
  ServiceRequest,
  WorkflowTask,
  canAccess,
  mapAllergyIntoleranceToFhir,
  mapClinicalDocumentToFhir,
  mapConditionToFhir,
  mapDiagnosticReportToFhir,
  mapEncounterToFhir,
  mapImagingStudyToFhir,
  mapMedicationRequestToFhir,
  mapObservationToFhir,
  mapPatientRecordToFhirDocumentBundle,
  mapPatientRecordToFhirBundle,
  mapPatientToFhir,
  mapProcedureToFhir,
  mapProviderDirectoryToFhirBundle,
  mapServiceRequestToFhir,
  mapWorkflowTaskToFhir
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

const providerDirectory = ProviderDirectory.assemble({
  generatedAt: new Date("2026-05-27T00:00:00.000Z"),
  organizations: [
    {
      id: "hospital-hai-phong-demo",
      identifiers: [],
      active: true,
      type: "hospital",
      name: "Hai Phong Digital Hospital"
    },
    {
      id: "department-harness-001",
      identifiers: [],
      active: true,
      type: "department",
      name: "Harness Outpatient Department",
      partOfOrganizationId: "hospital-hai-phong-demo"
    },
    {
      id: "department-laboratory",
      identifiers: [],
      active: true,
      type: "laboratory",
      name: "Harness Laboratory",
      partOfOrganizationId: "hospital-hai-phong-demo"
    }
  ],
  practitioners: [
    {
      id: "practitioner-harness-001",
      identifiers: [],
      active: true,
      fullName: "Harness Clinician"
    }
  ],
  endpoints: [
    {
      id: "endpoint-pacs-harness-001",
      managingOrganizationId: "hospital-hai-phong-demo",
      status: "active",
      connectionType: "dicom-wado-rs",
      name: "Harness PACS DICOMweb",
      address: "https://pacs.harness.wiiicare.vn/dicom-web",
      payloadTypes: [
        {
          system: "http://hl7.org/fhir/resource-types",
          code: "ImagingStudy",
          display: "FHIR ImagingStudy"
        }
      ]
    }
  ],
  practitionerRoles: [
    {
      id: "role-practitioner-harness-001",
      practitionerId: "practitioner-harness-001",
      organizationId: "department-harness-001",
      active: true,
      code: {
        system: "http://terminology.hl7.org/CodeSystem/practitioner-role",
        code: "doctor",
        display: "Doctor"
      },
      endpointIds: ["endpoint-pacs-harness-001"]
    }
  ]
});

const fhirProviderDirectoryBundle = mapProviderDirectoryToFhirBundle(
  providerDirectory,
  new Date("2026-05-27T00:00:00.000Z")
);

if (fhirProviderDirectoryBundle.entry.length !== 6) {
  throw new Error(
    `Expected provider directory bundle to contain 6 entries, received ${fhirProviderDirectoryBundle.entry.length}`
  );
}

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

const allergyIntolerance = AllergyIntolerance.record({
  id: "allergy-intolerance-harness-001",
  patientId: patient.id,
  encounterId: encounter.id,
  type: "allergy",
  category: "medication",
  criticality: "high",
  code: {
    system: "http://snomed.info/sct",
    code: "91936005",
    display: "Allergy to penicillin"
  },
  reaction: {
    manifestation: {
      system: "http://snomed.info/sct",
      code: "271807003",
      display: "Skin rash"
    },
    severity: "moderate"
  },
  recordedAt: "2026-05-27T00:00:00.000Z",
  recorderPractitionerId: "practitioner-harness-001"
});

const fhirAllergyIntolerance = mapAllergyIntoleranceToFhir(allergyIntolerance);

if (fhirAllergyIntolerance.resourceType !== "AllergyIntolerance") {
  throw new Error(
    `Expected resourceType AllergyIntolerance, received ${fhirAllergyIntolerance.resourceType}`
  );
}

if (fhirAllergyIntolerance.patient.reference !== "Patient/patient-harness-001") {
  throw new Error(
    `Expected allergy patient Patient/patient-harness-001, received ${fhirAllergyIntolerance.patient.reference}`
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

const serviceRequest = ServiceRequest.order({
  id: "service-request-harness-001",
  patientId: patient.id,
  encounterId: encounter.id,
  reasonConditionId: condition.id,
  category: "laboratory",
  priority: "urgent",
  code: {
    system: "http://loinc.org",
    code: "58410-2",
    display: "Complete blood count panel"
  },
  occurrenceAt: "2026-05-27T01:00:00.000Z",
  authoredOn: "2026-05-27T00:00:00.000Z",
  requesterPractitionerId: "practitioner-harness-001",
  performerOrganizationId: "department-laboratory"
});

const fhirServiceRequest = mapServiceRequestToFhir(serviceRequest);

if (fhirServiceRequest.resourceType !== "ServiceRequest") {
  throw new Error(
    `Expected resourceType ServiceRequest, received ${fhirServiceRequest.resourceType}`
  );
}

if (fhirServiceRequest.subject.reference !== "Patient/patient-harness-001") {
  throw new Error(
    `Expected service request subject Patient/patient-harness-001, received ${fhirServiceRequest.subject.reference}`
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

const diagnosticReport = DiagnosticReport.issue({
  id: "diagnostic-report-harness-001",
  patientId: patient.id,
  encounterId: encounter.id,
  basedOnServiceRequestId: serviceRequest.id,
  category: "laboratory",
  code: {
    system: "http://loinc.org",
    code: "58410-2",
    display: "Complete blood count panel"
  },
  effectiveAt: "2026-05-27T01:30:00.000Z",
  issuedAt: "2026-05-27T02:00:00.000Z",
  performerOrganizationId: "department-laboratory",
  resultsInterpreterPractitionerId: "practitioner-harness-001",
  resultObservationIds: [observation.id],
  conclusion: "Harness diagnostic report links order and atomic result."
});

const fhirDiagnosticReport = mapDiagnosticReportToFhir(diagnosticReport);

if (fhirDiagnosticReport.resourceType !== "DiagnosticReport") {
  throw new Error(
    `Expected resourceType DiagnosticReport, received ${fhirDiagnosticReport.resourceType}`
  );
}

if (fhirDiagnosticReport.basedOn?.[0]?.reference !== "ServiceRequest/service-request-harness-001") {
  throw new Error(
    `Expected diagnostic report basedOn ServiceRequest/service-request-harness-001.`
  );
}

if (fhirDiagnosticReport.result?.[0]?.reference !== "Observation/observation-harness-001") {
  throw new Error(`Expected diagnostic report result Observation/observation-harness-001.`);
}

const imagingStudy = ImagingStudy.record({
  id: "imaging-study-harness-001",
  patientId: patient.id,
  encounterId: encounter.id,
  basedOnServiceRequestId: serviceRequest.id,
  diagnosticReportId: diagnosticReport.id,
  studyInstanceUid: "1.2.826.0.1.3680043.10.543.202605270101",
  accessionNumber: "HP-CXR-HARNESS-001",
  description: "Harness chest X-ray study",
  startedAt: "2026-05-27T01:10:00.000Z",
  referrerPractitionerId: "practitioner-harness-001",
  interpreterPractitionerId: "practitioner-harness-001",
  endpointId: "endpoint-pacs-harness-001",
  series: [
    {
      uid: "1.2.826.0.1.3680043.10.543.202605270101.1",
      number: 1,
      modality: {
        system: "http://dicom.nema.org/resources/ontology/DCM",
        code: "DX",
        display: "Digital Radiography"
      },
      description: "PA and lateral chest radiographs",
      numberOfInstances: 2,
      bodySite: {
        system: "http://snomed.info/sct",
        code: "51185008",
        display: "Thoracic structure"
      }
    }
  ]
});

const fhirImagingStudy = mapImagingStudyToFhir(imagingStudy);

if (fhirImagingStudy.resourceType !== "ImagingStudy") {
  throw new Error(`Expected resourceType ImagingStudy, received ${fhirImagingStudy.resourceType}`);
}

if (fhirImagingStudy.subject.reference !== "Patient/patient-harness-001") {
  throw new Error(
    `Expected imaging study subject Patient/patient-harness-001, received ${fhirImagingStudy.subject.reference}`
  );
}

if (fhirImagingStudy.basedOn?.[0]?.reference !== "ServiceRequest/service-request-harness-001") {
  throw new Error(`Expected imaging study basedOn ServiceRequest/service-request-harness-001.`);
}

const workflowTask = WorkflowTask.create({
  id: "workflow-task-harness-001",
  patientId: patient.id,
  encounterId: encounter.id,
  basedOnServiceRequestId: serviceRequest.id,
  status: "completed",
  priority: "urgent",
  code: {
    system: "urn:wiiicare:nexus:task-code",
    code: "fulfill-laboratory-order",
    display: "Fulfill laboratory order"
  },
  businessStatus: {
    code: "result-issued",
    display: "Result issued"
  },
  requesterPractitionerId: "practitioner-harness-001",
  ownerOrganizationId: "department-laboratory",
  authoredOn: "2026-05-27T00:00:00.000Z",
  lastModified: "2026-05-27T02:00:00.000Z",
  executionPeriod: {
    start: "2026-05-27T01:00:00.000Z",
    end: "2026-05-27T02:00:00.000Z"
  },
  inputReferences: [
    {
      resourceType: "ServiceRequest",
      id: serviceRequest.id,
      label: "Harness order"
    }
  ],
  outputReferences: [
    {
      resourceType: "Observation",
      id: observation.id,
      label: "Harness hemoglobin"
    },
    {
      resourceType: "DiagnosticReport",
      id: diagnosticReport.id,
      label: "Harness report"
    }
  ]
});

const fhirWorkflowTask = mapWorkflowTaskToFhir(workflowTask);

if (fhirWorkflowTask.resourceType !== "Task") {
  throw new Error(`Expected resourceType Task, received ${fhirWorkflowTask.resourceType}`);
}

if (fhirWorkflowTask.focus?.reference !== "ServiceRequest/service-request-harness-001") {
  throw new Error("Expected workflow task focus ServiceRequest/service-request-harness-001.");
}

const procedure = Procedure.record({
  id: "procedure-harness-001",
  patientId: patient.id,
  encounterId: encounter.id,
  basedOnServiceRequestId: serviceRequest.id,
  status: "completed",
  category: "diagnostic",
  code: {
    system: "http://snomed.info/sct",
    code: "168537006",
    display: "Chest X-ray"
  },
  performedPeriod: {
    start: "2026-05-27T01:00:00.000Z",
    end: "2026-05-27T01:10:00.000Z"
  },
  recorderPractitionerId: "practitioner-harness-001",
  performers: [
    {
      actorType: "Practitioner",
      actorId: "practitioner-harness-001",
      onBehalfOfOrganizationId: "department-harness-001"
    }
  ],
  reportReferences: [
    {
      resourceType: "DiagnosticReport",
      id: diagnosticReport.id
    }
  ]
});

const fhirProcedure = mapProcedureToFhir(procedure);

if (fhirProcedure.resourceType !== "Procedure") {
  throw new Error(`Expected resourceType Procedure, received ${fhirProcedure.resourceType}`);
}

if (fhirProcedure.basedOn?.[0]?.reference !== "ServiceRequest/service-request-harness-001") {
  throw new Error("Expected procedure basedOn ServiceRequest/service-request-harness-001.");
}

if (fhirProcedure.report?.[0]?.reference !== "DiagnosticReport/diagnostic-report-harness-001") {
  throw new Error("Expected procedure report DiagnosticReport/diagnostic-report-harness-001.");
}

const medicationRequest = MedicationRequest.prescribe({
  id: "medication-request-harness-001",
  patientId: patient.id,
  encounterId: encounter.id,
  reasonConditionId: condition.id,
  category: "outpatient",
  medicationCode: {
    system: "http://www.whocc.no/atc",
    code: "J01CA04",
    display: "Amoxicillin"
  },
  dosageInstruction: {
    text: "Take 500 mg every 8 hours after meals for 5 days",
    route: "Oral route",
    doseQuantity: {
      value: 500,
      unit: "mg",
      system: "http://unitsofmeasure.org",
      code: "mg"
    },
    frequency: 1,
    period: 8,
    periodUnit: "h"
  },
  authoredOn: "2026-05-27T00:00:00.000Z",
  requesterPractitionerId: "practitioner-harness-001",
  expectedSupplyDurationDays: 5
});

const fhirMedicationRequest = mapMedicationRequestToFhir(medicationRequest);

if (fhirMedicationRequest.resourceType !== "MedicationRequest") {
  throw new Error(
    `Expected resourceType MedicationRequest, received ${fhirMedicationRequest.resourceType}`
  );
}

if (fhirMedicationRequest.subject.reference !== "Patient/patient-harness-001") {
  throw new Error(
    `Expected medication request subject Patient/patient-harness-001, received ${fhirMedicationRequest.subject.reference}`
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
  allergyIntolerances: [allergyIntolerance],
  conditions: [condition],
  serviceRequests: [serviceRequest],
  workflowTasks: [workflowTask],
  procedures: [procedure],
  observations: [observation],
  diagnosticReports: [diagnosticReport],
  imagingStudies: [imagingStudy],
  medicationRequests: [medicationRequest],
  documents: [document],
  providerDirectory,
  generatedAt: new Date("2026-05-27T00:00:00.000Z")
});

if (fhirBundle.resourceType !== "Bundle") {
  throw new Error(`Expected resourceType Bundle, received ${fhirBundle.resourceType}`);
}

if (fhirBundle.type !== "collection") {
  throw new Error(`Expected bundle type collection, received ${fhirBundle.type}`);
}

if (fhirBundle.entry.length !== 18) {
  throw new Error(`Expected bundle to contain 18 entries, received ${fhirBundle.entry.length}`);
}

const fhirDocumentBundle = mapPatientRecordToFhirDocumentBundle({
  patient,
  encounters: [encounter],
  allergyIntolerances: [allergyIntolerance],
  conditions: [condition],
  serviceRequests: [serviceRequest],
  workflowTasks: [workflowTask],
  procedures: [procedure],
  observations: [observation],
  diagnosticReports: [diagnosticReport],
  imagingStudies: [imagingStudy],
  medicationRequests: [medicationRequest],
  documents: [document],
  providerDirectory,
  generatedAt: new Date("2026-05-27T00:00:00.000Z"),
  authorPractitionerId: "practitioner-harness-001"
});

if (fhirDocumentBundle.resourceType !== "Bundle") {
  throw new Error(
    `Expected document bundle resourceType Bundle, received ${fhirDocumentBundle.resourceType}`
  );
}

if (fhirDocumentBundle.type !== "document") {
  throw new Error(`Expected document bundle type document, received ${fhirDocumentBundle.type}`);
}

if (fhirDocumentBundle.entry[0]?.resource.resourceType !== "Composition") {
  throw new Error("Expected first document bundle entry to be Composition.");
}

if (fhirDocumentBundle.entry.length !== 19) {
  throw new Error(
    `Expected document bundle to contain 19 entries, received ${fhirDocumentBundle.entry.length}`
  );
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

const clinicianCanExportAllergyIntolerance = canAccess(
  {
    actorId: "practitioner-harness-001",
    role: "clinician",
    purposeOfUse: "TREATMENT"
  },
  "allergy-intolerance:fhir-export"
);

const clinicianCanExportMedicationRequest = canAccess(
  {
    actorId: "practitioner-harness-001",
    role: "clinician",
    purposeOfUse: "TREATMENT"
  },
  "medication-request:fhir-export"
);

const clinicianCanExportServiceRequest = canAccess(
  {
    actorId: "practitioner-harness-001",
    role: "clinician",
    purposeOfUse: "TREATMENT"
  },
  "service-request:fhir-export"
);

const clinicianCanExportWorkflowTask = canAccess(
  {
    actorId: "practitioner-harness-001",
    role: "clinician",
    purposeOfUse: "TREATMENT"
  },
  "workflow-task:fhir-export"
);

const clinicianCanExportProcedure = canAccess(
  {
    actorId: "practitioner-harness-001",
    role: "clinician",
    purposeOfUse: "TREATMENT"
  },
  "procedure:fhir-export"
);

const clinicianCanExportDiagnosticReport = canAccess(
  {
    actorId: "practitioner-harness-001",
    role: "clinician",
    purposeOfUse: "TREATMENT"
  },
  "diagnostic-report:fhir-export"
);

const clinicianCanExportImagingStudy = canAccess(
  {
    actorId: "practitioner-harness-001",
    role: "clinician",
    purposeOfUse: "TREATMENT"
  },
  "imaging-study:fhir-export"
);

const clinicianCanExportProviderDirectory = canAccess(
  {
    actorId: "practitioner-harness-001",
    role: "clinician",
    purposeOfUse: "TREATMENT"
  },
  "provider-directory:fhir-export"
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

const nurseCanExportAllergyIntolerance = canAccess(
  {
    actorId: "nurse-harness-001",
    role: "nurse",
    purposeOfUse: "TREATMENT"
  },
  "allergy-intolerance:fhir-export"
);

const nurseCanExportMedicationRequest = canAccess(
  {
    actorId: "nurse-harness-001",
    role: "nurse",
    purposeOfUse: "TREATMENT"
  },
  "medication-request:fhir-export"
);

const nurseCanExportServiceRequest = canAccess(
  {
    actorId: "nurse-harness-001",
    role: "nurse",
    purposeOfUse: "TREATMENT"
  },
  "service-request:fhir-export"
);

const nurseCanExportWorkflowTask = canAccess(
  {
    actorId: "nurse-harness-001",
    role: "nurse",
    purposeOfUse: "TREATMENT"
  },
  "workflow-task:fhir-export"
);

const nurseCanExportProcedure = canAccess(
  {
    actorId: "nurse-harness-001",
    role: "nurse",
    purposeOfUse: "TREATMENT"
  },
  "procedure:fhir-export"
);

const nurseCanExportDiagnosticReport = canAccess(
  {
    actorId: "nurse-harness-001",
    role: "nurse",
    purposeOfUse: "TREATMENT"
  },
  "diagnostic-report:fhir-export"
);

const nurseCanExportImagingStudy = canAccess(
  {
    actorId: "nurse-harness-001",
    role: "nurse",
    purposeOfUse: "TREATMENT"
  },
  "imaging-study:fhir-export"
);

const nurseCanExportProviderDirectory = canAccess(
  {
    actorId: "nurse-harness-001",
    role: "nurse",
    purposeOfUse: "TREATMENT"
  },
  "provider-directory:fhir-export"
);

const nurseCanReadProviderDirectory = canAccess(
  {
    actorId: "nurse-harness-001",
    role: "nurse",
    purposeOfUse: "TREATMENT"
  },
  "provider-directory:read"
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

if (!clinicianCanExportAllergyIntolerance) {
  throw new Error("Expected clinician/TREATMENT to export allergy intolerances.");
}

if (!clinicianCanExportMedicationRequest) {
  throw new Error("Expected clinician/TREATMENT to export medication requests.");
}

if (!clinicianCanExportServiceRequest) {
  throw new Error("Expected clinician/TREATMENT to export service requests.");
}

if (!clinicianCanExportWorkflowTask) {
  throw new Error("Expected clinician/TREATMENT to export workflow tasks.");
}

if (!clinicianCanExportProcedure) {
  throw new Error("Expected clinician/TREATMENT to export procedures.");
}

if (!clinicianCanExportDiagnosticReport) {
  throw new Error("Expected clinician/TREATMENT to export diagnostic reports.");
}

if (!clinicianCanExportImagingStudy) {
  throw new Error("Expected clinician/TREATMENT to export imaging studies.");
}

if (!clinicianCanExportProviderDirectory) {
  throw new Error("Expected clinician/TREATMENT to export provider directory.");
}

if (nurseCanExportObservation) {
  throw new Error("Expected nurse/TREATMENT to be denied observation:fhir-export.");
}

if (nurseCanExportCondition) {
  throw new Error("Expected nurse/TREATMENT to be denied condition:fhir-export.");
}

if (nurseCanExportAllergyIntolerance) {
  throw new Error("Expected nurse/TREATMENT to be denied allergy-intolerance:fhir-export.");
}

if (nurseCanExportMedicationRequest) {
  throw new Error("Expected nurse/TREATMENT to be denied medication-request:fhir-export.");
}

if (nurseCanExportServiceRequest) {
  throw new Error("Expected nurse/TREATMENT to be denied service-request:fhir-export.");
}

if (nurseCanExportWorkflowTask) {
  throw new Error("Expected nurse/TREATMENT to be denied workflow-task:fhir-export.");
}

if (nurseCanExportProcedure) {
  throw new Error("Expected nurse/TREATMENT to be denied procedure:fhir-export.");
}

if (nurseCanExportDiagnosticReport) {
  throw new Error("Expected nurse/TREATMENT to be denied diagnostic-report:fhir-export.");
}

if (nurseCanExportImagingStudy) {
  throw new Error("Expected nurse/TREATMENT to be denied imaging-study:fhir-export.");
}

if (nurseCanExportProviderDirectory) {
  throw new Error("Expected nurse/TREATMENT to be denied provider-directory:fhir-export.");
}

if (!nurseCanReadProviderDirectory) {
  throw new Error("Expected nurse/TREATMENT to read provider directory.");
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
      providerDirectoryEntryCount: fhirProviderDirectoryBundle.entry.length,
      documentId: fhirDocumentReference.id,
      documentResourceType: fhirDocumentReference.resourceType,
      encounterId: fhirEncounter.id,
      encounterResourceType: fhirEncounter.resourceType,
      allergyIntoleranceId: fhirAllergyIntolerance.id,
      allergyIntoleranceResourceType: fhirAllergyIntolerance.resourceType,
      conditionId: fhirCondition.id,
      conditionResourceType: fhirCondition.resourceType,
      observationId: fhirObservation.id,
      observationResourceType: fhirObservation.resourceType,
      diagnosticReportId: fhirDiagnosticReport.id,
      diagnosticReportResourceType: fhirDiagnosticReport.resourceType,
      imagingStudyId: fhirImagingStudy.id,
      imagingStudyResourceType: fhirImagingStudy.resourceType,
      medicationRequestId: fhirMedicationRequest.id,
      medicationRequestResourceType: fhirMedicationRequest.resourceType,
      serviceRequestId: fhirServiceRequest.id,
      serviceRequestResourceType: fhirServiceRequest.resourceType,
      workflowTaskId: fhirWorkflowTask.id,
      workflowTaskResourceType: fhirWorkflowTask.resourceType,
      procedureId: fhirProcedure.id,
      procedureResourceType: fhirProcedure.resourceType,
      bundleId: fhirBundle.id,
      bundleResourceType: fhirBundle.resourceType,
      bundleEntryCount: fhirBundle.entry.length,
      documentBundleId: fhirDocumentBundle.id,
      documentBundleType: fhirDocumentBundle.type,
      documentBundleFirstResourceType: fhirDocumentBundle.entry[0]?.resource.resourceType,
      documentBundleEntryCount: fhirDocumentBundle.entry.length,
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
        clinicianCanExportAllergyIntolerance,
        clinicianCanExportCondition,
        clinicianCanExportDiagnosticReport,
        clinicianCanExportImagingStudy,
        clinicianCanExportMedicationRequest,
        clinicianCanExportObservation,
        clinicianCanExportProviderDirectory,
        clinicianCanExportServiceRequest,
        clinicianCanExportWorkflowTask,
        clinicianCanExportProcedure,
        nurseCanExportAllergyIntolerance,
        nurseCanExportCondition,
        nurseCanExportDiagnosticReport,
        nurseCanExportImagingStudy,
        nurseCanExportMedicationRequest,
        nurseCanExportObservation,
        nurseCanExportProviderDirectory,
        nurseCanReadProviderDirectory,
        nurseCanExportServiceRequest,
        nurseCanExportWorkflowTask,
        nurseCanExportProcedure,
        clinicianCanReadAudit,
        auditorCanReadAudit
      }
    },
    null,
    2
  )
);
