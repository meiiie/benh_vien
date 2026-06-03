import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  captureAuthBoundaryEnv,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";
import {
  type PatientRegistryTestContext,
  findPatientRegistryAuditEvent,
  patientRegistryJsonHeaders,
  patientRegistryTreatmentHeaders,
  readyPatientRegistryTestContext
} from "./server.patient-registry.test-support.js";

describe("API patient identifier boundary", () => {
  let context: PatientRegistryTestContext | undefined;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(async () => {
    context = await readyPatientRegistryTestContext("admin-demo", "admin");
  });

  afterEach(async () => {
    if (context) {
      await context.app.close();
      context = undefined;
    }

    restoreAuthBoundaryEnv(originalEnv);
  });

  it("blocks duplicate patient identifiers before creating a new record", async () => {
    const response = await context!.app.inject({
      method: "POST",
      url: "/api/v1/patients",
      headers: patientRegistryJsonHeaders(
        context!.accessToken,
        "patient-identifier-conflict-001"
      ),
      payload: {
        identifiers: [
          {
            system: "urn:gov:vietnam:national-id",
            value: "000000000001",
            type: "national-id"
          }
        ],
        fullName: "Duplicate Identity Patient",
        gender: "unknown",
        managingOrganizationId: "hospital-hai-phong-demo"
      }
    });
    const body = response.json();

    expect(response.statusCode).toBe(409);
    expect(body).toMatchObject({
      error: "PATIENT_IDENTIFIER_CONFLICT",
      requestId: "patient-identifier-conflict-001",
      identifier: {
        system: "urn:gov:vietnam:national-id",
        type: "national-id"
      }
    });
    expect(JSON.stringify(body)).not.toContain("patient-demo-001");

    const patientsResponse = await context!.app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: patientRegistryTreatmentHeaders(context!)
    });
    expect(patientsResponse.json().items).toHaveLength(1);

    const conflictEvent = await findPatientRegistryAuditEvent({
      context: context!,
      requestId: "patient-identifier-conflict-001",
      limit: 10
    });

    expect(conflictEvent).toMatchObject({
      action: "patient.identifier-conflict",
      resourceType: "Patient",
      resourceId: "patient-demo-001",
      patientId: "patient-demo-001",
      metadata: expect.objectContaining({
        identifierSystem: "urn:gov:vietnam:national-id",
        identifierType: "national-id"
      })
    });
  });
});
