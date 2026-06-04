import type { PatientSnapshot } from "../patient/patient.types.js";
import type { FhirBundleEntry, FhirComposition } from "./fhir-types.js";

export type PatientRecordCompositionAuthorInput = {
  readonly authorPractitionerId?: string;
};

export function resolvePatientRecordCompositionAuthor(
  input: PatientRecordCompositionAuthorInput,
  entries: readonly FhirBundleEntry[],
  patientSnapshot: PatientSnapshot,
  custodianOrganizationId: string
): string {
  if (
    input.authorPractitionerId &&
    hasBundleResource(entries, "Practitioner", input.authorPractitionerId)
  ) {
    return `Practitioner/${input.authorPractitionerId}`;
  }

  if (hasBundleResource(entries, "Organization", custodianOrganizationId)) {
    return `Organization/${custodianOrganizationId}`;
  }

  return `Patient/${patientSnapshot.id}`;
}

export function buildPatientRecordCompositionCustodian(
  entries: readonly FhirBundleEntry[],
  custodianOrganizationId: string
): FhirComposition["custodian"] {
  return hasBundleResource(entries, "Organization", custodianOrganizationId)
    ? {
        reference: `Organization/${custodianOrganizationId}`
      }
    : undefined;
}

function hasBundleResource(
  entries: readonly FhirBundleEntry[],
  resourceType: FhirBundleEntry["resource"]["resourceType"],
  resourceId: string
): boolean {
  return entries.some(
    (entry) => entry.resource.resourceType === resourceType && entry.resource.id === resourceId
  );
}
