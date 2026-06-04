import type {
  ClinicalDocument,
  ClinicalDocumentSnapshot
} from "@benh-vien-so/domain";

export function toClinicalDocumentResponse(
  document: ClinicalDocument
): ClinicalDocumentSnapshot {
  return document.toSnapshot();
}
