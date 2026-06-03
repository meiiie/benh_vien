import type { FastifyInstance } from "fastify";
import { createTreatmentResource } from "./server.patient-access.test-resource.js";

export type OutsideClinicalFixture = {
  readonly outsideEncounterId: string;
  readonly outsideAllergyId: string;
  readonly outsideConditionId: string;
  readonly outsideDocumentId: string;
  readonly outsideObservationId: string;
};

export async function createOutsideClinicalFixture(
  app: FastifyInstance,
  adminToken: string,
  outsidePatientId: string
): Promise<OutsideClinicalFixture> {
  const outsideEncounterId = await createTreatmentResource(
    app,
    adminToken,
    `/api/v1/patients/${outsidePatientId}/encounters`,
    {
      class: "ambulatory",
      serviceType: "Outside organization visit",
      reasonText: "Outside encounter for ABAC verification.",
      attendingPractitionerId: "practitioner-demo-003",
      startedAt: "2026-05-28T00:30:00.000Z"
    }
  );

  const outsideAllergyId = await createTreatmentResource(
    app,
    adminToken,
    `/api/v1/patients/${outsidePatientId}/allergy-intolerances`,
    {
      encounterId: outsideEncounterId,
      type: "allergy",
      category: "medication",
      code: {
        system: "http://snomed.info/sct",
        code: "91936005",
        display: "Allergy to penicillin"
      },
      recorderPractitionerId: "practitioner-demo-003"
    }
  );

  const outsideConditionId = await createTreatmentResource(
    app,
    adminToken,
    `/api/v1/patients/${outsidePatientId}/conditions`,
    {
      encounterId: outsideEncounterId,
      category: "encounter-diagnosis",
      code: {
        system: "http://hl7.org/fhir/sid/icd-10",
        code: "J18.9",
        display: "Pneumonia, unspecified organism"
      },
      recorderPractitionerId: "practitioner-demo-003"
    }
  );

  const outsideDocumentId = await createTreatmentResource(
    app,
    adminToken,
    `/api/v1/patients/${outsidePatientId}/documents`,
    {
      type: "referral-letter",
      title: "Outside referral letter",
      storageUri: "s3://wiiicare-test/outside/referral-letter.pdf",
      authorPractitionerId: "practitioner-demo-003"
    }
  );

  const outsideObservationId = await createTreatmentResource(
    app,
    adminToken,
    `/api/v1/patients/${outsidePatientId}/observations`,
    {
      category: "vital-signs",
      code: {
        system: "http://loinc.org",
        code: "8310-5",
        display: "Body temperature"
      },
      effectiveAt: "2026-05-28T01:00:00.000Z",
      valueQuantity: {
        value: 37,
        unit: "Cel",
        system: "http://unitsofmeasure.org",
        code: "Cel"
      },
      performerPractitionerId: "practitioner-demo-001"
    }
  );

  return {
    outsideEncounterId,
    outsideAllergyId,
    outsideConditionId,
    outsideDocumentId,
    outsideObservationId
  };
}
