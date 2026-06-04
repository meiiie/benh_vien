export type DeniedRequest = {
  readonly url: string;
  readonly requestId: string;
};

type OutsideReadDeniedResourceIds = {
  readonly outsideAllergyId: string;
  readonly outsideConditionId: string;
  readonly outsideDiagnosticReportId: string;
  readonly outsideDocumentId: string;
  readonly outsideEncounterId: string;
  readonly outsideImagingStudyId: string;
  readonly outsideMedicationAdministrationId: string;
  readonly outsideMedicationDispenseId: string;
  readonly outsideMedicationRequestId: string;
  readonly outsideObservationId: string;
  readonly outsideProcedureId: string;
  readonly outsideServiceRequestId: string;
  readonly outsideTaskId: string;
  readonly outsideTransferId: string;
};

type OutsideFhirExportDeniedResourceIds = Omit<
  OutsideReadDeniedResourceIds,
  "outsideDocumentId" | "outsideObservationId" | "outsideTransferId"
> & {
  readonly outsideConsentId: string;
};

export function createListDeniedRequests(
  outsidePatientId: string
): readonly DeniedRequest[] {
  return [
    deniedRequest(`/api/v1/patients/${outsidePatientId}/encounters`, "encounter-list-abac-denied-001"),
    deniedRequest(`/api/v1/patients/${outsidePatientId}/allergy-intolerances`, "allergy-list-abac-denied-001"),
    deniedRequest(`/api/v1/patients/${outsidePatientId}/conditions`, "condition-list-abac-denied-001"),
    deniedRequest(`/api/v1/patients/${outsidePatientId}/medication-requests`, "medication-request-list-abac-denied-001"),
    deniedRequest(`/api/v1/patients/${outsidePatientId}/medication-dispenses`, "medication-dispense-list-abac-denied-001"),
    deniedRequest(`/api/v1/patients/${outsidePatientId}/medication-administrations`, "medication-administration-list-abac-denied-001"),
    deniedRequest(`/api/v1/patients/${outsidePatientId}/documents`, "document-list-abac-denied-001"),
    deniedRequest(`/api/v1/patients/${outsidePatientId}/observations`, "observation-list-abac-denied-001"),
    deniedRequest(`/api/v1/patients/${outsidePatientId}/service-requests`, "service-request-list-abac-denied-001"),
    deniedRequest(`/api/v1/patients/${outsidePatientId}/workflow-tasks`, "workflow-task-list-abac-denied-001"),
    deniedRequest(`/api/v1/patients/${outsidePatientId}/procedures`, "procedure-list-abac-denied-001"),
    deniedRequest(`/api/v1/patients/${outsidePatientId}/diagnostic-reports`, "diagnostic-report-list-abac-denied-001"),
    deniedRequest(`/api/v1/patients/${outsidePatientId}/imaging-studies`, "imaging-study-list-abac-denied-001"),
    deniedRequest(`/api/v1/patients/${outsidePatientId}/consents`, "consent-list-abac-denied-001"),
    deniedRequest(`/api/v1/patients/${outsidePatientId}/record-transfers`, "record-transfer-list-abac-denied-001")
  ];
}

export function createReadDeniedRequests(
  ids: OutsideReadDeniedResourceIds
): readonly DeniedRequest[] {
  return [
    deniedRequest(`/api/v1/encounters/${ids.outsideEncounterId}`, "encounter-read-abac-denied-001"),
    deniedRequest(`/api/v1/allergy-intolerances/${ids.outsideAllergyId}`, "allergy-read-abac-denied-001"),
    deniedRequest(`/api/v1/conditions/${ids.outsideConditionId}`, "condition-read-abac-denied-001"),
    deniedRequest(`/api/v1/medication-requests/${ids.outsideMedicationRequestId}`, "medication-request-read-abac-denied-001"),
    deniedRequest(`/api/v1/medication-dispenses/${ids.outsideMedicationDispenseId}`, "medication-dispense-read-abac-denied-001"),
    deniedRequest(`/api/v1/medication-administrations/${ids.outsideMedicationAdministrationId}`, "medication-administration-read-abac-denied-001"),
    deniedRequest(`/api/v1/clinical-documents/${ids.outsideDocumentId}/fhir`, "document-read-abac-denied-001"),
    deniedRequest(`/api/v1/observations/${ids.outsideObservationId}`, "observation-read-abac-denied-001"),
    deniedRequest(`/api/v1/service-requests/${ids.outsideServiceRequestId}`, "service-request-read-abac-denied-001"),
    deniedRequest(`/api/v1/workflow-tasks/${ids.outsideTaskId}`, "workflow-task-read-abac-denied-001"),
    deniedRequest(`/api/v1/procedures/${ids.outsideProcedureId}`, "procedure-read-abac-denied-001"),
    deniedRequest(`/api/v1/diagnostic-reports/${ids.outsideDiagnosticReportId}`, "diagnostic-report-read-abac-denied-001"),
    deniedRequest(`/api/v1/imaging-studies/${ids.outsideImagingStudyId}`, "imaging-study-read-abac-denied-001"),
    deniedRequest(`/api/v1/record-transfers/${ids.outsideTransferId}`, "transfer-read-abac-denied-001")
  ];
}

export function createFhirExportDeniedRequests(
  ids: OutsideFhirExportDeniedResourceIds
): readonly DeniedRequest[] {
  return [
    deniedRequest(`/api/v1/encounters/${ids.outsideEncounterId}/fhir`, "encounter-export-abac-denied-001"),
    deniedRequest(`/api/v1/allergy-intolerances/${ids.outsideAllergyId}/fhir`, "allergy-export-abac-denied-001"),
    deniedRequest(`/api/v1/conditions/${ids.outsideConditionId}/fhir`, "condition-export-abac-denied-001"),
    deniedRequest(`/api/v1/medication-requests/${ids.outsideMedicationRequestId}/fhir`, "medication-request-export-abac-denied-001"),
    deniedRequest(`/api/v1/medication-dispenses/${ids.outsideMedicationDispenseId}/fhir`, "medication-dispense-export-abac-denied-001"),
    deniedRequest(`/api/v1/medication-administrations/${ids.outsideMedicationAdministrationId}/fhir`, "medication-administration-export-abac-denied-001"),
    deniedRequest(`/api/v1/service-requests/${ids.outsideServiceRequestId}/fhir`, "service-request-export-abac-denied-001"),
    deniedRequest(`/api/v1/workflow-tasks/${ids.outsideTaskId}/fhir`, "workflow-task-export-abac-denied-001"),
    deniedRequest(`/api/v1/procedures/${ids.outsideProcedureId}/fhir`, "procedure-export-abac-denied-001"),
    deniedRequest(`/api/v1/diagnostic-reports/${ids.outsideDiagnosticReportId}/fhir`, "diagnostic-report-export-abac-denied-001"),
    deniedRequest(`/api/v1/imaging-studies/${ids.outsideImagingStudyId}/fhir`, "imaging-study-export-abac-denied-001"),
    deniedRequest(`/api/v1/consents/${ids.outsideConsentId}/fhir`, "consent-export-abac-denied-001")
  ];
}

function deniedRequest(url: string, requestId: string): DeniedRequest {
  return {
    url,
    requestId
  };
}
