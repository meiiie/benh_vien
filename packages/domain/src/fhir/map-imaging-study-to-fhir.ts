import type { ImagingStudy } from "../imaging-study/imaging-study.js";
import type { FhirImagingStudy } from "./fhir-types.js";
import {
  buildImagingStudyIdentifiers,
  imagingStudyFhirProfile,
  toFhirImagingStudySeries,
  uniqueImagingStudyModalities
} from "./map-imaging-study-codings.js";

export function mapImagingStudyToFhir(imagingStudy: ImagingStudy): FhirImagingStudy {
  const snapshot = imagingStudy.toSnapshot();

  return {
    resourceType: "ImagingStudy",
    id: snapshot.id,
    meta: {
      profile: [imagingStudyFhirProfile]
    },
    identifier: buildImagingStudyIdentifiers(
      snapshot.studyInstanceUid,
      snapshot.accessionNumber
    ),
    status: snapshot.status,
    modality: uniqueImagingStudyModalities(snapshot.series.map((series) => series.modality)),
    subject: {
      reference: `Patient/${snapshot.patientId}`
    },
    encounter: snapshot.encounterId
      ? {
          reference: `Encounter/${snapshot.encounterId}`
        }
      : undefined,
    started: snapshot.startedAt,
    basedOn: snapshot.basedOnServiceRequestId
      ? [
          {
            reference: `ServiceRequest/${snapshot.basedOnServiceRequestId}`
          }
        ]
      : undefined,
    referrer: snapshot.referrerPractitionerId
      ? {
          reference: `Practitioner/${snapshot.referrerPractitionerId}`
        }
      : undefined,
    interpreter: snapshot.interpreterPractitionerId
      ? [
          {
            reference: `Practitioner/${snapshot.interpreterPractitionerId}`
          }
        ]
      : undefined,
    endpoint: snapshot.endpointId
      ? [
          {
            reference: `Endpoint/${snapshot.endpointId}`
          }
        ]
      : undefined,
    numberOfSeries: snapshot.numberOfSeries,
    numberOfInstances: snapshot.numberOfInstances,
    description: snapshot.description,
    series: snapshot.series.map(toFhirImagingStudySeries)
  };
}
