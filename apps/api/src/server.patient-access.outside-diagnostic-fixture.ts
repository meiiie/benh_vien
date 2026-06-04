import type { FastifyInstance } from "fastify";
import { createTreatmentResource } from "./server.patient-access.test-resource.js";

export type OutsideDiagnosticFixture = {
  readonly outsideServiceRequestId: string;
  readonly outsideDiagnosticReportId: string;
  readonly outsideProcedureId: string;
  readonly outsideImagingStudyId: string;
  readonly outsideTaskId: string;
};

export async function createOutsideDiagnosticFixture(
  app: FastifyInstance,
  adminToken: string,
  input: {
    readonly outsidePatientId: string;
    readonly outsideEncounterId: string;
    readonly outsideConditionId: string;
    readonly outsideObservationId: string;
  }
): Promise<OutsideDiagnosticFixture> {
  const outsideServiceRequestId = await createTreatmentResource(
    app,
    adminToken,
    `/api/v1/patients/${input.outsidePatientId}/service-requests`,
    {
      encounterId: input.outsideEncounterId,
      reasonConditionId: input.outsideConditionId,
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
    `/api/v1/patients/${input.outsidePatientId}/diagnostic-reports`,
    {
      encounterId: input.outsideEncounterId,
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
      resultObservationIds: [input.outsideObservationId],
      conclusion: "Outside diagnostic report for ABAC verification."
    }
  );

  const outsideProcedureId = await createTreatmentResource(
    app,
    adminToken,
    `/api/v1/patients/${input.outsidePatientId}/procedures`,
    {
      encounterId: input.outsideEncounterId,
      basedOnServiceRequestId: outsideServiceRequestId,
      reasonConditionId: input.outsideConditionId,
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
    `/api/v1/patients/${input.outsidePatientId}/imaging-studies`,
    {
      encounterId: input.outsideEncounterId,
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
    `/api/v1/patients/${input.outsidePatientId}/workflow-tasks`,
    {
      encounterId: input.outsideEncounterId,
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

  return {
    outsideServiceRequestId,
    outsideDiagnosticReportId,
    outsideProcedureId,
    outsideImagingStudyId,
    outsideTaskId
  };
}
