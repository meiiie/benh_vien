import type { FastifyInstance } from "fastify";
import {
  createFhirExportDeniedRequests,
  createListDeniedRequests,
  createReadDeniedRequests,
  type DeniedRequest
} from "./server.patient-access.denied-request-catalog.js";
import { createOutsidePatient } from "./server.patient-access.patient-fixture.js";
import { createTreatmentResource } from "./server.patient-access.test-resource.js";

export type OutsidePatientAccessFixture = {
  readonly outsidePatientId: string;
  readonly listDeniedRequests: readonly DeniedRequest[];
  readonly readDeniedRequests: readonly DeniedRequest[];
  readonly fhirExportDeniedRequests: readonly DeniedRequest[];
};

export async function createOutsidePatientAccessFixture(
  app: FastifyInstance,
  adminToken: string
): Promise<OutsidePatientAccessFixture> {
  const outsidePatientId = await createOutsidePatient(app, adminToken);
  const listDeniedRequests = createListDeniedRequests(outsidePatientId);

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

  const outsideMedicationRequestId = await createTreatmentResource(
    app,
    adminToken,
    `/api/v1/patients/${outsidePatientId}/medication-requests`,
    {
      encounterId: outsideEncounterId,
      reasonConditionId: outsideConditionId,
      category: "outpatient",
      medicationCode: {
        system: "http://www.whocc.no/atc",
        code: "J01CA04",
        display: "Amoxicillin"
      },
      dosageInstruction: {
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
      },
      requesterPractitionerId: "practitioner-demo-003",
      expectedSupplyDurationDays: 7
    }
  );

  const outsideMedicationDispenseId = await createTreatmentResource(
    app,
    adminToken,
    `/api/v1/patients/${outsidePatientId}/medication-dispenses`,
    {
      encounterId: outsideEncounterId,
      medicationRequestId: outsideMedicationRequestId,
      status: "completed",
      category: "outpatient",
      medicationCode: {
        system: "http://www.whocc.no/atc",
        code: "J01CA04",
        display: "Amoxicillin"
      },
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
      dosageInstruction: {
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
      }
    }
  );

  const outsideMedicationAdministrationId = await createTreatmentResource(
    app,
    adminToken,
    `/api/v1/patients/${outsidePatientId}/medication-administrations`,
    {
      encounterId: outsideEncounterId,
      medicationRequestId: outsideMedicationRequestId,
      reasonConditionId: outsideConditionId,
      status: "completed",
      category: "outpatient",
      medicationCode: {
        system: "http://www.whocc.no/atc",
        code: "J01CA04",
        display: "Amoxicillin"
      },
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

  const outsideServiceRequestId = await createTreatmentResource(
    app,
    adminToken,
    `/api/v1/patients/${outsidePatientId}/service-requests`,
    {
      encounterId: outsideEncounterId,
      reasonConditionId: outsideConditionId,
      category: "laboratory",
      code: {
        system: "http://loinc.org",
        code: "58410-2",
        display: "Complete blood count panel"
      },
      requesterPractitionerId: "practitioner-demo-003"
    }
  );

  const outsideDiagnosticReportId = await createTreatmentResource(
    app,
    adminToken,
    `/api/v1/patients/${outsidePatientId}/diagnostic-reports`,
    {
      encounterId: outsideEncounterId,
      basedOnServiceRequestId: outsideServiceRequestId,
      category: "laboratory",
      code: {
        system: "http://loinc.org",
        code: "58410-2",
        display: "Complete blood count panel"
      },
      effectiveAt: "2026-05-28T01:30:00.000Z",
      issuedAt: "2026-05-28T01:45:00.000Z",
      performerOrganizationId: "department-laboratory",
      resultsInterpreterPractitionerId: "practitioner-demo-003",
      resultObservationIds: [outsideObservationId],
      conclusion: "Outside diagnostic report for ABAC verification."
    }
  );

  const outsideProcedureId = await createTreatmentResource(
    app,
    adminToken,
    `/api/v1/patients/${outsidePatientId}/procedures`,
    {
      encounterId: outsideEncounterId,
      basedOnServiceRequestId: outsideServiceRequestId,
      reasonConditionId: outsideConditionId,
      status: "completed",
      category: "diagnostic",
      code: {
        system: "http://snomed.info/sct",
        code: "168537006",
        display: "Chest X-ray"
      },
      performedPeriod: {
        start: "2026-05-28T02:00:00.000Z",
        end: "2026-05-28T02:10:00.000Z"
      },
      performers: [
        {
          actorType: "Practitioner",
          actorId: "practitioner-demo-003",
          onBehalfOfOrganizationId: "hospital-outside-demo"
        }
      ],
      reportReferences: [
        {
          resourceType: "DiagnosticReport",
          id: outsideDiagnosticReportId
        }
      ],
      note: "Outside procedure for ABAC verification."
    }
  );

  const outsideImagingStudyId = await createTreatmentResource(
    app,
    adminToken,
    `/api/v1/patients/${outsidePatientId}/imaging-studies`,
    {
      encounterId: outsideEncounterId,
      basedOnServiceRequestId: outsideServiceRequestId,
      diagnosticReportId: outsideDiagnosticReportId,
      studyInstanceUid: "1.2.826.0.1.3680043.10.543.202605280001",
      accessionNumber: "OUTSIDE-CXR-ABAC-001",
      description: "Outside chest X-ray study for ABAC verification",
      startedAt: "2026-05-28T02:00:00.000Z",
      referrerPractitionerId: "practitioner-demo-003",
      interpreterPractitionerId: "practitioner-demo-003",
      endpointId: "endpoint-pacs-hai-phong-demo",
      series: [
        {
          uid: "1.2.826.0.1.3680043.10.543.202605280001.1",
          number: 1,
          modality: {
            system: "http://dicom.nema.org/resources/ontology/DCM",
            code: "DX",
            display: "Digital Radiography"
          },
          description: "Outside chest radiograph",
          numberOfInstances: 1,
          bodySite: {
            system: "http://snomed.info/sct",
            code: "51185008",
            display: "Thoracic structure"
          }
        }
      ]
    }
  );

  const outsideTaskId = await createTreatmentResource(
    app,
    adminToken,
    `/api/v1/patients/${outsidePatientId}/workflow-tasks`,
    {
      encounterId: outsideEncounterId,
      basedOnServiceRequestId: outsideServiceRequestId,
      status: "requested",
      code: {
        system: "urn:wiiicare:nexus:workflow-task",
        code: "lab-order",
        display: "Lab order"
      },
      requesterPractitionerId: "practitioner-demo-003",
      ownerOrganizationId: "hospital-outside-demo"
    }
  );

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

  const readDeniedRequests = createReadDeniedRequests({
    outsideAllergyId,
    outsideConditionId,
    outsideDiagnosticReportId,
    outsideDocumentId,
    outsideEncounterId,
    outsideImagingStudyId,
    outsideMedicationAdministrationId,
    outsideMedicationDispenseId,
    outsideMedicationRequestId,
    outsideObservationId,
    outsideProcedureId,
    outsideServiceRequestId,
    outsideTaskId,
    outsideTransferId
  });

  const fhirExportDeniedRequests = createFhirExportDeniedRequests({
    outsideAllergyId,
    outsideConditionId,
    outsideConsentId,
    outsideDiagnosticReportId,
    outsideEncounterId,
    outsideImagingStudyId,
    outsideMedicationAdministrationId,
    outsideMedicationDispenseId,
    outsideMedicationRequestId,
    outsideProcedureId,
    outsideServiceRequestId,
    outsideTaskId
  });

  return {
    outsidePatientId,
    listDeniedRequests,
    readDeniedRequests,
    fhirExportDeniedRequests
  };
}
