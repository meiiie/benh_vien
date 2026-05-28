import type {
  FhirOperationOutcome,
  FhirOperationOutcomeIssueCode,
  FhirOperationOutcomeIssueSeverity
} from "./fhir-types.js";

export type BuildFhirOperationOutcomeIssueInput = {
  readonly severity?: FhirOperationOutcomeIssueSeverity;
  readonly code: FhirOperationOutcomeIssueCode;
  readonly diagnostics?: string;
  readonly expression?: readonly string[];
  readonly details?: {
    readonly system?: string;
    readonly code?: string;
    readonly display?: string;
    readonly text?: string;
  };
};

export type BuildFhirOperationOutcomeInput = {
  readonly issues: readonly BuildFhirOperationOutcomeIssueInput[];
};

export function buildFhirOperationOutcome(
  input: BuildFhirOperationOutcomeInput
): FhirOperationOutcome {
  return {
    resourceType: "OperationOutcome",
    issue: input.issues.map((issue) => ({
      severity: issue.severity ?? "error",
      code: issue.code,
      ...(issue.details
        ? {
            details: {
              ...(issue.details.system && issue.details.code
                ? {
                    coding: [
                      {
                        system: issue.details.system,
                        code: issue.details.code,
                        ...(issue.details.display ? { display: issue.details.display } : {})
                      }
                    ]
                  }
                : {}),
              ...(issue.details.text ? { text: issue.details.text } : {})
            }
          }
        : {}),
      ...(issue.diagnostics ? { diagnostics: issue.diagnostics } : {}),
      ...(issue.expression?.length ? { expression: issue.expression } : {})
    }))
  };
}
