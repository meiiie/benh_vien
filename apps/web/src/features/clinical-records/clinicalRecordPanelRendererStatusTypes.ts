export type ClinicalRecordLoadingState = {
  readonly allergyIntolerances: boolean;
  readonly conditions: boolean;
  readonly diagnosticReports: boolean;
  readonly encounters: boolean;
  readonly imagingStudies: boolean;
  readonly medicationAdministrations: boolean;
  readonly medicationDispenses: boolean;
  readonly medicationRequests: boolean;
  readonly observations: boolean;
  readonly procedures: boolean;
  readonly serviceRequests: boolean;
  readonly workflowTasks: boolean;
};

export type ClinicalRecordSubmittingState = {
  readonly allergyIntolerance: boolean;
  readonly condition: boolean;
  readonly diagnosticReport: boolean;
  readonly encounter: boolean;
  readonly imagingStudy: boolean;
  readonly medicationAdministration: boolean;
  readonly medicationDispense: boolean;
  readonly medicationRequest: boolean;
  readonly observation: boolean;
  readonly procedure: boolean;
  readonly serviceRequest: boolean;
};
