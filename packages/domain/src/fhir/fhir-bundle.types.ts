import type { FhirAuditEvent } from "./fhir-audit.types.js";
import type { FhirProcedure, FhirServiceRequest, FhirTask } from "./fhir-careflow.types.js";
import type {
  FhirAllergyIntolerance,
  FhirCondition,
  FhirEncounter,
  FhirObservation
} from "./fhir-clinical-core.types.js";
import type { FhirDiagnosticReport, FhirImagingStudy } from "./fhir-diagnostics.types.js";
import type { FhirComposition, FhirDocumentReference, FhirProvenance } from "./fhir-document.types.js";
import type {
  FhirMedicationAdministration,
  FhirMedicationDispense,
  FhirMedicationRequest
} from "./fhir-medication.types.js";
import type { FhirPatient } from "./fhir-patient.types.js";
import type { FhirConsent } from "./fhir-privacy.types.js";
import type {
  FhirEndpoint,
  FhirOrganization,
  FhirPractitioner,
  FhirPractitionerRole
} from "./fhir-provider.types.js";

export type FhirBundleEntry = {
  readonly fullUrl: string;
  readonly resource:
    | FhirComposition
    | FhirOrganization
    | FhirPractitioner
    | FhirPractitionerRole
    | FhirEndpoint
    | FhirPatient
    | FhirConsent
    | FhirAuditEvent
    | FhirEncounter
    | FhirCondition
    | FhirObservation
    | FhirAllergyIntolerance
    | FhirMedicationRequest
    | FhirMedicationDispense
    | FhirMedicationAdministration
    | FhirServiceRequest
    | FhirTask
    | FhirProcedure
    | FhirDiagnosticReport
    | FhirImagingStudy
    | FhirDocumentReference
    | FhirProvenance;
};

export type FhirBundle = {
  readonly resourceType: "Bundle";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly identifier?: {
    readonly system: string;
    readonly value: string;
  };
  readonly type: "collection" | "document";
  readonly timestamp: string;
  readonly entry: readonly FhirBundleEntry[];
};
