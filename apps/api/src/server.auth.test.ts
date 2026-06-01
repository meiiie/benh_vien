import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildServer } from "./server.js";
import {
  applyDefaultAuthBoundaryEnv,
  auditHeaders,
  bundleTransferHeaders,
  captureAuthBoundaryEnv,
  expectOperationOutcome,
  FailingRecordTransferDeliveryAttemptRepository,
  loginForToken,
  operationsHeaders,
  readyServer,
  recordTransferCallbackKeyIdHeader,
  recordTransferCallbackSignatureHeader,
  recordTransferCallbackTestKeyId,
  recordTransferCallbackTestSecret,
  recordTransferCallbackTimestampHeader,
  restoreAuthBoundaryEnv,
  signedRecordTransferCallbackHeaders,
  treatmentHeaders
} from "./server.auth.test-support.js";

describe("API auth and RBAC boundary", () => {
  let app: FastifyInstance | undefined;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(() => {
    applyDefaultAuthBoundaryEnv();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }

    restoreAuthBoundaryEnv(originalEnv);
  });

  it("requires callback signature secrets at startup in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.BVS_REPOSITORY = "postgres";
    process.env.BVS_PUBLIC_API_BASE_URL = "https://api.wiiicare.example.vn/api/v1";
    process.env.BVS_CORS_ORIGINS = "https://wiiicare.example.vn";
    delete process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRET;
    delete process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON;

    await expect(buildServer({ logger: false })).rejects.toThrow(
      "BVS_RECORD_TRANSFER_CALLBACK_SECRET hoặc BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON phải được cấu hình tối thiểu 32 ký tự trong production."
    );
  });

  it("serves FHIR CapabilityStatement metadata without a demo session", async () => {
    process.env.BVS_PUBLIC_API_BASE_URL = "https://api.wiiicare.example.vn/api/v1/";
    app = await readyServer();

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/fhir/metadata"
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      resourceType: "CapabilityStatement",
      fhirVersion: "4.0.1",
      implementation: {
        url: "https://api.wiiicare.example.vn/api/v1"
      },
      rest: [
        {
          mode: "server",
          resource: expect.arrayContaining([
            expect.objectContaining({
              type: "Patient"
            }),
            expect.objectContaining({
              type: "Provenance"
            }),
            expect.objectContaining({
              type: "Bundle"
            }),
            expect.objectContaining({
              type: "AuditEvent"
            })
          ])
        }
      ]
    });
  });

  it("returns provider directory and FHIR Endpoint resources", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

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
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/workflow-tasks",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
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

    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/workflow-tasks/workflow-task-demo-002/fhir",
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
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
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/procedures",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
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

    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/procedures/procedure-demo-001/fhir",
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
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
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

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
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/allergy-intolerances",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
    expect(listBody.items).toHaveLength(2);

    const fhirResponse = await app.inject({
      method: "GET",
      url: `/api/v1/allergy-intolerances/${listBody.items[0].id}/fhir`,
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "AllergyIntolerance",
      patient: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates an allergy intolerance attached to the selected patient encounter", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

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
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/conditions",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
    expect(listBody.items).toHaveLength(2);

    const fhirResponse = await app.inject({
      method: "GET",
      url: `/api/v1/conditions/${listBody.items[0].id}/fhir`,
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "Condition",
      subject: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates a condition attached to the selected patient encounter", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

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
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/observations",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
    expect(listBody.items).toHaveLength(2);

    const fhirResponse = await app.inject({
      method: "GET",
      url: `/api/v1/observations/${listBody.items[0].id}/fhir`,
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "Observation",
      subject: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates an observation attached to the selected patient encounter", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

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
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/medication-requests",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
    expect(listBody.items).toHaveLength(2);

    const fhirResponse = await app.inject({
      method: "GET",
      url: `/api/v1/medication-requests/${listBody.items[0].id}/fhir`,
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "MedicationRequest",
      status: "active",
      intent: "order",
      subject: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("lists medication dispenses and exports them as FHIR MedicationDispense", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/medication-dispenses",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
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

    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/medication-dispenses/medication-dispense-demo-002/fhir",
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
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
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

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
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/medication-administrations",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
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

    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/medication-administrations/medication-administration-demo-002/fhir",
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
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
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

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
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

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
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/service-requests",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
    expect(listBody.items).toHaveLength(2);

    const fhirResponse = await app.inject({
      method: "GET",
      url: `/api/v1/service-requests/${listBody.items[0].id}/fhir`,
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "ServiceRequest",
      status: "active",
      intent: "order",
      subject: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates a service request linked to a patient condition", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

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
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/diagnostic-reports",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
    expect(listBody.items).toHaveLength(2);

    const fhirResponse = await app.inject({
      method: "GET",
      url: `/api/v1/diagnostic-reports/${listBody.items[0].id}/fhir`,
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
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
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

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
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/imaging-studies",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
    expect(listBody.items).toHaveLength(1);

    const fhirResponse = await app.inject({
      method: "GET",
      url: `/api/v1/imaging-studies/${listBody.items[0].id}/fhir`,
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
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
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

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

  it("lists active patient consents for treatment users", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/consents",
      headers: treatmentHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      id: "consent-demo-transfer-001",
      patientId: "patient-demo-001",
      status: "active",
      category: "record-sharing",
      granteeOrganizationId: "hospital-hai-phong-referral"
    });
  });

  it("creates a patient consent and uses it for Bundle export", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/consents",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        category: "record-sharing",
        granteeOrganizationId: "hospital-new-recipient",
        validFrom: "2026-05-27T00:00:00.000Z",
        validUntil: "2026-12-31T23:59:59.000Z"
      }
    });
    const createdConsent = createResponse.json();

    expect(createResponse.statusCode).toBe(201);
    expect(createdConsent.id).toEqual(expect.stringMatching(/^consent-/));

    const bundleResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir-bundle",
      headers: {
        ...treatmentHeaders(accessToken),
        "x-consent-reference": createdConsent.id,
        "x-recipient-organization-id": "hospital-new-recipient"
      }
    });

    expect(bundleResponse.statusCode).toBe(200);
    expect(bundleResponse.json()).toMatchObject({
      resourceType: "Bundle",
      type: "collection"
    });
  });

  it("exports patient consent as FHIR Consent", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/consents/consent-demo-transfer-001/fhir",
      headers: treatmentHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      resourceType: "Consent",
      id: "consent-demo-transfer-001",
      status: "active",
      patient: {
        reference: "Patient/patient-demo-001"
      },
      provision: {
        type: "permit",
        actor: [
          {
            reference: {
              reference: "Organization/hospital-hai-phong-referral"
            }
          }
        ]
      }
    });
  });

  it("revokes a patient consent and blocks later record sharing", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/consents",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        category: "record-sharing",
        granteeOrganizationId: "hospital-revoked-recipient",
        validFrom: "2026-05-27T00:00:00.000Z",
        validUntil: "2026-12-31T23:59:59.000Z"
      }
    });
    const createdConsent = createResponse.json();

    expect(createResponse.statusCode).toBe(201);

    const revokeResponse = await app.inject({
      method: "POST",
      url: `/api/v1/patients/patient-demo-001/consents/${createdConsent.id}/revoke`,
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        reason: "Người bệnh rút lại đồng ý chia sẻ hồ sơ."
      }
    });
    const revokedConsent = revokeResponse.json();

    expect(revokeResponse.statusCode).toBe(200);
    expect(revokedConsent).toMatchObject({
      id: createdConsent.id,
      status: "revoked",
      revokedByActorId: "practitioner-demo-001",
      revocationReason: "Người bệnh rút lại đồng ý chia sẻ hồ sơ."
    });
    expect(revokedConsent.revokedAt).toEqual(expect.any(String));

    const fhirConsentResponse = await app.inject({
      method: "GET",
      url: `/api/v1/consents/${createdConsent.id}/fhir`,
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirConsentResponse.statusCode).toBe(200);
    expect(fhirConsentResponse.json()).toMatchObject({
      resourceType: "Consent",
      id: createdConsent.id,
      status: "inactive",
      extension: expect.arrayContaining([
        expect.objectContaining({
          url: "urn:wiiicare:nexus:fhir:StructureDefinition/consent-revocation"
        })
      ])
    });

    const bundleResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir-bundle",
      headers: {
        ...treatmentHeaders(accessToken),
        "x-consent-reference": createdConsent.id,
        "x-recipient-organization-id": "hospital-revoked-recipient"
      }
    });

    expectOperationOutcome(bundleResponse, {
      statusCode: 403,
      code: "suppressed",
      detailsCode: "CONSENT_NOT_VALID_FOR_TRANSFER"
    });
  });

  it("denies consent revocation for nurse role", async () => {
    app = await readyServer();
    const clinicianToken = await loginForToken(app, "practitioner-demo-001", "clinician");
    const nurseToken = await loginForToken(app, "nurse-demo-001", "nurse");

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/consents",
      headers: {
        ...treatmentHeaders(clinicianToken),
        "content-type": "application/json"
      },
      payload: {
        category: "record-sharing",
        granteeOrganizationId: "hospital-nurse-denied-recipient",
        validFrom: "2026-05-27T00:00:00.000Z",
        validUntil: "2026-12-31T23:59:59.000Z"
      }
    });
    const createdConsent = createResponse.json();

    expect(createResponse.statusCode).toBe(201);

    const revokeResponse = await app.inject({
      method: "POST",
      url: `/api/v1/patients/patient-demo-001/consents/${createdConsent.id}/revoke`,
      headers: {
        ...treatmentHeaders(nurseToken),
        "content-type": "application/json"
      },
      payload: {
        reason: "Điều dưỡng không có quyền thu hồi consent."
      }
    });

    expect(revokeResponse.statusCode).toBe(403);
    expect(revokeResponse.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "consent:revoke"
    });
  });

  it("lists record transfer packages for a patient", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/record-transfers",
      headers: treatmentHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      id: "record-transfer-demo-001",
      patientId: "patient-demo-001",
      status: "ready",
      bundleType: "document",
      bundleId: "patient-document-patient-demo-001",
      recipientOrganizationId: "hospital-hai-phong-referral",
      consentReference: "consent-demo-transfer-001"
    });
  });

  it("creates a record transfer package and exports it as FHIR Task", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/record-transfers",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        priority: "urgent",
        bundleType: "document",
        sourceOrganizationId: "hospital-hai-phong-demo",
        recipientOrganizationId: "hospital-hai-phong-referral",
        consentReference: "consent-demo-transfer-001",
        reason: "Chuyển tuyến theo dõi chuyên khoa tim mạch.",
        requestedAt: "2026-05-28T03:00:00.000Z"
      }
    });
    const createdTransfer = createResponse.json();

    expect(createResponse.statusCode).toBe(201);
    expect(createdTransfer.id).toEqual(expect.stringMatching(/^record-transfer-/));
    expect(createdTransfer).toMatchObject({
      bundleId: "patient-document-patient-demo-001",
      requestedByActorId: "practitioner-demo-001"
    });

    const fhirResponse = await app.inject({
      method: "GET",
      url: `/api/v1/record-transfers/${createdTransfer.id}/fhir-task`,
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "Task",
      status: "requested",
      focus: {
        reference: "Bundle/patient-document-patient-demo-001"
      },
      for: {
        reference: "Patient/patient-demo-001"
      },
      owner: {
        reference: "Organization/hospital-hai-phong-referral"
      }
    });
  });

  it("rejects creating a record transfer directly in the dead-lettered state", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/record-transfers",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        status: "dead-lettered",
        priority: "urgent",
        bundleType: "document",
        sourceOrganizationId: "hospital-hai-phong-demo",
        recipientOrganizationId: "hospital-hai-phong-referral",
        consentReference: "consent-demo-transfer-001",
        reason: "Không cho client tạo trực tiếp trạng thái lỗi cuối.",
        requestedAt: "2026-05-28T03:00:00.000Z",
        sentAt: "2026-05-28T03:05:00.000Z",
        failedAt: "2026-05-28T03:10:00.000Z"
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "VALIDATION_ERROR"
    });
  });

  it("keeps JSON and FHIR not-found errors separate for record transfers", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const jsonResponse = await app.inject({
      method: "GET",
      url: "/api/v1/record-transfers/record-transfer-missing",
      headers: {
        ...treatmentHeaders(accessToken),
        "x-request-id": "record-transfer-json-not-found-001"
      }
    });

    expect(jsonResponse.statusCode).toBe(404);
    expect(String(jsonResponse.headers["content-type"])).toContain("application/json");
    expect(jsonResponse.json()).toMatchObject({
      error: "RECORD_TRANSFER_NOT_FOUND",
      message: "Không tìm thấy yêu cầu chuyển hồ sơ.",
      requestId: "record-transfer-json-not-found-001"
    });

    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/record-transfers/record-transfer-missing/fhir-task",
      headers: treatmentHeaders(accessToken)
    });

    expectOperationOutcome(fhirResponse, {
      statusCode: 404,
      code: "not-found",
      detailsCode: "RECORD_TRANSFER_NOT_FOUND"
    });
  });

  it("moves a record transfer through sent and received milestones", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const sendResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/send",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        sentAt: "2026-05-28T04:00:00.000Z",
        note: "Xếp gói hồ sơ vào hàng chờ gửi qua gateway liên thông."
      }
    });

    expect(sendResponse.statusCode).toBe(200);
    expect(sendResponse.json()).toMatchObject({
      id: "record-transfer-demo-001",
      status: "in-progress",
      sentAt: "2026-05-28T04:00:00.000Z"
    });

    const attemptsResponse = await app.inject({
      method: "GET",
      url: "/api/v1/record-transfers/record-transfer-demo-001/delivery-attempts",
      headers: treatmentHeaders(accessToken)
    });

    expect(attemptsResponse.statusCode).toBe(200);
    expect(attemptsResponse.json()).toMatchObject({
      items: [
        {
          recordTransferId: "record-transfer-demo-001",
          patientId: "patient-demo-001",
          targetEndpointId: "endpoint-fhir-hai-phong-referral",
          targetEndpointAddress: "https://fhir.referral.demo.wiiicare.vn/fhir",
          bundleId: "patient-document-patient-demo-001",
          bundleType: "document",
          attemptNumber: 1,
          status: "queued",
          queuedAt: "2026-05-28T04:00:00.000Z",
          idempotencyKey: expect.stringMatching(/^wiiicare-record-transfer-[a-f0-9]{64}$/)
        }
      ]
    });

    const receiveResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/receive",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        receivedAt: "2026-05-28T04:15:00.000Z",
        note: "Bệnh viện nhận đã xác nhận tiếp nhận."
      }
    });

    expect(receiveResponse.statusCode).toBe(200);
    expect(receiveResponse.json()).toMatchObject({
      id: "record-transfer-demo-001",
      status: "completed",
      sentAt: "2026-05-28T04:00:00.000Z",
      receivedAt: "2026-05-28T04:15:00.000Z",
      receivedByActorId: "practitioner-demo-001",
      acknowledgementReference: expect.stringMatching(
        /^wiiicare-record-transfer-ack-[a-f0-9]{32}$/
      )
    });

    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/record-transfers/record-transfer-demo-001/fhir-task",
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "Task",
      status: "completed",
      executionPeriod: {
        start: "2026-05-28T04:00:00.000Z",
        end: "2026-05-28T04:15:00.000Z"
      },
      note: expect.arrayContaining([
        {
          text: "Người xác nhận nhận hồ sơ: practitioner-demo-001"
        }
      ])
    });
  });

  it("rolls back a record transfer when queuing the delivery attempt fails", async () => {
    app = await readyServer({
      recordTransferDeliveryAttemptRepository:
        new FailingRecordTransferDeliveryAttemptRepository()
    });
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const sendResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/send",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        sentAt: "2026-05-28T04:00:00.000Z",
        note: "Giả lập lỗi kho lịch sử gửi để kiểm tra rollback."
      }
    });

    expect(sendResponse.statusCode).toBe(500);

    const transferListResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/record-transfers",
      headers: treatmentHeaders(accessToken)
    });
    const transferListBody = transferListResponse.json();

    expect(transferListResponse.statusCode).toBe(200);
    expect(transferListBody.items[0]).toMatchObject({
      id: "record-transfer-demo-001",
      status: "ready"
    });
    expect(transferListBody.items[0]).not.toHaveProperty("sentAt");
  });

  it("accepts an operations acknowledgement callback for a sent record transfer", async () => {
    app = await readyServer();
    const clinicianToken = await loginForToken(app, "practitioner-demo-001", "clinician");
    const gatewayToken = await loginForToken(
      app,
      "gateway-hai-phong-referral",
      "integration"
    );

    const gatewayPatientListResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: operationsHeaders(gatewayToken)
    });

    expect(gatewayPatientListResponse.statusCode).toBe(403);
    expect(gatewayPatientListResponse.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "patient:list"
    });

    const sendResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/send",
      headers: {
        ...treatmentHeaders(clinicianToken),
        "content-type": "application/json"
      },
      payload: {
        sentAt: "2026-05-28T04:30:00.000Z",
        note: "Xếp gói hồ sơ vào hàng chờ gửi qua gateway liên thông."
      }
    });

    expect(sendResponse.statusCode).toBe(200);

    const deniedCallbackResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/acknowledgement-callback",
      headers: {
        ...operationsHeaders(clinicianToken),
        "content-type": "application/json"
      },
      payload: {
        recipientOrganizationId: "hospital-hai-phong-referral",
        acknowledgementReference: "ack-denied-from-source-organization",
        receivedAt: "2026-05-28T04:45:00.000Z"
      }
    });

    expect(deniedCallbackResponse.statusCode).toBe(403);
    expect(deniedCallbackResponse.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "record-transfer:acknowledge"
    });

    const callbackPayload = {
      recipientOrganizationId: "hospital-hai-phong-referral",
      acknowledgementReference: "ack-record-transfer-callback-001",
      receivedAt: "2026-05-28T04:45:00.000Z",
      receivedByActorId: "system-hai-phong-referral-gateway",
      targetEndpointId: "endpoint-fhir-hai-phong-referral",
      deliveryIdempotencyKey: "wiiicare-record-transfer-callback-test-001",
      note: "Bệnh viện nhận xác nhận tiếp nhận qua callback liên thông."
    };

    const callbackResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/acknowledgement-callback",
      headers: {
        ...operationsHeaders(gatewayToken),
        "content-type": "application/json"
      },
      payload: callbackPayload
    });

    expect(callbackResponse.statusCode).toBe(200);
    expect(callbackResponse.json()).toMatchObject({
      id: "record-transfer-demo-001",
      status: "completed",
      sentAt: "2026-05-28T04:30:00.000Z",
      receivedAt: "2026-05-28T04:45:00.000Z",
      receivedByActorId: "system-hai-phong-referral-gateway",
      acknowledgementReference: "ack-record-transfer-callback-001"
    });

    const duplicateCallbackResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/acknowledgement-callback",
      headers: {
        ...operationsHeaders(gatewayToken),
        "content-type": "application/json"
      },
      payload: callbackPayload
    });

    expect(duplicateCallbackResponse.statusCode).toBe(200);
    expect(duplicateCallbackResponse.json()).toMatchObject({
      status: "completed",
      acknowledgementReference: "ack-record-transfer-callback-001"
    });

    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/record-transfers/record-transfer-demo-001/fhir-task",
      headers: treatmentHeaders(clinicianToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "Task",
      status: "completed",
      note: expect.arrayContaining([
        {
          text: "Biên nhận tiếp nhận: ack-record-transfer-callback-001"
        }
      ])
    });
  });

  it("requires a valid HMAC signature for acknowledgement callbacks when configured", async () => {
    process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON = JSON.stringify({
      [recordTransferCallbackTestKeyId]: recordTransferCallbackTestSecret
    });
    app = await readyServer();
    const clinicianToken = await loginForToken(app, "practitioner-demo-001", "clinician");
    const gatewayToken = await loginForToken(
      app,
      "gateway-hai-phong-referral",
      "integration"
    );

    const sendResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/send",
      headers: {
        ...treatmentHeaders(clinicianToken),
        "content-type": "application/json"
      },
      payload: {
        sentAt: "2026-05-28T06:00:00.000Z",
        note: "Xếp gói hồ sơ vào hàng chờ gửi qua gateway liên thông."
      }
    });

    expect(sendResponse.statusCode).toBe(200);

    const callbackPayload = {
      recipientOrganizationId: "hospital-hai-phong-referral",
      acknowledgementReference: "ack-record-transfer-callback-signed-001",
      receivedAt: new Date().toISOString(),
      receivedByActorId: "system-hai-phong-referral-gateway",
      targetEndpointId: "endpoint-fhir-hai-phong-referral",
      deliveryIdempotencyKey: "wiiicare-record-transfer-callback-signed-test-001",
      note: "Bệnh viện nhận xác nhận tiếp nhận qua callback đã ký."
    };

    const unsignedCallbackResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/acknowledgement-callback",
      headers: {
        ...operationsHeaders(gatewayToken),
        "content-type": "application/json",
        [recordTransferCallbackKeyIdHeader]: recordTransferCallbackTestKeyId
      },
      payload: callbackPayload
    });

    expect(unsignedCallbackResponse.statusCode).toBe(403);
    expect(unsignedCallbackResponse.json()).toMatchObject({
      error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_REQUIRED",
      permission: "record-transfer:acknowledge"
    });

    const invalidTimestamp = new Date().toISOString();
    const invalidSignatureResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/acknowledgement-callback",
      headers: {
        ...operationsHeaders(gatewayToken),
        "content-type": "application/json",
        [recordTransferCallbackKeyIdHeader]: recordTransferCallbackTestKeyId,
        [recordTransferCallbackTimestampHeader]: invalidTimestamp,
        [recordTransferCallbackSignatureHeader]: "invalid-signature"
      },
      payload: callbackPayload
    });

    expect(invalidSignatureResponse.statusCode).toBe(403);
    expect(invalidSignatureResponse.json()).toMatchObject({
      error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_INVALID",
      permission: "record-transfer:acknowledge"
    });

    const signedCallbackResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/acknowledgement-callback",
      headers: {
        ...operationsHeaders(gatewayToken),
        "content-type": "application/json",
        ...signedRecordTransferCallbackHeaders({
          recordTransferId: "record-transfer-demo-001",
          body: callbackPayload
        })
      },
      payload: callbackPayload
    });

    expect(signedCallbackResponse.statusCode).toBe(200);
    expect(signedCallbackResponse.json()).toMatchObject({
      status: "completed",
      receivedByActorId: "system-hai-phong-referral-gateway",
      acknowledgementReference: "ack-record-transfer-callback-signed-001"
    });
  });

  it("records failed record transfer delivery and prepares a retry", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const sendResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/send",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        sentAt: "2026-05-28T05:00:00.000Z",
        note: "Xếp gói hồ sơ vào hàng chờ gửi qua gateway liên thông."
      }
    });

    expect(sendResponse.statusCode).toBe(200);

    const failResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/fail",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        failedAt: "2026-05-28T05:05:00.000Z",
        failureReason: "Recipient gateway unavailable.",
        nextRetryAt: "2026-05-28T05:20:00.000Z"
      }
    });

    expect(failResponse.statusCode, failResponse.body).toBe(200);
    expect(failResponse.json()).toMatchObject({
      id: "record-transfer-demo-001",
      status: "failed",
      failedAt: "2026-05-28T05:05:00.000Z",
      failureReason: "Recipient gateway unavailable.",
      nextRetryAt: "2026-05-28T05:20:00.000Z",
      retryCount: 0
    });

    const failedFhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/record-transfers/record-transfer-demo-001/fhir-task",
      headers: treatmentHeaders(accessToken)
    });

    expect(failedFhirResponse.statusCode).toBe(200);
    expect(failedFhirResponse.json()).toMatchObject({
      resourceType: "Task",
      status: "failed",
      note: expect.arrayContaining([
        expect.objectContaining({
          text: "Lý do lỗi chuyển hồ sơ: Recipient gateway unavailable."
        }),
        expect.objectContaining({
          text: "Hẹn thử gửi lại: 2026-05-28T05:20:00.000Z"
        })
      ])
    });

    const retryResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/retry",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        retryAt: "2026-05-28T05:20:00.000Z",
        note: "Đưa lại vào hàng đợi gửi khi gateway sẵn sàng."
      }
    });

    expect(retryResponse.statusCode).toBe(200);
    expect(retryResponse.json()).toMatchObject({
      id: "record-transfer-demo-001",
      status: "ready",
      retryCount: 1,
      note: "Đưa lại vào hàng đợi gửi khi gateway sẵn sàng."
    });
    expect(retryResponse.json()).not.toHaveProperty("sentAt");
    expect(retryResponse.json()).not.toHaveProperty("failedAt");
    expect(retryResponse.json()).not.toHaveProperty("failureReason");
    expect(retryResponse.json()).not.toHaveProperty("nextRetryAt");

    const resendResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/send",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        sentAt: "2026-05-28T05:25:00.000Z"
      }
    });

    expect(resendResponse.statusCode).toBe(200);
    expect(resendResponse.json()).toMatchObject({
      status: "in-progress",
      sentAt: "2026-05-28T05:25:00.000Z",
      retryCount: 1
    });

    const attemptsResponse = await app.inject({
      method: "GET",
      url: "/api/v1/record-transfers/record-transfer-demo-001/delivery-attempts",
      headers: treatmentHeaders(accessToken)
    });

    expect(attemptsResponse.statusCode).toBe(200);
    expect(attemptsResponse.json()).toMatchObject({
      items: [
        {
          attemptNumber: 1,
          queuedAt: "2026-05-28T05:00:00.000Z",
          status: "queued"
        },
        {
          attemptNumber: 2,
          queuedAt: "2026-05-28T05:25:00.000Z",
          status: "queued"
        }
      ]
    });
  });

  it("denies record transfer creation when consent does not cover the recipient", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/record-transfers",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        bundleType: "document",
        sourceOrganizationId: "hospital-hai-phong-demo",
        recipientOrganizationId: "hospital-not-covered",
        consentReference: "consent-demo-transfer-001",
        reason: "Thử gửi sai đơn vị nhận."
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "CONSENT_DOES_NOT_ALLOW_RECORD_TRANSFER"
    });
  });

  it("requires a recipient FHIR Bundle endpoint before creating a record transfer", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const consentResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/consents",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        category: "record-sharing",
        granteeOrganizationId: "department-laboratory",
        validFrom: "2026-05-28T00:00:00.000Z",
        validUntil: "2026-12-31T23:59:59.000Z"
      }
    });
    expect(consentResponse.statusCode).toBe(201);

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/record-transfers",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        bundleType: "document",
        sourceOrganizationId: "hospital-hai-phong-demo",
        recipientOrganizationId: "department-laboratory",
        consentReference: consentResponse.json().id,
        reason: "Thử chuyển hồ sơ tới đơn vị chưa có FHIR Bundle endpoint."
      }
    });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({
      error: "RECORD_TRANSFER_ENDPOINT_NOT_FOUND",
      requestId: expect.any(String)
    });
  });

  it("requires transfer context before exporting a patient-record FHIR Bundle", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir-bundle",
      headers: treatmentHeaders(accessToken)
    });

    expectOperationOutcome(response, {
      statusCode: 400,
      code: "required",
      detailsCode: "MISSING_BUNDLE_TRANSFER_CONTEXT"
    });
  });

  it("denies Bundle export when consent does not match the recipient", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir-bundle",
      headers: {
        ...treatmentHeaders(accessToken),
        "x-consent-reference": "consent-demo-transfer-001",
        "x-recipient-organization-id": "hospital-not-covered"
      }
    });

    expectOperationOutcome(response, {
      statusCode: 403,
      code: "suppressed",
      detailsCode: "CONSENT_NOT_VALID_FOR_TRANSFER"
    });
  });
});
