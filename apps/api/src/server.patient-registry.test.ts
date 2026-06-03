import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  captureAuthBoundaryEnv,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";
import {
  type PatientRegistryTestContext,
  patientRegistryTreatmentHeaders,
  readyPatientRegistryTestContext
} from "./server.patient-registry.test-support.js";

describe("API patient registry boundary", () => {
  let context: PatientRegistryTestContext | undefined;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(async () => {
    context = await readyPatientRegistryTestContext();
  });

  afterEach(async () => {
    if (context) {
      await context.app.close();
      context = undefined;
    }

    restoreAuthBoundaryEnv(originalEnv);
  });

  it("allows clinician treatment access to patient registry", async () => {
    const response = await context!.app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: patientRegistryTreatmentHeaders(context!)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      id: "patient-demo-001",
      fullName: "Nguyễn Văn An"
    });
  });
});
