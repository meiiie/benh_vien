import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  captureAuthBoundaryEnv,
  loginForToken,
  readyServer,
  restoreAuthBoundaryEnv,
  treatmentHeaders
} from "./server.auth.test-support.js";

type ClinicalResourceListBody = {
  readonly items: readonly { readonly id: string }[];
};

describe("API clinical resource boundary", () => {
  let app: FastifyInstance;
  let accessToken: string;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(async () => {
    applyDefaultAuthBoundaryEnv();
    app = await readyServer();
    accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");
  });

  afterEach(async () => {
    await app.close();
    restoreAuthBoundaryEnv(originalEnv);
  });

  async function getTreatmentJson(url: string): Promise<Record<string, unknown>> {
    const response = await app.inject({
      method: "GET",
      url,
      headers: treatmentHeaders(accessToken)
    });

    expect(response.statusCode).toBe(200);
    return response.json() as Record<string, unknown>;
  }

  async function getClinicalResourceList(
    url: string
  ): Promise<ClinicalResourceListBody> {
    return (await getTreatmentJson(url)) as ClinicalResourceListBody;
  }

  it("returns provider directory and FHIR Endpoint resources", async () => {
    const directoryResponse = await app.inject({
      method: "GET",
      url: "/api/v1/provider-directory",
      headers: treatmentHeaders(accessToken)
    });
    const directoryBody = directoryResponse.json();

    expect(directoryResponse.statusCode).toBe(200);
    expect(directoryBody.organizations).toHaveLength(5);
    expect(directoryBody.endpoints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "endpoint-pacs-hai-phong-demo",
          connectionType: "dicom-wado-rs"
        }),
        expect.objectContaining({
          id: "endpoint-fhir-hai-phong-referral",
          managingOrganizationId: "hospital-hai-phong-referral",
          connectionType: "hl7-fhir-rest"
        })
      ])
    );

    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/provider-directory/Endpoint/endpoint-pacs-hai-phong-demo/fhir",
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "Endpoint",
      id: "endpoint-pacs-hai-phong-demo",
      connectionType: {
        code: "dicom-wado-rs"
      },
      managingOrganization: {
        reference: "Organization/department-diagnostic-imaging"
      }
    });
  });

  it("lists workflow tasks and exports them as FHIR Task", async () => {
    const listBody = await getClinicalResourceList(
      "/api/v1/patients/patient-demo-001/workflow-tasks"
    );

    expect(listBody.items).toHaveLength(2);
    expect(listBody.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "workflow-task-demo-002",
          status: "completed",
          basedOnServiceRequestId: "service-request-demo-002"
        })
      ])
    );

    const fhirBody = await getTreatmentJson(
      "/api/v1/workflow-tasks/workflow-task-demo-002/fhir"
    );

    expect(fhirBody).toMatchObject({
      resourceType: "Task",
      id: "workflow-task-demo-002",
      status: "completed",
      focus: {
        reference: "ServiceRequest/service-request-demo-002"
      },
      output: expect.arrayContaining([
        expect.objectContaining({
          valueReference: {
            reference: "ImagingStudy/imaging-study-demo-001",
            display: "Metadata DICOM X-quang ngực"
          }
        })
      ])
    });
  });

  it("lists procedures and exports them as FHIR Procedure", async () => {
    const listBody = await getClinicalResourceList(
      "/api/v1/patients/patient-demo-001/procedures"
    );

    expect(listBody.items).toHaveLength(2);
    expect(listBody.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "procedure-demo-001",
          status: "completed",
          basedOnServiceRequestId: "service-request-demo-002"
        })
      ])
    );

    const fhirBody = await getTreatmentJson(
      "/api/v1/procedures/procedure-demo-001/fhir"
    );

    expect(fhirBody).toMatchObject({
      resourceType: "Procedure",
      id: "procedure-demo-001",
      status: "completed",
      basedOn: [
        {
          reference: "ServiceRequest/service-request-demo-002"
        }
      ],
      subject: {
        reference: "Patient/patient-demo-001"
      },
      report: [
        {
          reference: "DiagnosticReport/diagnostic-report-demo-002"
        }
      ]
    });
  });

  it("creates a procedure linked to a service request and diagnostic report", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/procedures",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: "encounter-demo-002",
        basedOnServiceRequestId: "service-request-demo-002",
        reasonConditionId: "condition-demo-002",
        status: "completed",
        category: "diagnostic",
        code: {
          system: "http://snomed.info/sct",
          code: "168537006",
          display: "Chest X-ray"
        },
        performedPeriod: {
          start: "2026-05-27T07:10:00.000Z",
          end: "2026-05-27T07:20:00.000Z"
        },
        performers: [
          {
            actorType: "Practitioner",
            actorId: "practitioner-demo-001",
            onBehalfOfOrganizationId: "department-diagnostic-imaging"
          }
        ],
        reportReferences: [
          {
            resourceType: "DiagnosticReport",
            id: "diagnostic-report-demo-002"
          }
        ],
        note: "Procedure thử nghiệm trong API test."
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      basedOnServiceRequestId: "service-request-demo-002",
      category: "diagnostic",
      reportReferences: [
        {
          resourceType: "DiagnosticReport",
          id: "diagnostic-report-demo-002"
        }
      ]
    });
  });

  it("lists allergy intolerances and exports them as FHIR AllergyIntolerance", async () => {
    const listBody = await getClinicalResourceList(
      "/api/v1/patients/patient-demo-001/allergy-intolerances"
    );

    expect(listBody.items).toHaveLength(2);

    const fhirBody = await getTreatmentJson(
      `/api/v1/allergy-intolerances/${listBody.items[0].id}/fhir`
    );

    expect(fhirBody).toMatchObject({
      resourceType: "AllergyIntolerance",
      patient: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates an allergy intolerance attached to the selected patient encounter", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/allergy-intolerances",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: "encounter-demo-002",
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
        recorderPractitionerId: "practitioner-demo-001",
        note: "Cảnh báo dị ứng thử nghiệm trong API test."
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      category: "medication",
      type: "allergy"
    });
  });

  it("lists conditions and exports them as FHIR Condition", async () => {
    const listBody = await getClinicalResourceList(
      "/api/v1/patients/patient-demo-001/conditions"
    );

    expect(listBody.items).toHaveLength(2);

    const fhirBody = await getTreatmentJson(
      `/api/v1/conditions/${listBody.items[0].id}/fhir`
    );

    expect(fhirBody).toMatchObject({
      resourceType: "Condition",
      subject: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates a condition attached to the selected patient encounter", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/conditions",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: "encounter-demo-002",
        category: "encounter-diagnosis",
        code: {
          system: "http://hl7.org/fhir/sid/icd-10",
          code: "R50.9",
          display: "Sốt chưa rõ nguyên nhân"
        },
        severity: "mild",
        onsetAt: "2026-05-27T00:00:00.000Z",
        recorderPractitionerId: "practitioner-demo-001",
        note: "Chẩn đoán thử nghiệm trong API test."
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      category: "encounter-diagnosis"
    });
  });

  it("lists observations and exports them as FHIR Observation", async () => {
    const listBody = await getClinicalResourceList(
      "/api/v1/patients/patient-demo-001/observations"
    );

    expect(listBody.items).toHaveLength(2);

    const fhirBody = await getTreatmentJson(
      `/api/v1/observations/${listBody.items[0].id}/fhir`
    );

    expect(fhirBody).toMatchObject({
      resourceType: "Observation",
      subject: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates an observation attached to the selected patient encounter", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/observations",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: "encounter-demo-002",
        category: "vital-signs",
        code: {
          system: "http://loinc.org",
          code: "8867-4",
          display: "Heart rate"
        },
        effectiveAt: "2026-05-27T04:00:00.000Z",
        valueQuantity: {
          value: 78,
          unit: "/min",
          system: "http://unitsofmeasure.org",
          code: "/min"
        },
        performerPractitionerId: "nurse-demo-001"
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      category: "vital-signs"
    });
  });

  it("lists medication requests and exports them as FHIR MedicationRequest", async () => {
    const listBody = await getClinicalResourceList(
      "/api/v1/patients/patient-demo-001/medication-requests"
    );

    expect(listBody.items).toHaveLength(2);

    const fhirBody = await getTreatmentJson(
      `/api/v1/medication-requests/${listBody.items[0].id}/fhir`
    );

    expect(fhirBody).toMatchObject({
      resourceType: "MedicationRequest",
      status: "active",
      intent: "order",
      subject: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("lists medication dispenses and exports them as FHIR MedicationDispense", async () => {
    const listBody = await getClinicalResourceList(
      "/api/v1/patients/patient-demo-001/medication-dispenses"
    );

    expect(listBody.items).toHaveLength(2);
    expect(listBody.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "medication-dispense-demo-002",
          status: "completed",
          medicationRequestId: "medication-request-demo-002"
        })
      ])
    );

    const fhirBody = await getTreatmentJson(
      "/api/v1/medication-dispenses/medication-dispense-demo-002/fhir"
    );

    expect(fhirBody).toMatchObject({
      resourceType: "MedicationDispense",
      id: "medication-dispense-demo-002",
      status: "completed",
      authorizingPrescription: [
        {
          reference: "MedicationRequest/medication-request-demo-002"
        }
      ],
      subject: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates a medication dispense linked to the original medication request", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/medication-dispenses",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: "encounter-demo-002",
        medicationRequestId: "medication-request-demo-002",
        status: "completed",
        category: "outpatient",
        medicationCode: {
          system: "http://www.whocc.no/atc",
          code: "C09AA05",
          display: "Ramipril"
        },
        quantity: {
          value: 30,
          unit: "viên",
          system: "http://unitsofmeasure.org",
          code: "{tablet}"
        },
        daysSupply: {
          value: 30,
          unit: "ngày",
          system: "http://unitsofmeasure.org",
          code: "d"
        },
        whenPrepared: "2026-05-27T05:30:00.000Z",
        whenHandedOver: "2026-05-27T05:45:00.000Z",
        dispenserPractitionerId: "nurse-demo-001",
        receiverPractitionerId: "nurse-demo-001",
        dosageInstruction: {
          text: "Uống 5 mg mỗi ngày vào buổi sáng",
          route: "Đường uống",
          doseQuantity: {
            value: 5,
            unit: "mg",
            system: "http://unitsofmeasure.org",
            code: "mg"
          },
          frequency: 1,
          period: 1,
          periodUnit: "d"
        }
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      medicationRequestId: "medication-request-demo-002",
      category: "outpatient",
      status: "completed"
    });
  });

  it("lists medication administrations and exports them as FHIR MedicationAdministration", async () => {
    const listBody = await getClinicalResourceList(
      "/api/v1/patients/patient-demo-001/medication-administrations"
    );

    expect(listBody.items).toHaveLength(2);
    expect(listBody.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "medication-administration-demo-002",
          status: "completed",
          medicationRequestId: "medication-request-demo-002"
        })
      ])
    );

    const fhirBody = await getTreatmentJson(
      "/api/v1/medication-administrations/medication-administration-demo-002/fhir"
    );

    expect(fhirBody).toMatchObject({
      resourceType: "MedicationAdministration",
      id: "medication-administration-demo-002",
      status: "completed",
      request: {
        reference: "MedicationRequest/medication-request-demo-002"
      },
      subject: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates a medication administration linked to the original medication request", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/medication-administrations",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: "encounter-demo-002",
        medicationRequestId: "medication-request-demo-002",
        reasonConditionId: "condition-demo-002",
        status: "completed",
        category: "outpatient",
        medicationCode: {
          system: "http://www.whocc.no/atc",
          code: "C09AA05",
          display: "Ramipril"
        },
        effectivePeriod: {
          start: "2026-05-27T06:05:00.000Z"
        },
        performers: [
          {
            actorType: "Practitioner",
            actorId: "nurse-demo-001"
          }
        ],
        dosage: {
          text: "Uống 5 mg vào buổi sáng",
          route: {
            system: "http://snomed.info/sct",
            code: "26643006",
            display: "Oral route"
          },
          doseQuantity: {
            value: 5,
            unit: "mg",
            system: "http://unitsofmeasure.org",
            code: "mg"
          }
        }
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      medicationRequestId: "medication-request-demo-002",
      reasonConditionId: "condition-demo-002",
      category: "outpatient"
    });
  });

  it("creates a medication request linked to a patient condition", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/medication-requests",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: "encounter-demo-002",
        reasonConditionId: "condition-demo-002",
        category: "outpatient",
        medicationCode: {
          system: "http://www.whocc.no/atc",
          code: "C08CA01",
          display: "Amlodipine"
        },
        dosageInstruction: {
          text: "Uống 5 mg mỗi ngày vào buổi tối",
          route: "Đường uống",
          doseQuantity: {
            value: 5,
            unit: "mg",
            system: "http://unitsofmeasure.org",
            code: "mg"
          },
          frequency: 1,
          period: 1,
          periodUnit: "d"
        },
        requesterPractitionerId: "practitioner-demo-001",
        expectedSupplyDurationDays: 30
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      reasonConditionId: "condition-demo-002",
      category: "outpatient"
    });
  });

  it("lists service requests and exports them as FHIR ServiceRequest", async () => {
    const listBody = await getClinicalResourceList(
      "/api/v1/patients/patient-demo-001/service-requests"
    );

    expect(listBody.items).toHaveLength(2);

    const fhirBody = await getTreatmentJson(
      `/api/v1/service-requests/${listBody.items[0].id}/fhir`
    );

    expect(fhirBody).toMatchObject({
      resourceType: "ServiceRequest",
      status: "active",
      intent: "order",
      subject: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates a service request linked to a patient condition", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/service-requests",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: "encounter-demo-002",
        reasonConditionId: "condition-demo-002",
        category: "laboratory",
        priority: "urgent",
        code: {
          system: "http://loinc.org",
          code: "24323-8",
          display: "Comprehensive metabolic panel"
        },
        authoredOn: "2026-05-27T04:30:00.000Z",
        occurrenceAt: "2026-05-27T05:00:00.000Z",
        requesterPractitionerId: "practitioner-demo-001",
        performerOrganizationId: "department-laboratory",
        patientInstruction: "Nhịn ăn nếu khoa xét nghiệm yêu cầu."
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      reasonConditionId: "condition-demo-002",
      category: "laboratory"
    });
  });

  it("lists diagnostic reports and exports them as FHIR DiagnosticReport", async () => {
    const listBody = await getClinicalResourceList(
      "/api/v1/patients/patient-demo-001/diagnostic-reports"
    );

    expect(listBody.items).toHaveLength(2);

    const fhirBody = await getTreatmentJson(
      `/api/v1/diagnostic-reports/${listBody.items[0].id}/fhir`
    );

    expect(fhirBody).toMatchObject({
      resourceType: "DiagnosticReport",
      subject: {
        reference: "Patient/patient-demo-001"
      },
      basedOn: [
        {
          reference: expect.stringMatching(/^ServiceRequest\//)
        }
      ]
    });
  });

  it("creates a diagnostic report linked to a service request and observation result", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/diagnostic-reports",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: "encounter-demo-001",
        basedOnServiceRequestId: "service-request-demo-001",
        category: "laboratory",
        code: {
          system: "http://loinc.org",
          code: "58410-2",
          display: "Complete blood count panel"
        },
        effectiveAt: "2026-05-27T06:00:00.000Z",
        issuedAt: "2026-05-27T06:30:00.000Z",
        performerOrganizationId: "department-laboratory",
        resultsInterpreterPractitionerId: "practitioner-demo-002",
        resultObservationIds: ["observation-demo-001"],
        conclusion: "Báo cáo xét nghiệm thử nghiệm trong API test."
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-001",
      basedOnServiceRequestId: "service-request-demo-001",
      category: "laboratory",
      resultObservationIds: ["observation-demo-001"]
    });
  });

  it("lists imaging studies and exports them as FHIR ImagingStudy", async () => {
    const listBody = await getClinicalResourceList(
      "/api/v1/patients/patient-demo-001/imaging-studies"
    );

    expect(listBody.items).toHaveLength(1);

    const fhirBody = await getTreatmentJson(
      `/api/v1/imaging-studies/${listBody.items[0].id}/fhir`
    );

    expect(fhirBody).toMatchObject({
      resourceType: "ImagingStudy",
      subject: {
        reference: "Patient/patient-demo-001"
      },
      basedOn: [
        {
          reference: "ServiceRequest/service-request-demo-002"
        }
      ],
      identifier: expect.arrayContaining([
        expect.objectContaining({
          system: "urn:dicom:uid",
          value: "urn:oid:1.2.826.0.1.3680043.10.543.202605270001"
        })
      ])
    });
  });

  it("creates an imaging study linked to a service request and diagnostic report", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/imaging-studies",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: "encounter-demo-002",
        basedOnServiceRequestId: "service-request-demo-002",
        diagnosticReportId: "diagnostic-report-demo-002",
        studyInstanceUid: "1.2.826.0.1.3680043.10.543.202605270099",
        accessionNumber: "HP-CXR-TEST-001",
        description: "Chest X-ray test study",
        startedAt: "2026-05-27T07:00:00.000Z",
        referrerPractitionerId: "practitioner-demo-001",
        interpreterPractitionerId: "practitioner-demo-001",
        endpointId: "endpoint-pacs-hai-phong-demo",
        series: [
          {
            uid: "1.2.826.0.1.3680043.10.543.202605270099.1",
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
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      basedOnServiceRequestId: "service-request-demo-002",
      diagnosticReportId: "diagnostic-report-demo-002",
      numberOfSeries: 1,
      numberOfInstances: 2
    });
  });
});
