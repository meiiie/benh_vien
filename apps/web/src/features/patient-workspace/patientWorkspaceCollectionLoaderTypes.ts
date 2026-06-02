import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type { AllergyIntolerance } from "../../types/allergies.js";
import type {
  Procedure,
  ServiceRequest,
  WorkflowTask
} from "../../types/careWorkflow.js";
import type { ClinicalDocument } from "../../types/clinicalDocuments.js";
import type { Condition } from "../../types/conditions.js";
import type {
  DiagnosticReport,
  ImagingStudy
} from "../../types/diagnosticResults.js";
import type { Encounter } from "../../types/encounters.js";
import type {
  MedicationAdministration,
  MedicationDispense,
  MedicationRequest
} from "../../types/medications.js";
import type { Observation } from "../../types/observations.js";

type SetItems<Item> = (items: readonly Item[]) => void;
type SetLoading = (isLoading: boolean) => void;
type SetSelectedId = (id: string | undefined) => void;
type SetStatusMessage = (message: string) => void;

export type PatientWorkspaceCollectionLoaderConfig = {
  readonly clinicalApi: ClinicalApiClient;
  readonly setAllergyIntolerances: SetItems<AllergyIntolerance>;
  readonly setClinicalDocuments: SetItems<ClinicalDocument>;
  readonly setConditions: SetItems<Condition>;
  readonly setDiagnosticReports: SetItems<DiagnosticReport>;
  readonly setEncounters: SetItems<Encounter>;
  readonly setImagingStudies: SetItems<ImagingStudy>;
  readonly setIsLoadingAllergyIntolerances: SetLoading;
  readonly setIsLoadingConditions: SetLoading;
  readonly setIsLoadingDiagnosticReports: SetLoading;
  readonly setIsLoadingDocuments: SetLoading;
  readonly setIsLoadingEncounters: SetLoading;
  readonly setIsLoadingImagingStudies: SetLoading;
  readonly setIsLoadingMedicationAdministrations: SetLoading;
  readonly setIsLoadingMedicationDispenses: SetLoading;
  readonly setIsLoadingMedicationRequests: SetLoading;
  readonly setIsLoadingObservations: SetLoading;
  readonly setIsLoadingProcedures: SetLoading;
  readonly setIsLoadingServiceRequests: SetLoading;
  readonly setIsLoadingWorkflowTasks: SetLoading;
  readonly setMedicationAdministrations: SetItems<MedicationAdministration>;
  readonly setMedicationDispenses: SetItems<MedicationDispense>;
  readonly setMedicationRequests: SetItems<MedicationRequest>;
  readonly setObservations: SetItems<Observation>;
  readonly setProcedures: SetItems<Procedure>;
  readonly setSelectedAllergyIntoleranceId: SetSelectedId;
  readonly setSelectedConditionId: SetSelectedId;
  readonly setSelectedDiagnosticReportId: SetSelectedId;
  readonly setSelectedDocumentId: SetSelectedId;
  readonly setSelectedEncounterId: SetSelectedId;
  readonly setSelectedImagingStudyId: SetSelectedId;
  readonly setSelectedMedicationAdministrationId: SetSelectedId;
  readonly setSelectedMedicationDispenseId: SetSelectedId;
  readonly setSelectedMedicationRequestId: SetSelectedId;
  readonly setSelectedObservationId: SetSelectedId;
  readonly setSelectedProcedureId: SetSelectedId;
  readonly setSelectedServiceRequestId: SetSelectedId;
  readonly setSelectedWorkflowTaskId: SetSelectedId;
  readonly setServiceRequests: SetItems<ServiceRequest>;
  readonly setStatusMessage: SetStatusMessage;
  readonly setWorkflowTasks: SetItems<WorkflowTask>;
};
