import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  auditHeaders,
  captureAuthBoundaryEnv,
  loginForToken,
  readyServer,
  restoreAuthBoundaryEnv,
  treatmentHeaders
} from "./server.auth.test-support.js";

describe("API patient access ABAC boundary", () => {
  let app: FastifyInstance;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(() => {
    applyDefaultAuthBoundaryEnv();
  });

  afterEach(async () => {
    await app.close();
    restoreAuthBoundaryEnv(originalEnv);
  });

  async function createTreatmentResource(
    token: string,
    url: string,
    payload: Record<string, unknown>
  ): Promise<string> {
    const response = await app.inject({
      method: "POST",
      url,
      headers: {
        ...treatmentHeaders(token),
        "content-type": "application/json"
      },
      payload
    });

    expect(response.statusCode).toBe(201);
    return response.json().id as string;
  }

  it("filters treatment patient access by the actor provider organization", async () => {
    app = await readyServer();
    const adminToken = await loginForToken(app, "admin-demo", "admin");
    const clinicianToken = await loginForToken(app, "practitioner-demo-001", "clinician");
    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients",
      headers: {
        ...treatmentHeaders(adminToken),
        "content-type": "application/json"
      },
      payload: {
        identifiers: [
          {
            system: "urn:benh-vien-so:mrn",
            value: "MRN-OUTSIDE-TEST",
            type: "hospital-mrn"
          }
        ],
        fullName: "Outside Hospital Patient",
        gender: "unknown",
        managingOrganizationId: "hospital-outside-demo"
      }
    });
    const outsidePatientId = createResponse.json().id as string;

    expect(createResponse.statusCode).toBe(201);

    const clinicianListResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: treatmentHeaders(clinicianToken)
    });
    const clinicianPatientIds = clinicianListResponse
      .json()
      .items.map((patient: { readonly id: string }) => patient.id);

    expect(clinicianListResponse.statusCode).toBe(200);
    expect(clinicianPatientIds).toContain("patient-demo-001");
    expect(clinicianPatientIds).not.toContain(outsidePatientId);

    const clinicianReadResponse = await app.inject({
      method: "GET",
      url: `/api/v1/patients/${outsidePatientId}`,
      headers: {
        ...treatmentHeaders(clinicianToken),
        "x-request-id": "patient-abac-denied-001"
      }
    });

    expect(clinicianReadResponse.statusCode).toBe(403);
    expect(clinicianReadResponse.json()).toMatchObject({
      error: "PATIENT_ACCESS_DENIED",
      requestId: "patient-abac-denied-001",
      patientId: outsidePatientId,
      actor: {
        id: "practitioner-demo-001",
        role: "clinician",
        purposeOfUse: "TREATMENT"
      }
    });

    for (const [url, requestId] of [
      [`/api/v1/patients/${outsidePatientId}/encounters`, "encounter-list-abac-denied-001"],
      [
        `/api/v1/patients/${outsidePatientId}/allergy-intolerances`,
        "allergy-list-abac-denied-001"
      ],
      [`/api/v1/patients/${outsidePatientId}/conditions`, "condition-list-abac-denied-001"],
      [
        `/api/v1/patients/${outsidePatientId}/medication-requests`,
        "medication-request-list-abac-denied-001"
      ],
      [
        `/api/v1/patients/${outsidePatientId}/medication-dispenses`,
        "medication-dispense-list-abac-denied-001"
      ],
      [
        `/api/v1/patients/${outsidePatientId}/medication-administrations`,
        "medication-administration-list-abac-denied-001"
      ],
      [`/api/v1/patients/${outsidePatientId}/documents`, "document-list-abac-denied-001"],
      [`/api/v1/patients/${outsidePatientId}/observations`, "observation-list-abac-denied-001"],
      [
        `/api/v1/patients/${outsidePatientId}/service-requests`,
        "service-request-list-abac-denied-001"
      ],
      [
        `/api/v1/patients/${outsidePatientId}/workflow-tasks`,
        "workflow-task-list-abac-denied-001"
      ],
      [`/api/v1/patients/${outsidePatientId}/procedures`, "procedure-list-abac-denied-001"],
      [
        `/api/v1/patients/${outsidePatientId}/diagnostic-reports`,
        "diagnostic-report-list-abac-denied-001"
      ],
      [
        `/api/v1/patients/${outsidePatientId}/imaging-studies`,
        "imaging-study-list-abac-denied-001"
      ],
      [`/api/v1/patients/${outsidePatientId}/consents`, "consent-list-abac-denied-001"],
      [
        `/api/v1/patients/${outsidePatientId}/record-transfers`,
        "record-transfer-list-abac-denied-001"
      ]
    ] as const) {
      const response = await app.inject({
        method: "GET",
        url,
        headers: {
          ...treatmentHeaders(clinicianToken),
          "x-request-id": requestId
        }
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({
        error: "PATIENT_ACCESS_DENIED",
        requestId,
        patientId: outsidePatientId
      });
    }

    const outsideEncounterId = await createTreatmentResource(
      adminToken,
      `/api/v1/patients/${outsidePatientId}/encounters`,
      {
        class: "ambulatory",
        serviceType: "Khám ngoài tổ chức",
        reasonText: "Encounter ngoài tổ chức để kiểm tra ABAC.",
        attendingPractitionerId: "practitioner-demo-003",
        startedAt: "2026-05-28T00:30:00.000Z"
      }
    );

    const outsideAllergyId = await createTreatmentResource(
      adminToken,
      `/api/v1/patients/${outsidePatientId}/allergy-intolerances`,
      {
        encounterId: outsideEncounterId,
        type: "allergy",
        category: "medication",
        code: {
          system: "http://snomed.info/sct",
          code: "91936005",
          display: "Allergy to penicillin"
        },
        recorderPractitionerId: "practitioner-demo-003"
      }
    );

    const outsideConditionId = await createTreatmentResource(
      adminToken,
      `/api/v1/patients/${outsidePatientId}/conditions`,
      {
        encounterId: outsideEncounterId,
        category: "encounter-diagnosis",
        code: {
          system: "http://hl7.org/fhir/sid/icd-10",
          code: "J18.9",
          display: "Pneumonia, unspecified organism"
        },
        recorderPractitionerId: "practitioner-demo-003"
      }
    );

    const outsideDocumentId = await createTreatmentResource(
      adminToken,
      `/api/v1/patients/${outsidePatientId}/documents`,
      {
        type: "referral-letter",
        title: "Outside referral letter",
        storageUri: "s3://wiiicare-test/outside/referral-letter.pdf",
        authorPractitionerId: "practitioner-demo-003"
      }
    );

    const outsideObservationId = await createTreatmentResource(
      adminToken,
      `/api/v1/patients/${outsidePatientId}/observations`,
      {
        category: "vital-signs",
        code: {
          system: "http://loinc.org",
          code: "8310-5",
          display: "Body temperature"
        },
        effectiveAt: "2026-05-28T01:00:00.000Z",
        valueQuantity: {
          value: 37,
          unit: "Cel",
          system: "http://unitsofmeasure.org",
          code: "Cel"
        },
        performerPractitionerId: "practitioner-demo-001"
      }
    );

    const outsideMedicationRequestId = await createTreatmentResource(
      adminToken,
      `/api/v1/patients/${outsidePatientId}/medication-requests`,
      {
        encounterId: outsideEncounterId,
        reasonConditionId: outsideConditionId,
        category: "outpatient",
        medicationCode: {
          system: "http://www.whocc.no/atc",
          code: "J01CA04",
          display: "Amoxicillin"
        },
        dosageInstruction: {
          text: "Take 500 mg every 8 hours",
          route: "Oral route",
          doseQuantity: {
            value: 500,
            unit: "mg",
            system: "http://unitsofmeasure.org",
            code: "mg"
          },
          frequency: 3,
          period: 1,
          periodUnit: "d"
        },
        requesterPractitionerId: "practitioner-demo-003",
        expectedSupplyDurationDays: 7
      }
    );

    const outsideMedicationDispenseId = await createTreatmentResource(
      adminToken,
      `/api/v1/patients/${outsidePatientId}/medication-dispenses`,
      {
        encounterId: outsideEncounterId,
        medicationRequestId: outsideMedicationRequestId,
        status: "completed",
        category: "outpatient",
        medicationCode: {
          system: "http://www.whocc.no/atc",
          code: "J01CA04",
          display: "Amoxicillin"
        },
        quantity: {
          value: 21,
          unit: "tablet",
          system: "http://unitsofmeasure.org",
          code: "{tablet}"
        },
        daysSupply: {
          value: 7,
          unit: "day",
          system: "http://unitsofmeasure.org",
          code: "d"
        },
        whenPrepared: "2026-05-28T01:10:00.000Z",
        whenHandedOver: "2026-05-28T01:15:00.000Z",
        dispenserPractitionerId: "nurse-demo-001",
        receiverPractitionerId: "nurse-demo-001",
        dosageInstruction: {
          text: "Take 500 mg every 8 hours",
          route: "Oral route",
          doseQuantity: {
            value: 500,
            unit: "mg",
            system: "http://unitsofmeasure.org",
            code: "mg"
          },
          frequency: 3,
          period: 1,
          periodUnit: "d"
        }
      }
    );

    const outsideMedicationAdministrationId = await createTreatmentResource(
      adminToken,
      `/api/v1/patients/${outsidePatientId}/medication-administrations`,
      {
        encounterId: outsideEncounterId,
        medicationRequestId: outsideMedicationRequestId,
        reasonConditionId: outsideConditionId,
        status: "completed",
        category: "outpatient",
        medicationCode: {
          system: "http://www.whocc.no/atc",
          code: "J01CA04",
          display: "Amoxicillin"
        },
        effectivePeriod: {
          start: "2026-05-28T01:20:00.000Z"
        },
        performers: [
          {
            actorType: "Practitioner",
            actorId: "nurse-demo-001"
          }
        ],
        dosage: {
          text: "Take 500 mg every 8 hours",
          route: {
            system: "http://snomed.info/sct",
            code: "26643006",
            display: "Oral route"
          },
          doseQuantity: {
            value: 500,
            unit: "mg",
            system: "http://unitsofmeasure.org",
            code: "mg"
          }
        }
      }
    );

    const outsideServiceRequestId = await createTreatmentResource(
      adminToken,
      `/api/v1/patients/${outsidePatientId}/service-requests`,
      {
        encounterId: outsideEncounterId,
        reasonConditionId: outsideConditionId,
        category: "laboratory",
        code: {
          system: "http://loinc.org",
          code: "58410-2",
          display: "Complete blood count panel"
        },
        requesterPractitionerId: "practitioner-demo-003"
      }
    );

    const outsideDiagnosticReportId = await createTreatmentResource(
      adminToken,
      `/api/v1/patients/${outsidePatientId}/diagnostic-reports`,
      {
        encounterId: outsideEncounterId,
        basedOnServiceRequestId: outsideServiceRequestId,
        category: "laboratory",
        code: {
          system: "http://loinc.org",
          code: "58410-2",
          display: "Complete blood count panel"
        },
        effectiveAt: "2026-05-28T01:30:00.000Z",
        issuedAt: "2026-05-28T01:45:00.000Z",
        performerOrganizationId: "department-laboratory",
        resultsInterpreterPractitionerId: "practitioner-demo-003",
        resultObservationIds: [outsideObservationId],
        conclusion: "Outside diagnostic report for ABAC verification."
      }
    );

    const outsideProcedureId = await createTreatmentResource(
      adminToken,
      `/api/v1/patients/${outsidePatientId}/procedures`,
      {
        encounterId: outsideEncounterId,
        basedOnServiceRequestId: outsideServiceRequestId,
        reasonConditionId: outsideConditionId,
        status: "completed",
        category: "diagnostic",
        code: {
          system: "http://snomed.info/sct",
          code: "168537006",
          display: "Chest X-ray"
        },
        performedPeriod: {
          start: "2026-05-28T02:00:00.000Z",
          end: "2026-05-28T02:10:00.000Z"
        },
        performers: [
          {
            actorType: "Practitioner",
            actorId: "practitioner-demo-003",
            onBehalfOfOrganizationId: "hospital-outside-demo"
          }
        ],
        reportReferences: [
          {
            resourceType: "DiagnosticReport",
            id: outsideDiagnosticReportId
          }
        ],
        note: "Outside procedure for ABAC verification."
      }
    );

    const outsideImagingStudyId = await createTreatmentResource(
      adminToken,
      `/api/v1/patients/${outsidePatientId}/imaging-studies`,
      {
        encounterId: outsideEncounterId,
        basedOnServiceRequestId: outsideServiceRequestId,
        diagnosticReportId: outsideDiagnosticReportId,
        studyInstanceUid: "1.2.826.0.1.3680043.10.543.202605280001",
        accessionNumber: "OUTSIDE-CXR-ABAC-001",
        description: "Outside chest X-ray study for ABAC verification",
        startedAt: "2026-05-28T02:00:00.000Z",
        referrerPractitionerId: "practitioner-demo-003",
        interpreterPractitionerId: "practitioner-demo-003",
        endpointId: "endpoint-pacs-hai-phong-demo",
        series: [
          {
            uid: "1.2.826.0.1.3680043.10.543.202605280001.1",
            number: 1,
            modality: {
              system: "http://dicom.nema.org/resources/ontology/DCM",
              code: "DX",
              display: "Digital Radiography"
            },
            description: "Outside chest radiograph",
            numberOfInstances: 1,
            bodySite: {
              system: "http://snomed.info/sct",
              code: "51185008",
              display: "Thoracic structure"
            }
          }
        ]
      }
    );

    const outsideTaskId = await createTreatmentResource(
      adminToken,
      `/api/v1/patients/${outsidePatientId}/workflow-tasks`,
      {
        encounterId: outsideEncounterId,
        basedOnServiceRequestId: outsideServiceRequestId,
        status: "requested",
        code: {
          system: "urn:wiiicare:nexus:workflow-task",
          code: "lab-order",
          display: "Lab order"
        },
        requesterPractitionerId: "practitioner-demo-003",
        ownerOrganizationId: "hospital-outside-demo"
      }
    );

    const outsideConsentId = await createTreatmentResource(
      adminToken,
      `/api/v1/patients/${outsidePatientId}/consents`,
      {
        category: "record-sharing",
        granteeOrganizationId: "hospital-hai-phong-referral",
        validFrom: "2026-05-28T00:00:00.000Z",
        validUntil: "2026-12-31T23:59:59.000Z"
      }
    );

    const outsideTransferId = await createTreatmentResource(
      adminToken,
      `/api/v1/patients/${outsidePatientId}/record-transfers`,
      {
        bundleType: "document",
        sourceOrganizationId: "hospital-outside-demo",
        recipientOrganizationId: "hospital-hai-phong-referral",
        consentReference: outsideConsentId,
        reason: "Outside transfer for ABAC verification."
      }
    );

    for (const [url, requestId] of [
      [`/api/v1/encounters/${outsideEncounterId}`, "encounter-read-abac-denied-001"],
      [
        `/api/v1/allergy-intolerances/${outsideAllergyId}`,
        "allergy-read-abac-denied-001"
      ],
      [`/api/v1/conditions/${outsideConditionId}`, "condition-read-abac-denied-001"],
      [
        `/api/v1/medication-requests/${outsideMedicationRequestId}`,
        "medication-request-read-abac-denied-001"
      ],
      [
        `/api/v1/medication-dispenses/${outsideMedicationDispenseId}`,
        "medication-dispense-read-abac-denied-001"
      ],
      [
        `/api/v1/medication-administrations/${outsideMedicationAdministrationId}`,
        "medication-administration-read-abac-denied-001"
      ],
      [`/api/v1/clinical-documents/${outsideDocumentId}/fhir`, "document-read-abac-denied-001"],
      [`/api/v1/observations/${outsideObservationId}`, "observation-read-abac-denied-001"],
      [
        `/api/v1/service-requests/${outsideServiceRequestId}`,
        "service-request-read-abac-denied-001"
      ],
      [`/api/v1/workflow-tasks/${outsideTaskId}`, "workflow-task-read-abac-denied-001"],
      [`/api/v1/procedures/${outsideProcedureId}`, "procedure-read-abac-denied-001"],
      [
        `/api/v1/diagnostic-reports/${outsideDiagnosticReportId}`,
        "diagnostic-report-read-abac-denied-001"
      ],
      [
        `/api/v1/imaging-studies/${outsideImagingStudyId}`,
        "imaging-study-read-abac-denied-001"
      ],
      [`/api/v1/record-transfers/${outsideTransferId}`, "transfer-read-abac-denied-001"]
    ] as const) {
      const response = await app.inject({
        method: "GET",
        url,
        headers: {
          ...treatmentHeaders(clinicianToken),
          "x-request-id": requestId
        }
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({
        error: "PATIENT_ACCESS_DENIED",
        requestId,
        patientId: outsidePatientId
      });
    }

    for (const [url, requestId] of [
      [`/api/v1/encounters/${outsideEncounterId}/fhir`, "encounter-export-abac-denied-001"],
      [
        `/api/v1/allergy-intolerances/${outsideAllergyId}/fhir`,
        "allergy-export-abac-denied-001"
      ],
      [`/api/v1/conditions/${outsideConditionId}/fhir`, "condition-export-abac-denied-001"],
      [
        `/api/v1/medication-requests/${outsideMedicationRequestId}/fhir`,
        "medication-request-export-abac-denied-001"
      ],
      [
        `/api/v1/medication-dispenses/${outsideMedicationDispenseId}/fhir`,
        "medication-dispense-export-abac-denied-001"
      ],
      [
        `/api/v1/medication-administrations/${outsideMedicationAdministrationId}/fhir`,
        "medication-administration-export-abac-denied-001"
      ],
      [
        `/api/v1/service-requests/${outsideServiceRequestId}/fhir`,
        "service-request-export-abac-denied-001"
      ],
      [`/api/v1/workflow-tasks/${outsideTaskId}/fhir`, "workflow-task-export-abac-denied-001"],
      [`/api/v1/procedures/${outsideProcedureId}/fhir`, "procedure-export-abac-denied-001"],
      [
        `/api/v1/diagnostic-reports/${outsideDiagnosticReportId}/fhir`,
        "diagnostic-report-export-abac-denied-001"
      ],
      [
        `/api/v1/imaging-studies/${outsideImagingStudyId}/fhir`,
        "imaging-study-export-abac-denied-001"
      ],
      [`/api/v1/consents/${outsideConsentId}/fhir`, "consent-export-abac-denied-001"]
    ] as const) {
      const response = await app.inject({
        method: "GET",
        url,
        headers: {
          ...treatmentHeaders(clinicianToken),
          "x-request-id": requestId
        }
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({
        error: "PATIENT_ACCESS_DENIED",
        requestId,
        patientId: outsidePatientId
      });
    }

    const auditorListResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: auditHeaders(auditorToken)
    });
    const auditorPatientIds = auditorListResponse
      .json()
      .items.map((patient: { readonly id: string }) => patient.id);

    expect(auditorListResponse.statusCode).toBe(200);
    expect(auditorPatientIds).toContain(outsidePatientId);
  });
});
