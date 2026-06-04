import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  captureAuthBoundaryEnv,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";
import {
  type ConsentTestContext,
  consentTreatmentHeaders,
  createRecordSharingConsent,
  readyConsentTestContext
} from "./server.consent.test-support.js";

describe("API consent boundary", () => {
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

  it("lists active patient consents for treatment users", async () => {
    const response = await context!.app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/consents",
      headers: consentTreatmentHeaders(context!)
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
    const createdConsent = await createRecordSharingConsent({
      context: context!,
      granteeOrganizationId: "hospital-new-recipient"
    });

    expect(createdConsent.id).toEqual(expect.stringMatching(/^consent-/));

    const bundleResponse = await context!.app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir-bundle",
      headers: {
        ...consentTreatmentHeaders(context!),
        "x-consent-reference": String(createdConsent.id),
        "x-recipient-organization-id": "hospital-new-recipient"
      }
    });

    expect(bundleResponse.statusCode).toBe(200);
    expect(bundleResponse.json()).toMatchObject({
      resourceType: "Bundle",
      type: "collection"
    });
  });
});
