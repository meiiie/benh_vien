import type { FastifyReply, FastifyRequest } from "fastify";
import type { ConsentRepository } from "@benh-vien-so/domain";
import {
  sendInvalidConsentResponse,
  sendMissingTransferContextResponse,
  type PatientRecordBundleType
} from "./patient-record-bundle-error-responses.js";
import { readBundleTransferContext } from "./patient-record-bundle-transfer-context.js";

type PreparePatientRecordBundleConsentContextInput = {
  readonly request: FastifyRequest;
  readonly reply: FastifyReply;
  readonly patientId: string;
  readonly consentRepository: ConsentRepository;
  readonly bundleType: PatientRecordBundleType;
};

export async function preparePatientRecordBundleConsentContext({
  request,
  reply,
  patientId,
  consentRepository,
  bundleType
}: PreparePatientRecordBundleConsentContextInput) {
  const transferContext = readBundleTransferContext(request.headers);

  if (!transferContext) {
    sendMissingTransferContextResponse(reply, bundleType);
    return undefined;
  }

  const consent = await consentRepository.findById(transferContext.consentReference);

  if (
    !consent?.allowsRecordSharing({
      patientId,
      granteeOrganizationId: transferContext.recipientOrganizationId
    })
  ) {
    sendInvalidConsentResponse(reply, bundleType);
    return undefined;
  }

  return {
    transferContext,
    consent
  };
}
