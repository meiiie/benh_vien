import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  captureAuthBoundaryEnv,
  expectOperationOutcome,
  loginForToken,
  readyServer,
  restoreAuthBoundaryEnv,
  treatmentHeaders
} from "./server.auth.test-support.js";

describe("API consent boundary", () => {
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
});
