import type {
  ImagingStudyCoding,
  ImagingStudySeries
} from "../imaging-study/imaging-study.types.js";
import type { FhirImagingStudy } from "./fhir-types.js";

export const imagingStudyFhirProfile =
  "http://hl7.org/fhir/StructureDefinition/ImagingStudy";

export function buildImagingStudyIdentifiers(
  studyInstanceUid: string,
  accessionNumber?: string
): FhirImagingStudy["identifier"] {
  return [
    {
      system: "urn:dicom:uid",
      value: toDicomUidIdentifierValue(studyInstanceUid),
      type: {
        text: "DICOM Study Instance UID"
      }
    },
    ...(accessionNumber
      ? [
          {
            system: "urn:wiiicare:nexus:accession-number",
            value: accessionNumber,
            type: {
              text: "Accession Number"
            }
          }
        ]
      : [])
  ];
}

export function uniqueImagingStudyModalities(
  codings: readonly ImagingStudyCoding[]
): NonNullable<FhirImagingStudy["modality"]> {
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

export function toFhirImagingStudySeries(
  series: ImagingStudySeries
): NonNullable<FhirImagingStudy["series"]>[number] {
  return {
    uid: series.uid,
    number: series.number,
    modality: series.modality,
    description: series.description,
    numberOfInstances: series.numberOfInstances,
    bodySite: series.bodySite,
    started: series.startedAt
  };
}

function toDicomUidIdentifierValue(uid: string): string {
  return uid.startsWith("urn:oid:") ? uid : `urn:oid:${uid}`;
}
