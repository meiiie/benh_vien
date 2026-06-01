import { buildFhirOperationOutcome } from "@benh-vien-so/domain";
import type { ZodError } from "zod";

export function buildValidationOperationOutcome(error: ZodError) {
  return buildFhirOperationOutcome({
    issues: error.issues.map((issue) => {
      const expression = issue.path.map((pathPart) => String(pathPart)).join(".");

      return {
        code: expression ? "invalid" : "structure",
        diagnostics: issue.message,
        ...(expression ? { expression: [expression] } : {}),
        details: {
          system: "urn:wiiicare:nexus:operation-outcome",
          code: "VALIDATION_ERROR",
          display: "Validation error",
          text: "Request validation failed."
        }
      };
    })
  });
}
