

export type FhirOperationOutcomeIssueCode =
  | "invalid"
  | "structure"
  | "required"
  | "value"
  | "invariant"
  | "security"
  | "login"
  | "unknown"
  | "expired"
  | "forbidden"
  | "suppressed"
  | "processing"
  | "not-supported"
  | "duplicate"
  | "multiple-matches"
  | "not-found"
  | "deleted"
  | "too-long"
  | "code-invalid"
  | "extension"
  | "too-costly"
  | "business-rule"
  | "conflict"
  | "transient"
  | "lock-error"
  | "no-store"
  | "exception"
  | "timeout"
  | "incomplete"
  | "throttled"
  | "informational";

export type FhirOperationOutcome = {
  readonly resourceType: "OperationOutcome";
  readonly issue: readonly {
    readonly severity: FhirOperationOutcomeIssueSeverity;
    readonly code: FhirOperationOutcomeIssueCode;
    readonly details?: {
      readonly coding?: readonly {
        readonly system: string;
        readonly code: string;
        readonly display?: string;
      }[];
      readonly text?: string;
    };
    readonly diagnostics?: string;
    readonly expression?: readonly string[];
  }[];
};

export type FhirOperationOutcomeIssueSeverity =
  | "fatal"
  | "error"
  | "warning"
  | "information";
