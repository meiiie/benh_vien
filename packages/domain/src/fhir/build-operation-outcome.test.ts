import { describe, expect, it } from "vitest";
import { buildFhirOperationOutcome } from "./build-operation-outcome.js";

describe("buildFhirOperationOutcome", () => {
  it("builds an HL7 FHIR R4 OperationOutcome with issue details", () => {
    const outcome = buildFhirOperationOutcome({
      issues: [
        {
          code: "not-found",
          diagnostics: "Không tìm thấy DocumentReference cần xuất.",
          details: {
            system: "urn:wiiicare:nexus:operation-outcome",
            code: "CLINICAL_DOCUMENT_NOT_FOUND",
            display: "Clinical document not found",
            text: "Tài liệu bệnh án không tồn tại."
          },
          expression: ["DocumentReference.id"]
        }
      ]
    });

    expect(outcome).toEqual({
      resourceType: "OperationOutcome",
      issue: [
        {
          severity: "error",
          code: "not-found",
          details: {
            coding: [
              {
                system: "urn:wiiicare:nexus:operation-outcome",
                code: "CLINICAL_DOCUMENT_NOT_FOUND",
                display: "Clinical document not found"
              }
            ],
            text: "Tài liệu bệnh án không tồn tại."
          },
          diagnostics: "Không tìm thấy DocumentReference cần xuất.",
          expression: ["DocumentReference.id"]
        }
      ]
    });
  });
});
