import type { FastifyInstance } from "fastify";
import {
  createFhirExportDeniedRequests,
  createListDeniedRequests,
  createReadDeniedRequests,
  type DeniedRequest
} from "./server.patient-access.denied-request-catalog.js";
import { createOutsideClinicalFixture } from "./server.patient-access.outside-clinical-fixture.js";
import { createOutsideDiagnosticFixture } from "./server.patient-access.outside-diagnostic-fixture.js";
import { createOutsideMedicationFixture } from "./server.patient-access.outside-medication-fixture.js";
import { createOutsidePatient } from "./server.patient-access.patient-fixture.js";
import { createOutsideSharingFixture } from "./server.patient-access.outside-sharing-fixture.js";

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
  const clinical = await createOutsideClinicalFixture(
    app,
    adminToken,
    outsidePatientId
  );
  const medication = await createOutsideMedicationFixture(app, adminToken, {
    outsidePatientId,
    outsideEncounterId: clinical.outsideEncounterId,
    outsideConditionId: clinical.outsideConditionId
  });
  const diagnostic = await createOutsideDiagnosticFixture(app, adminToken, {
    outsidePatientId,
    outsideEncounterId: clinical.outsideEncounterId,
    outsideConditionId: clinical.outsideConditionId,
    outsideObservationId: clinical.outsideObservationId
  });
  const sharing = await createOutsideSharingFixture(
    app,
    adminToken,
    outsidePatientId
  );

  const readDeniedRequests = createReadDeniedRequests({
    outsideAllergyId: clinical.outsideAllergyId,
    outsideConditionId: clinical.outsideConditionId,
    outsideDiagnosticReportId: diagnostic.outsideDiagnosticReportId,
    outsideDocumentId: clinical.outsideDocumentId,
    outsideEncounterId: clinical.outsideEncounterId,
    outsideImagingStudyId: diagnostic.outsideImagingStudyId,
    outsideMedicationAdministrationId:
      medication.outsideMedicationAdministrationId,
    outsideMedicationDispenseId: medication.outsideMedicationDispenseId,
    outsideMedicationRequestId: medication.outsideMedicationRequestId,
    outsideObservationId: clinical.outsideObservationId,
    outsideProcedureId: diagnostic.outsideProcedureId,
    outsideServiceRequestId: diagnostic.outsideServiceRequestId,
    outsideTaskId: diagnostic.outsideTaskId,
    outsideTransferId: sharing.outsideTransferId
  });

  const fhirExportDeniedRequests = createFhirExportDeniedRequests({
    outsideAllergyId: clinical.outsideAllergyId,
    outsideConditionId: clinical.outsideConditionId,
    outsideConsentId: sharing.outsideConsentId,
    outsideDiagnosticReportId: diagnostic.outsideDiagnosticReportId,
    outsideEncounterId: clinical.outsideEncounterId,
    outsideImagingStudyId: diagnostic.outsideImagingStudyId,
    outsideMedicationAdministrationId:
      medication.outsideMedicationAdministrationId,
    outsideMedicationDispenseId: medication.outsideMedicationDispenseId,
    outsideMedicationRequestId: medication.outsideMedicationRequestId,
    outsideProcedureId: diagnostic.outsideProcedureId,
    outsideServiceRequestId: diagnostic.outsideServiceRequestId,
    outsideTaskId: diagnostic.outsideTaskId
  });

  return {
    outsidePatientId,
    listDeniedRequests,
    readDeniedRequests,
    fhirExportDeniedRequests
  };
}
