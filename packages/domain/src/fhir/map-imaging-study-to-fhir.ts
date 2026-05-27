import type { ImagingStudy, ImagingStudyCoding } from "../imaging-study/imaging-study.js";
import type { FhirImagingStudy } from "./fhir-types.js";

export function mapImagingStudyToFhir(imagingStudy: ImagingStudy): FhirImagingStudy {
  const snapshot = imagingStudy.toSnapshot();
  const modalityCodings = uniqueCodings(snapshot.series.map((series) => series.modality));

  return {
    resourceType: "ImagingStudy",
    id: snapshot.id,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/ImagingStudy"]
    },
    identifier: [
      {
        system: "urn:dicom:uid",
        value: toDicomUidIdentifierValue(snapshot.studyInstanceUid),
        type: {
          text: "DICOM Study Instance UID"
        }
      },
      ...(snapshot.accessionNumber
        ? [
            {
              system: "urn:wiiicare:nexus:accession-number",
              value: snapshot.accessionNumber,
              type: {
                text: "Accession Number"
              }
            }
          ]
        : [])
    ],
    status: snapshot.status,
    modality: modalityCodings,
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
    series: snapshot.series.map((series) => ({
      uid: series.uid,
      number: series.number,
      modality: series.modality,
      description: series.description,
      numberOfInstances: series.numberOfInstances,
      bodySite: series.bodySite,
      started: series.startedAt
    }))
  };
}

function uniqueCodings(codings: readonly ImagingStudyCoding[]): readonly ImagingStudyCoding[] {
  const seen = new Set<string>();
  const unique: ImagingStudyCoding[] = [];

  for (const coding of codings) {
    const key = `${coding.system}|${coding.code}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(coding);
  }

  return unique;
}

function toDicomUidIdentifierValue(uid: string): string {
  return uid.startsWith("urn:oid:") ? uid : `urn:oid:${uid}`;
}
