import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ProviderDirectoryRepository } from "@benh-vien-so/domain";
import { buildServer } from "./server.js";

const testSecret = "wiiicare-test-secret-at-least-32-characters";

describe("API auth and RBAC boundary", () => {
  let app: FastifyInstance | undefined;
  const originalRepository = process.env.BVS_REPOSITORY;
  const originalAuthSecret = process.env.BVS_AUTH_SECRET;
  const originalCorsOrigins = process.env.BVS_CORS_ORIGINS;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.BVS_REPOSITORY = "in-memory";
    process.env.BVS_AUTH_SECRET = testSecret;
  });

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }

    restoreEnv("BVS_REPOSITORY", originalRepository);
    restoreEnv("BVS_AUTH_SECRET", originalAuthSecret);
    restoreEnv("BVS_CORS_ORIGINS", originalCorsOrigins);
    restoreEnv("NODE_ENV", originalNodeEnv);
  });

  it("returns a signed demo session for valid credentials", async () => {
    app = await readyServer();

    const response = await login(app, {
      username: "practitioner-demo-001",
      password: "demo",
      role: "clinician"
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.accessToken).toEqual(expect.any(String));
    expect(body.actor).toMatchObject({
      actorId: "practitioner-demo-001",
      displayName: "Bác sĩ điều trị",
      role: "clinician"
    });
  });

  it("rejects patient access without a Bearer token", async () => {
    app = await readyServer();

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients"
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      error: "UNAUTHENTICATED"
    });
  });

  it("returns readiness checks for repository-backed dependencies", async () => {
    app = await readyServer();

    const response = await app.inject({
      method: "GET",
      url: "/ready"
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      status: "ready",
      service: "benh-vien-so-api",
      repository: "in-memory",
      checks: {
        patients: {
          status: "ok",
          count: 1
        },
        providerDirectory: {
          status: "ok",
          organizations: expect.any(Number),
          practitioners: expect.any(Number),
          endpoints: expect.any(Number)
        }
      }
    });
    expect(body.latencyMs).toEqual(expect.any(Number));
  });

  it("sets baseline HTTP security headers", async () => {
    app = await readyServer();

    const response = await app.inject({
      method: "GET",
      url: "/health"
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-frame-options"]).toBe("DENY");
    expect(response.headers["referrer-policy"]).toBe("no-referrer");
    expect(response.headers["permissions-policy"]).toBe(
      "camera=(), microphone=(), geolocation=()"
    );
    expect(response.headers["cross-origin-resource-policy"]).toBe("same-site");
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.headers.pragma).toBe("no-cache");
  });

  it("echoes the request id header for trace correlation", async () => {
    app = await readyServer();

    const response = await app.inject({
      method: "GET",
      url: "/health",
      headers: {
        "x-request-id": "trace-demo-001"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["x-request-id"]).toBe("trace-demo-001");
  });

  it("returns a safe validation error envelope with request id", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/provider-directory/InvalidResource/provider-demo/fhir",
      headers: {
        ...treatmentHeaders(accessToken),
        "x-request-id": "validation-trace-demo-001"
      }
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body).toMatchObject({
      error: "VALIDATION_ERROR",
      message: "Request validation failed.",
      requestId: "validation-trace-demo-001",
      issues: expect.any(Array)
    });
    expect(JSON.stringify(body)).not.toContain("stack");
  });

  it("returns a safe internal error envelope without leaking implementation details", async () => {
    const throwingProviderDirectoryRepository: ProviderDirectoryRepository = {
      async findDirectory() {
        throw new Error("database credential path leaked");
      },
      async save() {
        return undefined;
      }
    };
    app = await buildServer({
      logger: false,
      providerDirectoryRepository: throwingProviderDirectoryRepository
    });
    await app.ready();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/provider-directory",
      headers: {
        ...treatmentHeaders(accessToken),
        "x-request-id": "internal-trace-demo-001"
      }
    });
    const body = response.json();
    const serializedBody = JSON.stringify(body);

    expect(response.statusCode).toBe(500);
    expect(body).toMatchObject({
      error: "INTERNAL_SERVER_ERROR",
      message: "Unexpected internal server error.",
      requestId: "internal-trace-demo-001"
    });
    expect(serializedBody).not.toContain("database credential path leaked");
    expect(serializedBody).not.toContain("stack");
  });

  it("requires explicit CORS origins in production", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.BVS_CORS_ORIGINS;

    await expect(buildServer({ logger: false })).rejects.toThrow(
      "BVS_CORS_ORIGINS must be set in production."
    );
  });

  it("serves FHIR CapabilityStatement metadata without a demo session", async () => {
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

  it("allows clinician treatment access to patient registry", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: treatmentHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      id: "patient-demo-001",
      fullName: "Nguyễn Văn An"
    });
  });

  it("allows auditor audit-purpose patient registry context", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "security-officer-demo", "auditor");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: auditHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      id: "patient-demo-001"
    });
  });

  it("denies auditor treatment-purpose patient registry context", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "security-officer-demo", "auditor");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: treatmentHeaders(accessToken)
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "patient:list"
    });
  });

  it("denies auditor attempts to create clinical data", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "security-officer-demo", "auditor");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients",
      headers: {
        ...auditHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        identifiers: [
          {
            system: "urn:benh-vien-so:mrn",
            value: "MRN-DENIED-TEST",
            type: "hospital-mrn"
          }
        ],
        fullName: "RBAC Denied",
        managingOrganizationId: "hospital-hai-phong-demo"
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "patient:create"
    });
  });

  it("allows auditor audit-purpose access to patient audit events", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "security-officer-demo", "auditor");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/audit-events",
      headers: auditHeaders(accessToken)
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      items: expect.any(Array)
    });
  });

  it("stores request id in audit metadata for clinical access", async () => {
    app = await readyServer();
    const clinicianToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const readResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001",
      headers: {
        ...treatmentHeaders(clinicianToken),
        "x-request-id": "audit-trace-demo-001"
      }
    });
    expect(readResponse.statusCode).toBe(200);

    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");
    const auditResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/audit-events",
      headers: auditHeaders(auditorToken)
    });
    const body = auditResponse.json();

    expect(auditResponse.statusCode).toBe(200);
    expect(body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: "patient.read",
          metadata: expect.objectContaining({
            requestId: "audit-trace-demo-001"
          })
        })
      ])
    );
  });

  it("exports patient audit trail as a FHIR AuditEvent Bundle for auditor review", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "security-officer-demo", "auditor");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/audit-events/fhir-bundle",
      headers: auditHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      resourceType: "Bundle",
      type: "collection",
      entry: [
        {
          resource: {
            resourceType: "AuditEvent",
            type: {
              code: "rest"
            },
            subtype: [
              {
                code: "audit-event.fhir-export"
              }
            ],
            agent: [
              {
                requestor: true,
                purposeOfUse: [
                  {
                    code: "AUDIT"
                  }
                ]
              }
            ]
          }
        }
      ]
    });
    expect(body.entry[0].resource.entity[0].detail).toContainEqual(
      expect.objectContaining({
        type: "integrityHash",
        valueString: expect.stringMatching(/^[a-f0-9]{64}$/)
      })
    );
  });

  it("denies clinician treatment-purpose export of the audit FHIR Bundle", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/audit-events/fhir-bundle",
      headers: treatmentHeaders(accessToken)
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "audit-event:fhir-export"
    });
  });

  it("returns a verified audit integrity report for auditor review", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "security-officer-demo", "auditor");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/audit-integrity",
      headers: auditHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      patientId: "patient-demo-001",
      status: "verified",
      verified: true,
      totalEvents: 1,
      sealedEvents: 1
    });
    expect(body.latestHash).toEqual(expect.stringMatching(/^[a-f0-9]{64}$/));
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
    expect(body.entry).toHaveLength(44);
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
    expect(body.entry).toHaveLength(45);
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

  it("rejects clinical document attachment metadata with invalid MIME type or SHA-1 hash", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/documents",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
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
      error: "INVALID_CLINICAL_DOCUMENT_PAYLOAD"
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
        note: "Đã gửi gói hồ sơ qua gateway liên thông."
      }
    });

    expect(sendResponse.statusCode).toBe(200);
    expect(sendResponse.json()).toMatchObject({
      id: "record-transfer-demo-001",
      status: "in-progress",
      sentAt: "2026-05-28T04:00:00.000Z"
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
      receivedAt: "2026-05-28T04:15:00.000Z"
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
      }
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

async function readyServer(): Promise<FastifyInstance> {
  const server = await buildServer({
    logger: false
  });
  await server.ready();
  return server;
}

async function login(
  app: FastifyInstance,
  payload: {
    readonly username: string;
    readonly password: string;
    readonly role: string;
  }
) {
  return app.inject({
    method: "POST",
    url: "/api/v1/auth/login",
    headers: {
      "content-type": "application/json"
    },
    payload
  });
}

async function loginForToken(
  app: FastifyInstance,
  username: string,
  role: string
): Promise<string> {
  const response = await login(app, {
    username,
    password: "demo",
    role
  });

  expect(response.statusCode).toBe(200);

  return response.json().accessToken as string;
}

function treatmentHeaders(accessToken: string): Record<string, string> {
  return {
    authorization: `Bearer ${accessToken}`,
    "x-purpose-of-use": "TREATMENT"
  };
}

function bundleTransferHeaders(accessToken: string): Record<string, string> {
  return {
    ...treatmentHeaders(accessToken),
    "x-consent-reference": "consent-demo-transfer-001",
    "x-recipient-organization-id": "hospital-hai-phong-referral"
  };
}

function auditHeaders(accessToken: string): Record<string, string> {
  return {
    authorization: `Bearer ${accessToken}`,
    "x-purpose-of-use": "AUDIT"
  };
}

function expectOperationOutcome(
  response: {
    readonly statusCode: number;
    readonly headers: Record<string, unknown>;
    json(): unknown;
  },
  expected: {
    readonly statusCode: number;
    readonly code: string;
    readonly detailsCode: string;
  }
): void {
  expect(response.statusCode).toBe(expected.statusCode);
  expect(String(response.headers["content-type"])).toContain("application/fhir+json");
  expect(response.json()).toMatchObject({
    resourceType: "OperationOutcome",
    issue: [
      {
        severity: "error",
        code: expected.code,
        details: {
          coding: [
            {
              system: "urn:wiiicare:nexus:operation-outcome",
              code: expected.detailsCode
            }
          ]
        }
      }
    ]
  });
}

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
