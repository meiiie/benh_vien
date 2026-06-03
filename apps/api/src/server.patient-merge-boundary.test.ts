import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  captureAuthBoundaryEnv,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";
import {
  type PatientRegistryTestContext,
  createPatientForRegistryMerge,
  findPatientRegistryAuditEvent,
  loginPatientRegistryToken,
  patientRegistryJsonHeaders,
  patientRegistryTreatmentHeaders,
  readyPatientRegistryTestContext
} from "./server.patient-registry.test-support.js";

describe("API patient merge boundary", () => {
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

  it("merges a duplicate patient record into the canonical patient", async () => {
    const adminToken = context!.accessToken;
    const clinicianToken = await loginPatientRegistryToken(
      context!,
      "practitioner-demo-001",
      "clinician"
    );
    const sourcePatientId = await createPatientForRegistryMerge({
      context: context!,
      adminToken
    });

    const clinicianMergeResponse = await context!.app.inject({
      method: "POST",
      url: `/api/v1/patients/${sourcePatientId}/merge`,
      headers: patientRegistryJsonHeaders(
        clinicianToken,
        "patient-merge-clinician-denied-001"
      ),
      payload: {
        targetPatientId: "patient-demo-001",
        reason: "Clinician should not merge patient registry records."
      }
    });

    expect(clinicianMergeResponse.statusCode).toBe(403);
    expect(clinicianMergeResponse.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "patient:merge",
      requestId: "patient-merge-clinician-denied-001"
    });

    const mergeResponse = await context!.app.inject({
      method: "POST",
      url: `/api/v1/patients/${sourcePatientId}/merge`,
      headers: patientRegistryJsonHeaders(adminToken, "patient-merge-001"),
      payload: {
        targetPatientId: "patient-demo-001",
        reason: "Duplicate registration found during MPI review."
      }
    });
    const merged = mergeResponse.json();

    expect(mergeResponse.statusCode).toBe(200);
    expect(merged).toMatchObject({
      id: sourcePatientId,
      status: "merged",
      mergedIntoPatientId: "patient-demo-001",
      mergedByActorId: "admin-demo",
      mergeReason: "Duplicate registration found during MPI review."
    });
    expect(Date.parse(merged.mergedAt)).not.toBeNaN();

    const fhirResponse = await context!.app.inject({
      method: "GET",
      url: `/api/v1/patients/${sourcePatientId}/fhir`,
      headers: patientRegistryTreatmentHeaders(context!)
    });
    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "Patient",
      id: sourcePatientId,
      active: false,
      link: [
        {
          other: {
            reference: "Patient/patient-demo-001"
          },
          type: "replaced-by"
        }
      ]
    });

    const writeAfterMergeResponse = await context!.app.inject({
      method: "POST",
      url: `/api/v1/patients/${sourcePatientId}/encounters`,
      headers: patientRegistryJsonHeaders(
        adminToken,
        "patient-merge-write-denied-001"
      ),
      payload: {
        class: "ambulatory",
        serviceType: "Should not write to merged patient",
        reasonText: "Merged source patient must stay read-only.",
        attendingPractitionerId: "practitioner-demo-001",
        startedAt: "2026-05-28T05:00:00.000Z"
      }
    });

    expect(writeAfterMergeResponse.statusCode).toBe(409);
    expect(writeAfterMergeResponse.json()).toMatchObject({
      error: "PATIENT_RECORD_MERGED",
      requestId: "patient-merge-write-denied-001",
      patientId: sourcePatientId,
      mergedIntoPatientId: "patient-demo-001"
    });

    const mergeAuditEvent = await findPatientRegistryAuditEvent({
      context: context!,
      requestId: "patient-merge-001",
      limit: 20
    });

    expect(mergeAuditEvent).toMatchObject({
      action: "patient.merge",
      resourceType: "Patient",
      resourceId: sourcePatientId,
      patientId: sourcePatientId,
      metadata: expect.objectContaining({
        targetPatientId: "patient-demo-001"
      })
    });
  });
});
