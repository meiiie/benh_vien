import type { FastifyReply } from "fastify";
import { buildFhirOperationOutcome } from "@benh-vien-so/domain";
import type {
  FhirOperationOutcomeIssueCode,
  FhirOperationOutcomeIssueSeverity
} from "@benh-vien-so/domain";

const wiiiCareOutcomeSystem = "urn:wiiicare:nexus:operation-outcome";

export type SendFhirOperationOutcomeInput = {
  readonly statusCode: number;
  readonly code: FhirOperationOutcomeIssueCode;
  readonly severity?: FhirOperationOutcomeIssueSeverity;
  readonly diagnostics?: string;
  readonly expression?: readonly string[];
  readonly details: {
    readonly code: string;
    readonly display?: string;
    readonly text?: string;
  };
};

export function sendFhirOperationOutcome(
  reply: FastifyReply,
  input: SendFhirOperationOutcomeInput
): FastifyReply {
  return reply
    .status(input.statusCode)
    .type("application/fhir+json; charset=utf-8")
    .send(
      buildFhirOperationOutcome({
        issues: [
          {
            code: input.code,
            ...(input.severity ? { severity: input.severity } : {}),
            ...(input.diagnostics ? { diagnostics: input.diagnostics } : {}),
            ...(input.expression?.length ? { expression: input.expression } : {}),
            details: {
              system: wiiiCareOutcomeSystem,
              code: input.details.code,
              display: input.details.display,
              text: input.details.text
            }
          }
        ]
      })
    );
}
