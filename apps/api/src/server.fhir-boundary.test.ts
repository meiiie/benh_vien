import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  auditHeaders,
  bundleTransferHeaders,
  captureAuthBoundaryEnv,
  expectOperationOutcome,
  jsonRequestHeaders,
  loginForToken,
  readyServer,
  restoreAuthBoundaryEnv,
  treatmentHeaders
} from "./server.auth.test-support.js";
import {
  bundleResourceTypes,
  countBundleResource,
  fhirRequestHeaders,
  findAuditEventByRequestId
} from "./server.fhir.test-support.js";

describe("API FHIR interoperability boundary", () => {
  let app: FastifyInstance;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(() => {
    applyDefaultAuthBoundaryEnv();
  });

  afterEach(async () => {
    await app.close();
    restoreAuthBoundaryEnv(originalEnv);
  });

  async function readySessionToken(
    username = "practitioner-demo-001",
    role = "clinician"
  ): Promise<string> {
    app = await readyServer();
    return loginForToken(app, username, role);
  }

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
    const accessToken = await readySessionToken("nurse-demo-001", "nurse");

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
    const accessToken = await readySessionToken();

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir-bundle",
      headers: bundleTransferHeaders(accessToken)
    });
    const body = response.json();
    const resourceTypes = bundleResourceTypes(body);

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
    const accessToken = await readySessionToken();

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
    expect(body.entry).toHaveLength(49);
    expect(countBundleResource(body, "Provenance")).toBe(1);
    expect(body.entry).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          resource: expect.objectContaining({
            resourceType: "Provenance",
            id: "clinical-document-demo-001-provenance",
            target: [
              {
                reference: "DocumentReference/clinical-document-demo-001",
                display: "Tóm tắt ra viện - Nguyễn Văn An"
              }
            ]
          })
        })
      ])
    );
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
        }),
        expect.objectContaining({
          title: "Nguồn gốc và ký xác nhận tài liệu",
          entry: [
            {
              reference: "Provenance/clinical-document-demo-001-provenance"
            }
          ]
        })
      ])
    );
  });

  it("exports signed clinical document provenance as FHIR Provenance", async () => {
    const accessToken = await readySessionToken();

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
    const accessToken = await readySessionToken();

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
    const accessToken = await readySessionToken();

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
    const accessToken = await readySessionToken();

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
      headers: fhirRequestHeaders({
        "x-request-id": "fhir-unauthenticated-001"
      })
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
      headers: fhirRequestHeaders({
        ...treatmentHeaders(nurseToken),
        "x-request-id": "fhir-forbidden-nurse-export-001"
      })
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
    const deniedAuditEvent = findAuditEventByRequestId(
      auditBody,
      "fhir-forbidden-nurse-export-001"
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
      headers: jsonRequestHeaders(treatmentHeaders(adminToken)),
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
      headers: fhirRequestHeaders({
        ...treatmentHeaders(clinicianToken),
        "x-request-id": "fhir-patient-abac-denied-001"
      })
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
    const deniedAuditEvent = findAuditEventByRequestId(
      auditBody,
      "fhir-patient-abac-denied-001"
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

});
