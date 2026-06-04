import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  captureAuthBoundaryEnv,
  expectOperationOutcome,
  loginForToken,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";
import {
  type ConsentTestContext,
  consentTreatmentHeaders,
  consentTreatmentJsonHeaders,
  createRecordSharingConsent,
  readyConsentTestContext,
  revokeConsent
} from "./server.consent.test-support.js";

describe("API consent revocation boundary", () => {
  let context: ConsentTestContext | undefined;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(async () => {
    context = await readyConsentTestContext();
  });

  afterEach(async () => {
    if (context) {
      await context.app.close();
      context = undefined;
    }

    restoreAuthBoundaryEnv(originalEnv);
  });

  it("revokes a patient consent and blocks later record sharing", async () => {
    const createdConsent = await createRecordSharingConsent({
      context: context!,
      granteeOrganizationId: "hospital-revoked-recipient"
    });

    const revokeResponse = await revokeConsent({
      context: context!,
      consentId: String(createdConsent.id),
      reason: "Người bệnh rút lại đồng ý chia sẻ hồ sơ."
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

    const fhirConsentResponse = await context!.app.inject({
      method: "GET",
      url: `/api/v1/consents/${createdConsent.id}/fhir`,
      headers: consentTreatmentHeaders(context!)
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

    const bundleResponse = await context!.app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir-bundle",
      headers: {
        ...consentTreatmentHeaders(context!),
        "x-consent-reference": String(createdConsent.id),
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
    const createdConsent = await createRecordSharingConsent({
      context: context!,
      granteeOrganizationId: "hospital-nurse-denied-recipient"
    });
    const nurseToken = await loginForToken(
      context!.app,
      "nurse-demo-001",
      "nurse"
    );
    const nurseContext: ConsentTestContext = {
      ...context!,
      accessToken: nurseToken
    };

    const revokeResponse = await context!.app.inject({
      method: "POST",
      url: `/api/v1/patients/patient-demo-001/consents/${createdConsent.id}/revoke`,
      headers: consentTreatmentJsonHeaders(nurseContext),
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
