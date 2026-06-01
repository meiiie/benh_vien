import {
  requirePatientRecordAccess
} from "../access-control/access-context.js";
import {
  loadPatientRecordBundleCollections
} from "./patient-record-bundle-collections.js";
import {
  sendMissingPatientResponse
} from "./patient-record-bundle-error-responses.js";
import {
  preparePatientRecordBundleConsentContext
} from "./patient-record-bundle-consent-context.js";
import type { PreparePatientRecordBundleContextInput } from "./patient-record-bundle-context.types.js";

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

  const consentContext = await preparePatientRecordBundleConsentContext({
    request,
    reply,
    patientId,
    consentRepository,
    bundleType
  });

  if (!consentContext) {
    return undefined;
  }

  const collections = await loadPatientRecordBundleCollections({
    patientId,
    ...collectionDependencies
  });

  return {
    patient,
    transferContext: consentContext.transferContext,
    consent: consentContext.consent,
    collections
  };
}
