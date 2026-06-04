import type { Procedure } from "../procedure/procedure.js";
import type { FhirProcedure } from "./fhir-types.js";
import {
  buildProcedureCategory,
  buildProcedureIdentifier,
  procedureFhirProfile,
  toFhirProcedurePerformer,
  toProcedureCodeableConcept
} from "./map-procedure-codings.js";

export function mapProcedureToFhir(procedure: Procedure): FhirProcedure {
  const snapshot = procedure.toSnapshot();

  return {
    resourceType: "Procedure",
    id: snapshot.id,
    meta: {
      profile: [procedureFhirProfile]
    },
    identifier: [buildProcedureIdentifier(snapshot.id)],
    basedOn: snapshot.basedOnServiceRequestId
      ? [
          {
            reference: `ServiceRequest/${snapshot.basedOnServiceRequestId}`
          }
        ]
      : undefined,
    partOf: snapshot.partOfProcedureId
      ? [
          {
            reference: `Procedure/${snapshot.partOfProcedureId}`
          }
        ]
      : undefined,
    status: snapshot.status,
    statusReason: snapshot.statusReason
      ? toProcedureCodeableConcept(snapshot.statusReason)
      : undefined,
    category: buildProcedureCategory(snapshot.category),
    code: toProcedureCodeableConcept(snapshot.code),
    subject: {
      reference: `Patient/${snapshot.patientId}`
    },
    encounter: snapshot.encounterId
      ? {
          reference: `Encounter/${snapshot.encounterId}`
        }
      : undefined,
    performedPeriod: snapshot.performedPeriod,
    recorder: snapshot.recorderPractitionerId
      ? {
          reference: `Practitioner/${snapshot.recorderPractitionerId}`
        }
      : undefined,
    asserter: snapshot.asserterPractitionerId
      ? {
          reference: `Practitioner/${snapshot.asserterPractitionerId}`
        }
      : undefined,
    performer:
      snapshot.performers.length > 0
        ? snapshot.performers.map(toFhirProcedurePerformer)
        : undefined,
    reasonReference: snapshot.reasonConditionId
      ? [
          {
            reference: `Condition/${snapshot.reasonConditionId}`
          }
        ]
      : undefined,
    bodySite: snapshot.bodySite
      ? [toProcedureCodeableConcept(snapshot.bodySite)]
      : undefined,
    outcome: snapshot.outcome ? toProcedureCodeableConcept(snapshot.outcome) : undefined,
    report:
      snapshot.reportReferences.length > 0
        ? snapshot.reportReferences.map((reference) => ({
            reference: `${reference.resourceType}/${reference.id}`
          }))
        : undefined,
    note: snapshot.note ? [{ text: snapshot.note }] : undefined
  };
}
