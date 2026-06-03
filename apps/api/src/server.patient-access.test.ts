import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  auditHeaders,
  captureAuthBoundaryEnv,
  loginForToken,
  readyServer,
  requestIdHeaders,
  restoreAuthBoundaryEnv,
  treatmentHeaders
} from "./server.auth.test-support.js";
import { createOutsidePatientAccessFixture } from "./server.patient-access.test-support.js";

describe("API patient access ABAC boundary", () => {
  let app: FastifyInstance;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(() => {
    applyDefaultAuthBoundaryEnv();
  });

  afterEach(async () => {
    await app.close();
    restoreAuthBoundaryEnv(originalEnv);
  });

  it("filters treatment patient access by the actor provider organization", async () => {
    app = await readyServer();
    const adminToken = await loginForToken(app, "admin-demo", "admin");
    const clinicianToken = await loginForToken(app, "practitioner-demo-001", "clinician");
    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");

    const {
      outsidePatientId,
      listDeniedRequests,
      readDeniedRequests,
      fhirExportDeniedRequests
    } = await createOutsidePatientAccessFixture(app, adminToken);

    const clinicianListResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: treatmentHeaders(clinicianToken)
    });
    const clinicianPatientIds = clinicianListResponse
      .json()
      .items.map((patient: { readonly id: string }) => patient.id);

    expect(clinicianListResponse.statusCode).toBe(200);
    expect(clinicianPatientIds).toContain("patient-demo-001");
    expect(clinicianPatientIds).not.toContain(outsidePatientId);

    const clinicianReadResponse = await app.inject({
      method: "GET",
      url: `/api/v1/patients/${outsidePatientId}`,
      headers: requestIdHeaders(
        treatmentHeaders(clinicianToken),
        "patient-abac-denied-001"
      )
    });

    expect(clinicianReadResponse.statusCode).toBe(403);
    expect(clinicianReadResponse.json()).toMatchObject({
      error: "PATIENT_ACCESS_DENIED",
      requestId: "patient-abac-denied-001",
      patientId: outsidePatientId,
      actor: {
        id: "practitioner-demo-001",
        role: "clinician",
        purposeOfUse: "TREATMENT"
      }
    });

    for (const { url, requestId } of listDeniedRequests) {
      const response = await app.inject({
        method: "GET",
        url,
        headers: requestIdHeaders(treatmentHeaders(clinicianToken), requestId)
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({
        error: "PATIENT_ACCESS_DENIED",
        requestId,
        patientId: outsidePatientId
      });
    }

    for (const { url, requestId } of readDeniedRequests) {
      const response = await app.inject({
        method: "GET",
        url,
        headers: requestIdHeaders(treatmentHeaders(clinicianToken), requestId)
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({
        error: "PATIENT_ACCESS_DENIED",
        requestId,
        patientId: outsidePatientId
      });
    }

    for (const { url, requestId } of fhirExportDeniedRequests) {
      const response = await app.inject({
        method: "GET",
        url,
        headers: requestIdHeaders(treatmentHeaders(clinicianToken), requestId)
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({
        error: "PATIENT_ACCESS_DENIED",
        requestId,
        patientId: outsidePatientId
      });
    }

    const auditorListResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: auditHeaders(auditorToken)
    });
    const auditorPatientIds = auditorListResponse
      .json()
      .items.map((patient: { readonly id: string }) => patient.id);

    expect(auditorListResponse.statusCode).toBe(200);
    expect(auditorPatientIds).toContain(outsidePatientId);
  });
});
