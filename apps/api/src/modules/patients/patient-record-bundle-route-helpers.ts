import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ActorContext,
  ConsentRepository,
  PatientRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccess
} from "../access-control/access-context.js";
import {
  loadPatientRecordBundleCollections
} from "./patient-record-bundle-collections.js";
import type { LoadPatientRecordBundleCollectionsInput } from "./patient-record-bundle-collections.js";
import {
  sendInvalidConsentResponse,
  sendMissingPatientResponse,
  sendMissingTransferContextResponse
} from "./patient-record-bundle-error-responses.js";
import type { PatientRecordBundleType } from "./patient-record-bundle-error-responses.js";
import {
  readBundleTransferContext
} from "./patient-record-bundle-transfer-context.js";

type PreparePatientRecordBundleContextInput =
  LoadPatientRecordBundleCollectionsInput & {
    readonly request: FastifyRequest;
    readonly reply: FastifyReply;
    readonly actor: ActorContext;
    readonly patientId: string;
    readonly patientRepository: PatientRepository;
    readonly consentRepository: ConsentRepository;
    readonly bundleType: PatientRecordBundleType;
  };

export async function preparePatientRecordBundleContext({
  request,
  reply,
  actor,
  patientId,
  patientRepository,
  consentRepository,
  bundleType,
  ...collectionDependencies
}: PreparePatientRecordBundleContextInput) {
  const patient = await patientRepository.findById(patientId);

  if (!patient) {
    sendMissingPatientResponse(reply, patientId, bundleType);
    return undefined;
  }

  if (
    !(await requirePatientRecordAccess(
      request,
      reply,
      actor,
      patient,
      collectionDependencies.providerDirectoryRepository
    ))
  ) {
    return undefined;
  }

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

  const collections = await loadPatientRecordBundleCollections({
    patientId,
    ...collectionDependencies
  });

  return {
    patient,
    transferContext,
    consent,
    collections
  };
}
