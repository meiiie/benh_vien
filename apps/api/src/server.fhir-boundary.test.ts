import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  auditHeaders,
  bundleTransferHeaders,
  captureAuthBoundaryEnv,
  expectOperationOutcome,
  loginForToken,
  readyServer,
  restoreAuthBoundaryEnv,
  treatmentHeaders
} from "./server.auth.test-support.js";

describe("API FHIR interoperability boundary", () => {
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

  it("denies nurse FHIR export even with treatment purpose", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "nurse-demo-001", "nurse");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir",
      headers: treatmentHeaders(accessToken)
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "patient:fhir-export"
    });
  });

  it("returns a patient-record FHIR Bundle for treatment export", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir-bundle",
      headers: bundleTransferHeaders(accessToken)
    });
    const body = response.json();
    const resourceTypes = body.entry.map(
      (entry: { readonly resource: { readonly resourceType: string } }) =>
        entry.resource.resourceType
    );

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      resourceType: "Bundle",
      id: "patient-record-patient-demo-001",
      type: "collection"
    });
    expect(resourceTypes).toEqual(
      expect.arrayContaining([
        "Patient",
        "Organization",
        "Practitioner",
        "PractitionerRole",
        "Endpoint",
        "Consent",
        "Encounter",
        "AllergyIntolerance",
        "Condition",
        "ServiceRequest",
        "Task",
        "Procedure",
        "Observation",
        "DiagnosticReport",
        "ImagingStudy",
        "MedicationRequest",
        "MedicationDispense",
        "MedicationAdministration",
        "DocumentReference"
      ])
    );
    expect(body.entry).toHaveLength(47);
  });

  it("returns a patient-record FHIR document Bundle with Composition first", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir-document-bundle",
      headers: bundleTransferHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      resourceType: "Bundle",
      id: "patient-document-patient-demo-001",
      type: "document"
    });
    expect(body.entry[0].resource).toMatchObject({
      resourceType: "Composition",
      subject: {
        reference: "Patient/patient-demo-001"
      },
      author: [
        {
          reference: "Practitioner/practitioner-demo-001"
        }
      ]
    });
    expect(body.entry).toHaveLength(48);
    expect(body.entry[0].resource.section).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Cơ sở, nhân sự và endpoint liên thông"
        }),
        expect.objectContaining({
          title: "Đồng ý chia sẻ hồ sơ"
        }),
        expect.objectContaining({
          title: "Luồng công việc thực thi chỉ định"
        }),
        expect.objectContaining({
          title: "Thủ thuật và hoạt động đã thực hiện"
        }),
        expect.objectContaining({
          title: "Cấp phát thuốc"
        }),
        expect.objectContaining({
          title: "Dùng thuốc thực tế"
        })
      ])
    );
  });

  it("exports signed clinical document provenance as FHIR Provenance", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/clinical-documents/clinical-document-demo-001/fhir-provenance",
      headers: treatmentHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      resourceType: "Provenance",
      id: "clinical-document-demo-001-provenance",
      target: [
        {
          reference: "DocumentReference/clinical-document-demo-001",
          display: "Tóm tắt ra viện - Nguyễn Văn An"
        }
      ],
      occurredDateTime: "2026-05-27T02:00:00.000Z",
      recorded: "2026-05-27T02:00:00.000Z",
      agent: [
        {
          who: {
            reference: "Practitioner/practitioner-demo-001"
          }
        }
      ],
      entity: [
        {
          role: "source",
          what: {
            reference: "s3://wiiicare-demo/patients/patient-demo-001/discharge-summary.pdf"
          }
        }
      ]
    });
  });

  it("exports clinical document attachment metadata as FHIR DocumentReference", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/clinical-documents/clinical-document-demo-001/fhir",
      headers: treatmentHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      resourceType: "DocumentReference",
      id: "clinical-document-demo-001",
      content: [
        {
          attachment: {
            contentType: "application/pdf",
            url: "s3://wiiicare-demo/patients/patient-demo-001/discharge-summary.pdf",
            size: 245760,
            hash: "Kb0sBAJESyiK08beYsfPVMQp3xU=",
            title: "Tóm tắt ra viện - Nguyễn Văn An",
            creation: "2026-05-27T01:55:00.000Z"
          }
        }
      ]
    });
  });

  it("rejects FHIR Provenance export for an unsigned clinical document", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/clinical-documents/clinical-document-demo-002/fhir-provenance",
      headers: treatmentHeaders(accessToken)
    });

    expectOperationOutcome(response, {
      statusCode: 422,
      code: "business-rule",
      detailsCode: "CLINICAL_DOCUMENT_PROVENANCE_ERROR"
    });
  });

  it("returns FHIR OperationOutcome when a FHIR DocumentReference target is missing", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/clinical-documents/clinical-document-missing/fhir",
      headers: treatmentHeaders(accessToken)
    });

    expectOperationOutcome(response, {
      statusCode: 404,
      code: "not-found",
      detailsCode: "CLINICAL_DOCUMENT_NOT_FOUND"
    });
  });

  it("negotiates auth and RBAC denials on FHIR endpoints as OperationOutcome", async () => {
    app = await readyServer();
    const nurseToken = await loginForToken(app, "nurse-demo-001", "nurse");
    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");

    const unauthenticatedResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir",
      headers: {
        accept: "application/fhir+json",
        "x-request-id": "fhir-unauthenticated-001"
      }
    });

    expectOperationOutcome(unauthenticatedResponse, {
      statusCode: 401,
      code: "login",
      detailsCode: "UNAUTHENTICATED"
    });
    expect(String(unauthenticatedResponse.headers["www-authenticate"])).toBe("Bearer");

    const forbiddenResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir",
      headers: {
        ...treatmentHeaders(nurseToken),
        accept: "application/fhir+json",
        "x-request-id": "fhir-forbidden-nurse-export-001"
      }
    });

    expectOperationOutcome(forbiddenResponse, {
      statusCode: 403,
      code: "forbidden",
      detailsCode: "FORBIDDEN"
    });

    const auditResponse = await app.inject({
      method: "GET",
      url: "/api/v1/audit-events?limit=25",
      headers: auditHeaders(auditorToken)
    });
    const auditBody = auditResponse.json();
    const deniedAuditEvent = auditBody.items.find(
      (event: { readonly metadata?: { readonly requestId?: string } }) =>
        event.metadata?.requestId === "fhir-forbidden-nurse-export-001"
    );

    expect(auditResponse.statusCode).toBe(200);
    expect(deniedAuditEvent).toMatchObject({
      action: "access.denied",
      resourceType: "Patient",
      resourceId: "patient:fhir-export",
      metadata: expect.objectContaining({
        denialCode: "FORBIDDEN",
        deniedPermission: "patient:fhir-export",
        deniedActorId: "nurse-demo-001",
        deniedActorRole: "nurse",
        deniedActorPurposeOfUse: "TREATMENT",
        statusCode: 403
      })
    });
  });

  it("negotiates patient-scope ABAC denials on FHIR endpoints as OperationOutcome", async () => {
    app = await readyServer();
    const adminToken = await loginForToken(app, "admin-demo", "admin");
    const clinicianToken = await loginForToken(app, "practitioner-demo-001", "clinician");
    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");

    const outsidePatientResponse = await app.inject({
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
            value: "MRN-FHIR-ABAC-DENIED",
            type: "hospital-mrn"
          }
        ],
        fullName: "FHIR ABAC Denied Patient",
        gender: "unknown",
        managingOrganizationId: "hospital-outside-fhir-denied"
      }
    });
    const outsidePatient = outsidePatientResponse.json() as { readonly id: string };

    expect(outsidePatientResponse.statusCode).toBe(201);

    const deniedResponse = await app.inject({
      method: "GET",
      url: `/api/v1/patients/${outsidePatient.id}/fhir`,
      headers: {
        ...treatmentHeaders(clinicianToken),
        accept: "application/fhir+json",
        "x-request-id": "fhir-patient-abac-denied-001"
      }
    });

    expectOperationOutcome(deniedResponse, {
      statusCode: 403,
      code: "forbidden",
      detailsCode: "PATIENT_ACCESS_DENIED"
    });

    const auditResponse = await app.inject({
      method: "GET",
      url: `/api/v1/patients/${outsidePatient.id}/audit-events`,
      headers: auditHeaders(auditorToken)
    });
    const auditBody = auditResponse.json();
    const deniedAuditEvent = auditBody.items.find(
      (event: { readonly metadata?: { readonly requestId?: string } }) =>
        event.metadata?.requestId === "fhir-patient-abac-denied-001"
    );

    expect(auditResponse.statusCode).toBe(200);
    expect(deniedAuditEvent).toMatchObject({
      action: "access.denied",
      resourceType: "Patient",
      resourceId: outsidePatient.id,
      patientId: outsidePatient.id,
      metadata: expect.objectContaining({
        denialCode: "PATIENT_ACCESS_DENIED",
        deniedActorId: "practitioner-demo-001",
        deniedActorRole: "clinician",
        deniedActorPurposeOfUse: "TREATMENT",
        statusCode: 403
      })
    });
  });

  it("negotiates validation errors as FHIR OperationOutcome when requested", async () => {
    app = await readyServer();
    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");

    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/audit-events?limit=0",
      headers: {
        ...auditHeaders(auditorToken),
        accept: "application/fhir+json",
        "x-request-id": "fhir-validation-error-001"
      }
    });

    expectOperationOutcome(fhirResponse, {
      statusCode: 400,
      code: "invalid",
      detailsCode: "VALIDATION_ERROR"
    });
    expect(fhirResponse.json()).toMatchObject({
      issue: [
        {
          diagnostics: expect.any(String),
          expression: ["limit"]
        }
      ]
    });

    const jsonResponse = await app.inject({
      method: "GET",
      url: "/api/v1/audit-events?limit=0",
      headers: {
        ...auditHeaders(auditorToken),
        "x-request-id": "json-validation-error-001"
      }
    });

    expect(jsonResponse.statusCode).toBe(400);
    expect(String(jsonResponse.headers["content-type"])).toContain("application/json");
    expect(jsonResponse.json()).toMatchObject({
      error: "VALIDATION_ERROR",
      message: "Request validation failed.",
      requestId: "json-validation-error-001"
    });
  });

  it("rejects clinical document attachment metadata with invalid MIME type or SHA-1 hash", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/documents",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json",
        "x-request-id": "clinical-document-validation-001"
      },
      payload: {
        encounterId: "encounter-demo-001",
        type: "lab-report",
        title: "Tài liệu metadata lỗi",
        storageUri: "s3://wiiicare-demo/patients/patient-demo-001/invalid.pdf",
        attachmentContentType: "not-a-mime-type",
        attachmentHashSha1Base64: "not-a-sha1-hash",
        authorPractitionerId: "practitioner-demo-001"
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "VALIDATION_ERROR",
      requestId: "clinical-document-validation-001",
      issues: expect.any(Array)
    });
  });

  it("rejects FHIR unsignedInt overflows at the request boundary", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const documentResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/documents",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json",
        "x-request-id": "clinical-document-unsigned-int-001"
      },
      payload: {
        encounterId: "encounter-demo-001",
        type: "lab-report",
        title: "Tài liệu vượt giới hạn unsignedInt",
        storageUri: "s3://wiiicare-demo/patients/patient-demo-001/oversized.pdf",
        attachmentSizeBytes: 2_147_483_648,
        authorPractitionerId: "practitioner-demo-001"
      }
    });

    expect(documentResponse.statusCode).toBe(400);
    expect(documentResponse.json()).toMatchObject({
      error: "VALIDATION_ERROR",
      requestId: "clinical-document-unsigned-int-001"
    });

    const imagingResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/imaging-studies",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json",
        "x-request-id": "imaging-study-unsigned-int-001"
      },
      payload: {
        studyInstanceUid: "1.2.826.0.1.3680043.10.543.202605270100",
        series: [
          {
            uid: "1.2.826.0.1.3680043.10.543.202605270100.1",
            number: 2_147_483_648,
            modality: {
              system: "http://dicom.nema.org/resources/ontology/DCM",
              code: "DX",
              display: "Digital Radiography"
            },
            numberOfInstances: 1
          }
        ]
      }
    });

    expect(imagingResponse.statusCode).toBe(400);
    expect(imagingResponse.json()).toMatchObject({
      error: "VALIDATION_ERROR",
      requestId: "imaging-study-unsigned-int-001"
    });
  });

  it("rejects malformed DICOM UIDs at the request boundary", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const invalidStudyUidResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/imaging-studies",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json",
        "x-request-id": "imaging-study-invalid-study-uid-001"
      },
      payload: {
        studyInstanceUid: "1.2.826.0.01.3680043.10.543.202605270101",
        series: [
          {
            uid: "1.2.826.0.1.3680043.10.543.202605270101.1",
            modality: {
              system: "http://dicom.nema.org/resources/ontology/DCM",
              code: "DX",
              display: "Digital Radiography"
            },
            numberOfInstances: 1
          }
        ]
      }
    });

    expect(invalidStudyUidResponse.statusCode).toBe(400);
    expect(invalidStudyUidResponse.json()).toMatchObject({
      error: "VALIDATION_ERROR",
      requestId: "imaging-study-invalid-study-uid-001"
    });

    const invalidSeriesUidResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/imaging-studies",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json",
        "x-request-id": "imaging-study-invalid-series-uid-001"
      },
      payload: {
        studyInstanceUid: "1.2.826.0.1.3680043.10.543.202605270102",
        series: [
          {
            uid: "1.2.826.0.1.3680043.10.543.202605270102.",
            modality: {
              system: "http://dicom.nema.org/resources/ontology/DCM",
              code: "DX",
              display: "Digital Radiography"
            },
            numberOfInstances: 1
          }
        ]
      }
    });

    expect(invalidSeriesUidResponse.statusCode).toBe(400);
    expect(invalidSeriesUidResponse.json()).toMatchObject({
      error: "VALIDATION_ERROR",
      requestId: "imaging-study-invalid-series-uid-001"
    });
  });
});
