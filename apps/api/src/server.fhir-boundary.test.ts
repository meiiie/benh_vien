import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  bundleTransferHeaders,
  captureAuthBoundaryEnv,
  loginForToken,
  readyServer,
  restoreAuthBoundaryEnv,
} from "./server.auth.test-support.js";
import {
  bundleResourceTypes,
  countBundleResource
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

});
