import type { ClinicalDocument } from "../clinical-document/clinical-document.js";
import type { FhirProvenance } from "./fhir-types.js";
import {
  assertSignedClinicalDocumentForProvenance,
  buildClinicalDocumentProvenanceActivity,
  buildClinicalDocumentProvenanceAgent,
  buildClinicalDocumentProvenanceEntity,
  clinicalDocumentProvenanceFhirProfile,
  normalizeClinicalDocumentProvenancePolicyUris,
  resolveClinicalDocumentProvenanceSignerId
} from "./map-clinical-document-provenance-codings.js";

export type MapClinicalDocumentToFhirProvenanceOptions = {
  readonly organizationId?: string;
  readonly policyUris?: readonly string[];
  readonly recordedAt?: Date;
  readonly signerPractitionerId?: string;
};

export function mapClinicalDocumentToFhirProvenance(
  document: ClinicalDocument,
  options: MapClinicalDocumentToFhirProvenanceOptions = {}
): FhirProvenance {
  const snapshot = document.toSnapshot();

  assertSignedClinicalDocumentForProvenance(snapshot);

  const signerPractitionerId = resolveClinicalDocumentProvenanceSignerId(
    options.signerPractitionerId,
    snapshot.authorPractitionerId
  );

  return {
    resourceType: "Provenance",
    id: `${snapshot.id}-provenance`,
    meta: {
      profile: [clinicalDocumentProvenanceFhirProfile]
    },
    target: [
      {
        reference: `DocumentReference/${snapshot.id}`,
        display: snapshot.title
      }
    ],
    occurredDateTime: snapshot.signedAt,
    recorded: options.recordedAt?.toISOString() ?? snapshot.signedAt,
    policy: normalizeClinicalDocumentProvenancePolicyUris(options.policyUris),
    activity: buildClinicalDocumentProvenanceActivity(),
    agent: [
      buildClinicalDocumentProvenanceAgent(signerPractitionerId, options.organizationId)
    ],
    entity: [buildClinicalDocumentProvenanceEntity(snapshot.storageUri, snapshot.title)]
  };
}
