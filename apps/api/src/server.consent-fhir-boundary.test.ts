import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  captureAuthBoundaryEnv,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";
import {
  type ConsentTestContext,
  consentTreatmentHeaders,
  readyConsentTestContext
} from "./server.consent.test-support.js";

describe("API consent FHIR boundary", () => {
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

  it("exports patient consent as FHIR Consent", async () => {
    const response = await context!.app.inject({
      method: "GET",
      url: "/api/v1/consents/consent-demo-transfer-001/fhir",
      headers: consentTreatmentHeaders(context!)
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
});
