import type { FastifyInstance } from "fastify";
import { createTreatmentResource } from "./server.patient-access.test-resource.js";

export type OutsideMedicationFixture = {
  readonly outsideMedicationRequestId: string;
  readonly outsideMedicationDispenseId: string;
  readonly outsideMedicationAdministrationId: string;
};

export async function createOutsideMedicationFixture(
  app: FastifyInstance,
  adminToken: string,
  input: {
    readonly outsidePatientId: string;
    readonly outsideEncounterId: string;
    readonly outsideConditionId: string;
  }
): Promise<OutsideMedicationFixture> {
  const medicationCode = {
    system: "http://www.whocc.no/atc",
    code: "J01CA04",
    display: "Amoxicillin"
  };
  const dosageInstruction = {
    text: "Take 500 mg every 8 hours",
    route: "Oral route",
    doseQuantity: {
      value: 500,
      unit: "mg",
      system: "http://unitsofmeasure.org",
      code: "mg"
    },
    frequency: 3,
    period: 1,
    periodUnit: "d"
  };

  const outsideMedicationRequestId = await createTreatmentResource(
    app,
    adminToken,
    `/api/v1/patients/${input.outsidePatientId}/medication-requests`,
    {
      encounterId: input.outsideEncounterId,
      reasonConditionId: input.outsideConditionId,
      category: "outpatient",
      medicationCode,
      dosageInstruction,
      requesterPractitionerId: "practitioner-demo-003",
      expectedSupplyDurationDays: 7
    }
  );

  const outsideMedicationDispenseId = await createTreatmentResource(
    app,
    adminToken,
    `/api/v1/patients/${input.outsidePatientId}/medication-dispenses`,
    {
      encounterId: input.outsideEncounterId,
      medicationRequestId: outsideMedicationRequestId,
      status: "completed",
      category: "outpatient",
      medicationCode,
      quantity: {
        value: 21,
        unit: "tablet",
        system: "http://unitsofmeasure.org",
        code: "{tablet}"
      },
      daysSupply: {
        value: 7,
        unit: "day",
        system: "http://unitsofmeasure.org",
        code: "d"
      },
      whenPrepared: "2026-05-28T01:10:00.000Z",
      whenHandedOver: "2026-05-28T01:15:00.000Z",
      dispenserPractitionerId: "nurse-demo-001",
      receiverPractitionerId: "nurse-demo-001",
      dosageInstruction
    }
  );

  const outsideMedicationAdministrationId = await createTreatmentResource(
    app,
    adminToken,
    `/api/v1/patients/${input.outsidePatientId}/medication-administrations`,
    {
      encounterId: input.outsideEncounterId,
      medicationRequestId: outsideMedicationRequestId,
      reasonConditionId: input.outsideConditionId,
      status: "completed",
      category: "outpatient",
      medicationCode,
      effectivePeriod: {
        start: "2026-05-28T01:20:00.000Z"
      },
      performers: [
        {
          actorType: "Practitioner",
          actorId: "nurse-demo-001"
        }
      ],
      dosage: {
        text: "Take 500 mg every 8 hours",
        route: {
          system: "http://snomed.info/sct",
          code: "26643006",
          display: "Oral route"
        },
        doseQuantity: {
          value: 500,
          unit: "mg",
          system: "http://unitsofmeasure.org",
          code: "mg"
        }
      }
    }
  );

  return {
    outsideMedicationRequestId,
    outsideMedicationDispenseId,
    outsideMedicationAdministrationId
  };
}
