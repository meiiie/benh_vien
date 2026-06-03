import type { FastifyInstance } from "fastify";
import { createTreatmentResource } from "./server.patient-access.test-resource.js";

export type OutsideSharingFixture = {
  readonly outsideConsentId: string;
  readonly outsideTransferId: string;
};

export async function createOutsideSharingFixture(
  app: FastifyInstance,
  adminToken: string,
  outsidePatientId: string
): Promise<OutsideSharingFixture> {
  const outsideConsentId = await createTreatmentResource(
    app,
    adminToken,
    `/api/v1/patients/${outsidePatientId}/consents`,
    {
      category: "record-sharing",
      granteeOrganizationId: "hospital-hai-phong-referral",
      validFrom: "2026-05-28T00:00:00.000Z",
      validUntil: "2026-12-31T23:59:59.000Z"
    }
  );

  const outsideTransferId = await createTreatmentResource(
    app,
    adminToken,
    `/api/v1/patients/${outsidePatientId}/record-transfers`,
    {
      bundleType: "document",
      sourceOrganizationId: "hospital-outside-demo",
      recipientOrganizationId: "hospital-hai-phong-referral",
      consentReference: outsideConsentId,
      reason: "Outside transfer for ABAC verification."
    }
  );

  return {
    outsideConsentId,
    outsideTransferId
  };
}
