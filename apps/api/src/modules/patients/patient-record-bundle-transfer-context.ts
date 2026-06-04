import type { FastifyRequest } from "fastify";

export function readBundleTransferContext(
  headers: FastifyRequest["headers"]
):
  | {
      readonly consentReference: string;
      readonly recipientOrganizationId: string;
    }
  | undefined {
  const consentReference = readHeader(headers["x-consent-reference"])?.trim();
  const recipientOrganizationId = readHeader(headers["x-recipient-organization-id"])?.trim();

  if (!consentReference || !recipientOrganizationId) {
    return undefined;
  }

  return {
    consentReference,
    recipientOrganizationId
  };
}

export type PatientRecordBundleTransferContext = NonNullable<
  ReturnType<typeof readBundleTransferContext>
>;

function readHeader(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
